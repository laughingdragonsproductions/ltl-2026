"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import type { OverlayCoordinates } from "@/lib/overlay-georef";

const CORNER_LABELS = ["NW", "NE", "SE", "SW"] as const;

export function useOverlayCornerMarkers(
  map: maplibregl.Map | null,
  mapReady: boolean,
  coordinates: OverlayCoordinates,
  enabled: boolean,
  onCoordinatesChange: (coords: OverlayCoordinates) => void
) {
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const draggingRef = useRef(false);
  const coordsRef = useRef(coordinates);

  coordsRef.current = coordinates;

  useEffect(() => {
    if (!map || !mapReady || !enabled) {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      return;
    }

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    coordsRef.current.forEach(([lng, lat], i) => {
      const el = document.createElement("button");
      el.type = "button";
      el.title = `Drag ${CORNER_LABELS[i]} corner`;
      el.className =
        "flex h-9 w-9 cursor-grab items-center justify-center rounded-full border-2 border-[#39ff14] bg-black/90 text-[10px] font-black text-[#39ff14] shadow-lg active:cursor-grabbing touch-none";
      el.textContent = CORNER_LABELS[i];

      const marker = new maplibregl.Marker({ element: el, draggable: true })
        .setLngLat([lng, lat])
        .addTo(map);

      const applyLive = () => {
        const pos = marker.getLngLat();
        const next = [...coordsRef.current] as OverlayCoordinates;
        next[i] = [pos.lng, pos.lat];
        const src = map.getSource("festivalMap") as maplibregl.ImageSource | undefined;
        src?.setCoordinates(next);
      };

      marker.on("dragstart", () => {
        draggingRef.current = true;
      });
      marker.on("drag", applyLive);
      marker.on("dragend", () => {
        draggingRef.current = false;
        const pos = marker.getLngLat();
        const next = [...coordsRef.current] as OverlayCoordinates;
        next[i] = [pos.lng, pos.lat];
        onCoordinatesChange(next);
      });

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
    };
  }, [map, mapReady, enabled, onCoordinatesChange]);

  useEffect(() => {
    if (!map || !mapReady || !enabled || draggingRef.current) return;
    markersRef.current.forEach((marker, i) => {
      const [lng, lat] = coordinates[i];
      marker.setLngLat([lng, lat]);
    });
  }, [coordinates, map, mapReady, enabled]);
}
