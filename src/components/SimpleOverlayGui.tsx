"use client";

/**
 * Minimal overlay aligner — every control calls MapLibre directly (no React state batching).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Link from "next/link";
import { georef } from "@/lib/georef";
import {
  clearOverlayOverride,
  coordinatesToBounds,
  exportGeorefJsonSnippet,
  getCoordinatesCenter,
  getDefaultOverlayGeoref,
  getEffectiveOverlayGeoref,
  saveOverlayOverride,
  scaleCoordinates,
  translateCoordinates,
  type OverlayCoordinates,
} from "@/lib/overlay-georef";

const { center } = georef.venue;
const SATELLITE_URL = georef.satellite.tileUrl;
const MAP_PNG = "/maps/ltl-2026-official-amenity-map.png";
const NUDGE = 0.00008;
const NUDGE_FINE = 0.00002;

function cloneCoords(c: OverlayCoordinates): OverlayCoordinates {
  return c.map(([lng, lat]) => [lng, lat]) as OverlayCoordinates;
}

function NudgeBtn({
  label,
  onStep,
  className = "",
}: {
  label: string;
  onStep: () => void;
  className?: string;
}) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      onStep();
      stop();
      timerRef.current = setInterval(onStep, 90);
    },
    [onStep, stop]
  );

  useEffect(() => () => stop(), [stop]);

  return (
    <button
      type="button"
      className={`select-none rounded-lg border border-[var(--ld-border-green)] bg-black/80 py-3 text-sm font-bold text-[var(--ld-neon-green)] active:bg-[var(--ld-neon-green)] active:text-black touch-none ${className}`}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
    >
      {label}
    </button>
  );
}

export function SimpleOverlayGui() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const coordsRef = useRef<OverlayCoordinates>(getDefaultOverlayGeoref().coordinates);
  const opacityRef = useRef(0.72);
  const centerMarkerRef = useRef<maplibregl.Marker | null>(null);
  const dragStartRef = useRef<{
    lng: number;
    lat: number;
    coords: OverlayCoordinates;
  } | null>(null);
  const draggingRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [opacityPct, setOpacityPct] = useState(72);
  const [copied, setCopied] = useState(false);

  const applyToMap = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    try {
      const src = map.getSource("festivalMap") as maplibregl.ImageSource | undefined;
      if (src) src.setCoordinates(coordsRef.current);
      if (map.getLayer("festival-overlay")) {
        map.setPaintProperty("festival-overlay", "raster-opacity", opacityRef.current);
      }
      if (!draggingRef.current) {
        centerMarkerRef.current?.setLngLat(getCoordinatesCenter(coordsRef.current));
      }
    } catch (err) {
      console.error("applyToMap:", err);
    }
  }, []);

  const persist = useCallback(() => {
    saveOverlayOverride({
      bounds: coordinatesToBounds(coordsRef.current),
      coordinates: coordsRef.current,
      opacity: opacityRef.current,
    });
  }, []);

  const nudge = useCallback(
    (dLng: number, dLat: number) => {
      coordsRef.current = translateCoordinates(coordsRef.current, dLng, dLat);
      applyToMap();
      persist();
    },
    [applyToMap, persist]
  );

  const scale = useCallback(
    (factor: number) => {
      coordsRef.current = scaleCoordinates(coordsRef.current, factor);
      applyToMap();
      persist();
    },
    [applyToMap, persist]
  );

  const setOpacity = useCallback(
    (value: number) => {
      opacityRef.current = value;
      setOpacityPct(Math.round(value * 100));
      applyToMap();
      persist();
    },
    [applyToMap, persist]
  );

  const resetAll = useCallback(() => {
    clearOverlayOverride();
    const d = getDefaultOverlayGeoref();
    coordsRef.current = cloneCoords(d.coordinates);
    opacityRef.current = d.opacity ?? 0.72;
    setOpacityPct(Math.round(opacityRef.current * 100));
    applyToMap();
  }, [applyToMap]);

  const copyJson = useCallback(async () => {
    const snippet = exportGeorefJsonSnippet({
      bounds: coordinatesToBounds(coordsRef.current),
      coordinates: coordsRef.current,
      opacity: opacityRef.current,
    });
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  useEffect(() => {
    const loaded = getEffectiveOverlayGeoref();
    coordsRef.current = cloneCoords(loaded.coordinates);
    opacityRef.current = loaded.opacity ?? 0.72;
    setOpacityPct(Math.round(opacityRef.current * 100));
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          satellite: {
            type: "raster",
            tiles: [SATELLITE_URL],
            tileSize: 256,
            attribution: "© Esri",
          },
          festivalMap: {
            type: "image",
            url: MAP_PNG,
            coordinates: coordsRef.current,
          },
        },
        layers: [
          { id: "basemap-satellite", type: "raster", source: "satellite" },
          {
            id: "festival-overlay",
            type: "raster",
            source: "festivalMap",
            paint: { "raster-opacity": opacityRef.current },
          },
        ],
      },
      center: [center.lng, center.lat],
      zoom: georef.satellite.defaultZoom,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");

    const mountDragHandle = () => {
      const el = document.createElement("button");
      el.type = "button";
      el.title = "Drag to move overlay";
      el.className =
        "flex h-12 w-12 cursor-grab items-center justify-center rounded-full border-2 border-[#39ff14] bg-black/90 text-lg font-black text-[#39ff14] shadow-lg active:cursor-grabbing touch-none";
      el.textContent = "✥";

      const marker = new maplibregl.Marker({ element: el, draggable: true })
        .setLngLat(getCoordinatesCenter(coordsRef.current))
        .addTo(map);

      marker.on("dragstart", () => {
        draggingRef.current = true;
        map.dragPan.disable();
        const pos = marker.getLngLat();
        dragStartRef.current = {
          lng: pos.lng,
          lat: pos.lat,
          coords: cloneCoords(coordsRef.current),
        };
      });

      marker.on("drag", () => {
        const start = dragStartRef.current;
        if (!start) return;
        const pos = marker.getLngLat();
        coordsRef.current = translateCoordinates(
          start.coords,
          pos.lng - start.lng,
          pos.lat - start.lat
        );
        applyToMap();
      });

      marker.on("dragend", () => {
        draggingRef.current = false;
        map.dragPan.enable();
        dragStartRef.current = null;
        marker.setLngLat(getCoordinatesCenter(coordsRef.current));
        persist();
      });

      centerMarkerRef.current = marker;
    };

    map.on("load", () => {
      applyToMap();
      mountDragHandle();
      setReady(true);
      map.resize();
    });

    mapRef.current = map;

    return () => {
      centerMarkerRef.current?.remove();
      centerMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
      setReady(false);
    };
  }, [applyToMap, persist]);

  return (
    <div className="flex flex-col gap-4 xl:flex-row">
      <div className="relative min-h-[360px] flex-1 overflow-hidden rounded-xl border border-[var(--ld-border-green)]">
        <div ref={containerRef} className="h-[min(75vh,640px)] w-full bg-[#111]" />
        {!ready && (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-[var(--ld-muted)]">
            Loading map…
          </p>
        )}
        {ready && (
          <p className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/85 px-2 py-1 text-[10px] font-bold uppercase text-[var(--ld-neon-green)]">
            Drag ✥ or use arrows →
          </p>
        )}
      </div>

      <aside className="w-full shrink-0 space-y-4 rounded-xl border border-[var(--ld-border)] bg-[var(--ld-surface)] p-4 xl:w-72">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--ld-neon-green)]">
            Simple overlay
          </p>
          <p className="mt-1 text-xs text-[var(--ld-muted)]">
            Changes apply instantly. Saved in this browser automatically.
          </p>
        </div>

        <label className="block text-xs text-[var(--ld-muted)]">
          Opacity — {opacityPct}%
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={opacityPct / 100}
            onInput={(e) => setOpacity(Number(e.currentTarget.value))}
            className="mt-1 w-full accent-[var(--ld-neon-green)]"
          />
        </label>

        <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--ld-muted)]">
          Move overlay
        </p>
        <div className="grid grid-cols-3 gap-2">
          <span />
          <NudgeBtn label="↑" onStep={() => nudge(0, NUDGE)} />
          <span />
          <NudgeBtn label="←" onStep={() => nudge(-NUDGE, 0)} />
          <NudgeBtn label="↓" onStep={() => nudge(0, -NUDGE)} />
          <NudgeBtn label="→" onStep={() => nudge(NUDGE, 0)} />
        </div>

        <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--ld-muted)]">
          Fine tune
        </p>
        <div className="grid grid-cols-4 gap-1">
          <NudgeBtn label="↑" className="py-2 text-xs" onStep={() => nudge(0, NUDGE_FINE)} />
          <NudgeBtn label="↓" className="py-2 text-xs" onStep={() => nudge(0, -NUDGE_FINE)} />
          <NudgeBtn label="←" className="py-2 text-xs" onStep={() => nudge(-NUDGE_FINE, 0)} />
          <NudgeBtn label="→" className="py-2 text-xs" onStep={() => nudge(NUDGE_FINE, 0)} />
        </div>

        <div className="flex gap-2">
          <NudgeBtn label="Smaller" className="flex-1 py-2 text-xs" onStep={() => scale(0.98)} />
          <NudgeBtn label="Bigger" className="flex-1 py-2 text-xs" onStep={() => scale(1.02)} />
        </div>

        <div className="flex flex-col gap-2 border-t border-[var(--ld-border)] pt-3">
          <button
            type="button"
            onClick={() => void copyJson()}
            className="rounded-full border border-[var(--ld-border-green)] py-2.5 text-sm font-bold text-[var(--ld-neon-green)]"
          >
            {copied ? "Copied!" : "Copy georef JSON"}
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="text-xs text-[var(--ld-muted)] underline"
          >
            Reset defaults
          </button>
          <Link href="/overlay/live" className="text-xs text-[var(--ld-accent)] underline">
            Preview live GPS overlay →
          </Link>
        </div>
      </aside>
    </div>
  );
}
