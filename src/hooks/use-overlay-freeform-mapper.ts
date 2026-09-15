"use client";

/**
 * MapLibre georef adapter for HotspotMapper-style freeform box editing.
 * Vendored upstream: public/vendor/hotspot-mapper/ (npm run overlay:mapper)
 */
import { useEffect, useRef, type RefObject } from "react";
import * as maplibregl from "maplibre-gl";
import {
  getCoordinatesCenter,
  getEdgeMidpoint,
  translateCoordinates,
  rotateCoordinatesAroundCenter,
  pointInQuad,
  coordinatesToFrameGeoJson,
  type OverlayCoordinates,
} from "@/lib/overlay-georef";

const CORNER_LABELS = ["NW", "NE", "SE", "SW"] as const;
const FRAME_SOURCE = "overlay-quad-frame";
const FRAME_LINE = "overlay-quad-frame-line";
const FRAME_FILL = "overlay-quad-frame-fill";

function cloneCoords(coords: OverlayCoordinates): OverlayCoordinates {
  return coords.map(([lng, lat]) => [lng, lat]) as OverlayCoordinates;
}

function makeHandle(className: string, label: string, title: string) {
  const el = document.createElement("button");
  el.type = "button";
  el.title = title;
  el.className = className;
  if (label) el.textContent = label;
  return el;
}

function getRotateHandleLngLat(
  map: maplibregl.Map,
  coords: OverlayCoordinates
): [number, number] {
  const center = getCoordinatesCenter(coords);
  const centerPx = map.project(center);
  const ll = map.unproject([centerPx.x, centerPx.y - 48]);
  return [ll.lng, ll.lat];
}

function removeFrameLayers(map: maplibregl.Map) {
  if (map.getLayer(FRAME_FILL)) map.removeLayer(FRAME_FILL);
  if (map.getLayer(FRAME_LINE)) map.removeLayer(FRAME_LINE);
  if (map.getSource(FRAME_SOURCE)) map.removeSource(FRAME_SOURCE);
}

export function useOverlayFreeformMapper(
  mapRef: RefObject<maplibregl.Map | null>,
  enabled: boolean,
  mapReady: boolean,
  coordinates: OverlayCoordinates,
  onCoordinatesChange: (coords: OverlayCoordinates) => void,
  onDragLive?: (coords: OverlayCoordinates) => void
) {
  const markersRef = useRef<
    { marker: maplibregl.Marker; role: string; index?: number }[]
  >([]);
  const coordsRef = useRef(coordinates);
  const draggingRef = useRef(false);
  const shiftRef = useRef(false);

  coordsRef.current = coordinates;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") shiftRef.current = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") shiftRef.current = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !enabled || !mapReady) {
      if (map) removeFrameLayers(map);
      return;
    }

    const syncFrame = () => {
      if (!map.getStyle()) return;
      const data = coordinatesToFrameGeoJson(coordsRef.current);
      if (!map.getSource(FRAME_SOURCE)) {
        map.addSource(FRAME_SOURCE, { type: "geojson", data });
        const beforeId = map.getLayer("poi-circles") ? "poi-circles" : undefined;
        map.addLayer(
          {
            id: FRAME_FILL,
            type: "fill",
            source: FRAME_SOURCE,
            paint: { "fill-color": "#39ff14", "fill-opacity": 0.07 },
          },
          beforeId
        );
        map.addLayer(
          {
            id: FRAME_LINE,
            type: "line",
            source: FRAME_SOURCE,
            paint: {
              "line-color": "#39ff14",
              "line-width": 2,
              "line-dasharray": [2, 2],
              "line-opacity": 0.9,
            },
          },
          beforeId
        );
      } else {
        (map.getSource(FRAME_SOURCE) as maplibregl.GeoJSONSource).setData(data);
      }
    };

    syncFrame();
    return () => removeFrameLayers(map);
  }, [coordinates, mapRef, enabled, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !enabled || !mapReady) return;

    let bodyDrag: { start: maplibregl.LngLat; coords: OverlayCoordinates } | null = null;

    const onMouseDown = (e: maplibregl.MapMouseEvent) => {
      if (draggingRef.current) return;
      const { lng, lat } = e.lngLat;
      if (!pointInQuad(lng, lat, coordsRef.current)) return;
      bodyDrag = { start: e.lngLat, coords: cloneCoords(coordsRef.current) };
      map.dragPan.disable();
      map.getCanvas().style.cursor = "grabbing";
    };

    const onMouseMove = (e: maplibregl.MapMouseEvent) => {
      if (!bodyDrag) return;
      const dLng = e.lngLat.lng - bodyDrag.start.lng;
      const dLat = e.lngLat.lat - bodyDrag.start.lat;
      const next = translateCoordinates(bodyDrag.coords, dLng, dLat);
      coordsRef.current = next;
      onDragLive?.(next);
    };

    const endBodyDrag = () => {
      if (!bodyDrag) return;
      onCoordinatesChange(coordsRef.current);
      bodyDrag = null;
      map.dragPan.enable();
      map.getCanvas().style.cursor = "";
    };

    const onWindowMouseUp = () => endBodyDrag();

    map.on("mousedown", onMouseDown);
    map.on("mousemove", onMouseMove);
    map.on("mouseup", endBodyDrag);
    window.addEventListener("mouseup", onWindowMouseUp);

    return () => {
      map.off("mousedown", onMouseDown);
      map.off("mousemove", onMouseMove);
      map.off("mouseup", endBodyDrag);
      window.removeEventListener("mouseup", onWindowMouseUp);
      map.dragPan.enable();
    };
  }, [enabled, mapReady, mapRef, onCoordinatesChange, onDragLive]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !enabled || !mapReady) {
      markersRef.current.forEach(({ marker }) => marker.remove());
      markersRef.current = [];
      return;
    }

    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current = [];

    const live = (next: OverlayCoordinates) => {
      coordsRef.current = next;
      onDragLive?.(next);
    };

    const final = (next: OverlayCoordinates) => {
      coordsRef.current = next;
      onCoordinatesChange(next);
    };

    const disablePan = () => {
      draggingRef.current = true;
      map.dragPan.disable();
    };
    const enablePan = () => {
      draggingRef.current = false;
      map.dragPan.enable();
    };

    coordsRef.current.forEach(([lng, lat], i) => {
      const el = makeHandle(
        "overlay-handle overlay-handle--corner flex h-9 w-9 cursor-grab items-center justify-center rounded-full border-2 border-[#39ff14] bg-black/90 text-[10px] font-black text-[#39ff14] shadow-lg active:cursor-grabbing touch-none",
        CORNER_LABELS[i],
        `Drag ${CORNER_LABELS[i]} corner`
      );
      el.addEventListener("mousedown", (e) => e.stopPropagation());
      el.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });

      const marker = new maplibregl.Marker({ element: el, draggable: true })
        .setLngLat([lng, lat])
        .addTo(map);

      const readCorner = () => {
        const pos = marker.getLngLat();
        const next = cloneCoords(coordsRef.current);
        next[i] = [pos.lng, pos.lat];
        return next;
      };

      marker.on("dragstart", disablePan);
      marker.on("drag", () => live(readCorner()));
      marker.on("dragend", () => {
        enablePan();
        final(readCorner());
      });

      markersRef.current.push({ marker, role: "corner", index: i });
    });

    const centerEl = makeHandle(
      "overlay-handle overlay-handle--move flex h-10 w-10 cursor-move items-center justify-center rounded-full border-2 border-[#7eb8d4] bg-black/85 text-base font-black text-[#7eb8d4] shadow-lg touch-none",
      "✥",
      "Drag to move entire overlay"
    );
    centerEl.addEventListener("mousedown", (e) => e.stopPropagation());

    const centerMarker = new maplibregl.Marker({ element: centerEl, draggable: true })
      .setLngLat(getCoordinatesCenter(coordsRef.current))
      .addTo(map);

    let centerStart: { lng: number; lat: number; coords: OverlayCoordinates } | null = null;

    centerMarker.on("dragstart", () => {
      disablePan();
      const pos = centerMarker.getLngLat();
      centerStart = { lng: pos.lng, lat: pos.lat, coords: cloneCoords(coordsRef.current) };
    });
    centerMarker.on("drag", () => {
      if (!centerStart) return;
      const pos = centerMarker.getLngLat();
      const dLng = pos.lng - centerStart.lng;
      const dLat = pos.lat - centerStart.lat;
      const next = translateCoordinates(centerStart.coords, dLng, dLat);
      centerMarker.setLngLat(getCoordinatesCenter(next));
      live(next);
    });
    centerMarker.on("dragend", () => {
      centerStart = null;
      enablePan();
      final(coordsRef.current);
    });
    markersRef.current.push({ marker: centerMarker, role: "center" });

    const rotateEl = makeHandle(
      "overlay-handle overlay-handle--rotate flex h-8 w-8 cursor-grab items-center justify-center rounded-full border-2 border-[#e8bc55] bg-black/90 text-xs font-black text-[#e8bc55] shadow-lg active:cursor-grabbing touch-none",
      "↻",
      "Drag to rotate (hold Shift for 15° snap)"
    );
    rotateEl.addEventListener("mousedown", (e) => e.stopPropagation());

    const rotateMarker = new maplibregl.Marker({ element: rotateEl, draggable: true })
      .setLngLat(getRotateHandleLngLat(map, coordsRef.current))
      .addTo(map);

    let rotateStart: {
      angle: number;
      coords: OverlayCoordinates;
      center: [number, number];
    } | null = null;

    rotateMarker.on("dragstart", () => {
      disablePan();
      const center = getCoordinatesCenter(coordsRef.current);
      const pos = rotateMarker.getLngLat();
      rotateStart = {
        angle: Math.atan2(pos.lat - center[1], pos.lng - center[0]),
        coords: cloneCoords(coordsRef.current),
        center,
      };
    });
    rotateMarker.on("drag", () => {
      if (!rotateStart) return;
      const pos = rotateMarker.getLngLat();
      let deltaDeg =
        ((Math.atan2(pos.lat - rotateStart.center[1], pos.lng - rotateStart.center[0]) -
          rotateStart.angle) *
          180) /
        Math.PI;
      if (shiftRef.current) {
        deltaDeg = Math.round(deltaDeg / 15) * 15;
      }
      const next = rotateCoordinatesAroundCenter(rotateStart.coords, deltaDeg, rotateStart.center);
      rotateMarker.setLngLat(getRotateHandleLngLat(map, next));
      live(next);
    });
    rotateMarker.on("dragend", () => {
      rotateStart = null;
      enablePan();
      final(coordsRef.current);
    });
    markersRef.current.push({ marker: rotateMarker, role: "rotate" });

    for (let edge = 0; edge < 4; edge++) {
      const [mLng, mLat] = getEdgeMidpoint(coordsRef.current, edge as 0 | 1 | 2 | 3);
      const edgeEl = makeHandle(
        "overlay-handle overlay-handle--edge h-5 w-5 cursor-grab rounded-full border border-[#39ff14]/80 bg-black/85 touch-none",
        "",
        "Drag edge (moves both corners on this side)"
      );
      edgeEl.addEventListener("mousedown", (e) => e.stopPropagation());

      const edgeMarker = new maplibregl.Marker({ element: edgeEl, draggable: true })
        .setLngLat([mLng, mLat])
        .addTo(map);

      const cornerA = edge;
      const cornerB = (edge + 1) % 4;
      let edgeStart: { lng: number; lat: number; coords: OverlayCoordinates } | null = null;

      edgeMarker.on("dragstart", () => {
        disablePan();
        const pos = edgeMarker.getLngLat();
        edgeStart = { lng: pos.lng, lat: pos.lat, coords: cloneCoords(coordsRef.current) };
      });
      edgeMarker.on("drag", () => {
        if (!edgeStart) return;
        const pos = edgeMarker.getLngLat();
        const dLng = pos.lng - edgeStart.lng;
        const dLat = pos.lat - edgeStart.lat;
        const next = cloneCoords(edgeStart.coords);
        next[cornerA] = [edgeStart.coords[cornerA][0] + dLng, edgeStart.coords[cornerA][1] + dLat];
        next[cornerB] = [edgeStart.coords[cornerB][0] + dLng, edgeStart.coords[cornerB][1] + dLat];
        edgeMarker.setLngLat(getEdgeMidpoint(next, edge as 0 | 1 | 2 | 3));
        live(next);
      });
      edgeMarker.on("dragend", () => {
        edgeStart = null;
        enablePan();
        final(coordsRef.current);
      });
      markersRef.current.push({ marker: edgeMarker, role: "edge", index: edge });
    }

    return () => {
      markersRef.current.forEach(({ marker }) => marker.remove());
      markersRef.current = [];
    };
  }, [mapRef, enabled, mapReady, onCoordinatesChange, onDragLive]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !enabled || !mapReady || draggingRef.current) return;

    coordsRef.current = coordinates;

    markersRef.current.forEach(({ marker, role, index }) => {
      if (role === "corner" && index !== undefined) {
        marker.setLngLat(coordinates[index] as [number, number]);
      } else if (role === "center") {
        marker.setLngLat(getCoordinatesCenter(coordinates));
      } else if (role === "rotate") {
        marker.setLngLat(getRotateHandleLngLat(map, coordinates));
      } else if (role === "edge" && index !== undefined) {
        marker.setLngLat(getEdgeMidpoint(coordinates, index as 0 | 1 | 2 | 3));
      }
    });

    if (map.getSource(FRAME_SOURCE)) {
      (map.getSource(FRAME_SOURCE) as maplibregl.GeoJSONSource).setData(
        coordinatesToFrameGeoJson(coordinates)
      );
    }
  }, [coordinates, mapRef, enabled, mapReady]);
}
