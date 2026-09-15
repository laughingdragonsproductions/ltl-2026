"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Link from "next/link";
import { georef } from "@/lib/georef";
import { buildAllMapPoints } from "@/lib/map-points";
import {
  boundsToCoordinates,
  clearOverlayOverride,
  coordinatesToBounds,
  exportGeorefJsonSnippet,
  getDefaultOverlayGeoref,
  loadOverlayOverride,
  saveOverlayOverride,
  scaleCoordinates,
  setBoundsWithAspect,
  translateCoordinates,
  type GeorefBounds,
  type OverlayCoordinates,
  type OverlayGeorefOverride,
} from "@/lib/overlay-georef";

const { center } = georef.venue;
const SATELLITE_URL = georef.satellite.tileUrl;
const NUDGE = 0.00005;
const NUDGE_FINE = 0.00001;

const CORNER_LABELS = ["NW", "NE", "SE", "SW"] as const;

export function OverlayAdjuster() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [state, setState] = useState<OverlayGeorefOverride>(() =>
    loadOverlayOverride() ?? getDefaultOverlayGeoref()
  );
  const [lockAspect, setLockAspect] = useState(true);
  const [opacity, setOpacity] = useState(state.opacity ?? 0.72);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const samplePoints = useMemo(
    () => buildAllMapPoints().filter((p) => p.layer === "stages").slice(0, 6),
    []
  );

  const applyCoordinates = useCallback(
    (map: maplibregl.Map, coords: OverlayCoordinates, op: number) => {
      const src = map.getSource("festivalMap") as maplibregl.ImageSource | undefined;
      src?.setCoordinates(coords);
      map.setPaintProperty("festival-overlay", "raster-opacity", op);
    },
    []
  );

  const syncCornerMarkers = useCallback((map: maplibregl.Map, coords: OverlayCoordinates) => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    coords.forEach(([lng, lat], i) => {
      const el = document.createElement("button");
      el.type = "button";
      el.title = `Drag ${CORNER_LABELS[i]} corner`;
      el.className =
        "flex h-8 w-8 cursor-grab items-center justify-center rounded-full border-2 border-[#39ff14] bg-black/90 text-[10px] font-black text-[#39ff14] shadow-lg active:cursor-grabbing";
      el.textContent = CORNER_LABELS[i];

      const marker = new maplibregl.Marker({ element: el, draggable: true })
        .setLngLat([lng, lat])
        .addTo(map);

      marker.on("dragend", () => {
        const pos = marker.getLngLat();
        setState((prev) => {
          const nextCoords = [...prev.coordinates] as OverlayCoordinates;
          nextCoords[i] = [pos.lng, pos.lat];
          const nextBounds = coordinatesToBounds(nextCoords);
          return {
            ...prev,
            coordinates: nextCoords,
            bounds: nextBounds,
            opacity: prev.opacity ?? 0.72,
          };
        });
      });

      markersRef.current.push(marker);
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initial = loadOverlayOverride() ?? getDefaultOverlayGeoref();

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
            url: "/maps/ltl-2026-official-amenity-map.png",
            coordinates: initial.coordinates,
          },
        },
        layers: [
          { id: "basemap-satellite", type: "raster", source: "satellite" },
          {
            id: "festival-overlay",
            type: "raster",
            source: "festivalMap",
            paint: { "raster-opacity": initial.opacity ?? 0.72 },
          },
        ],
      },
      center: [center.lng, center.lat],
      zoom: 16,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");

    map.on("load", () => {
      syncCornerMarkers(map, initial.coordinates);
      map.resize();
    });

    mapRef.current = map;
    return () => {
      markersRef.current.forEach((m) => m.remove());
      map.remove();
      mapRef.current = null;
    };
  }, [syncCornerMarkers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    applyCoordinates(map, state.coordinates, opacity);
    syncCornerMarkers(map, state.coordinates);
  }, [state.coordinates, opacity, applyCoordinates, syncCornerMarkers]);

  function updateBounds(patch: Partial<GeorefBounds>) {
    setState((prev) => {
      const nextBounds = setBoundsWithAspect(prev.bounds, patch, lockAspect);
      return {
        ...prev,
        bounds: nextBounds,
        coordinates: boundsToCoordinates(nextBounds),
      };
    });
  }

  function nudge(dLng: number, dLat: number) {
    setState((prev) => {
      const coords = translateCoordinates(prev.coordinates, dLng, dLat);
      return {
        ...prev,
        coordinates: coords,
        bounds: coordinatesToBounds(coords),
      };
    });
  }

  function handleCopy() {
    const payload = { ...state, opacity };
    void navigator.clipboard.writeText(exportGeorefJsonSnippet(payload));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSaveBrowser() {
    saveOverlayOverride({ ...state, opacity });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    clearOverlayOverride();
    const defaults = getDefaultOverlayGeoref();
    setState(defaults);
    setOpacity(defaults.opacity ?? 0.72);
  }

  const b = state.bounds;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--ld-border-green)] bg-[var(--ld-surface)]/80 p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--ld-neon-green)]">
          Overlay adjuster
        </p>
        <p className="mt-1 text-sm text-[var(--ld-muted)]">
          Drag the <strong className="text-white">NW / NE / SE / SW</strong> handles on the map,
          nudge with buttons, or edit bounds.{" "}
          <strong className="text-white">Save to browser</strong> previews on{" "}
          <Link href="/overlay" className="text-[var(--ld-neon-green)] underline">
            /overlay
          </Link>
          . Copy JSON into <code className="text-white">data/georef.json</code> when aligned.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="relative overflow-hidden rounded-xl border border-[var(--ld-border-green)]">
          <div ref={containerRef} className="h-[min(75vh,640px)] w-full min-h-[360px]" />
        </div>

        <div className="space-y-4 rounded-xl border border-[var(--ld-border)] bg-[var(--ld-surface)] p-4">
          <label className="flex items-center gap-2 text-sm text-[var(--ld-text)]">
            <input
              type="checkbox"
              checked={lockAspect}
              onChange={(e) => setLockAspect(e.target.checked)}
              className="accent-[var(--ld-neon-green)]"
            />
            Lock PNG aspect (1024×503)
          </label>

          <label className="block text-xs text-[var(--ld-muted)]">
            Overlay opacity
            <input
              type="range"
              min={0.2}
              max={1}
              step={0.02}
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="mt-1 w-full accent-[var(--ld-neon-green)]"
            />
          </label>

          {(["west", "east", "north", "south"] as const).map((key) => (
            <label key={key} className="block text-xs uppercase text-[var(--ld-muted)]">
              {key}
              <input
                type="number"
                step={0.0001}
                value={b[key]}
                onChange={(e) => updateBounds({ [key]: Number(e.target.value) })}
                className="mt-1 w-full rounded border border-[var(--ld-border)] bg-black px-2 py-1.5 text-sm text-white"
              />
            </label>
          ))}

          <div className="grid grid-cols-3 gap-1">
            <span />
            <button type="button" onClick={() => nudge(0, NUDGE)} className="ltl-nudge-btn">
              ↑ N
            </button>
            <span />
            <button type="button" onClick={() => nudge(-NUDGE, 0)} className="ltl-nudge-btn">
              ← W
            </button>
            <button type="button" onClick={() => nudge(0, -NUDGE)} className="ltl-nudge-btn">
              ↓ S
            </button>
            <button type="button" onClick={() => nudge(NUDGE, 0)} className="ltl-nudge-btn">
              E →
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  coordinates: scaleCoordinates(prev.coordinates, 0.98),
                  bounds: coordinatesToBounds(scaleCoordinates(prev.coordinates, 0.98)),
                }))
              }
              className="ltl-nudge-btn flex-1"
            >
              Shrink
            </button>
            <button
              type="button"
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  coordinates: scaleCoordinates(prev.coordinates, 1.02),
                  bounds: coordinatesToBounds(scaleCoordinates(prev.coordinates, 1.02)),
                }))
              }
              className="ltl-nudge-btn flex-1"
            >
              Grow
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => nudge(0, NUDGE_FINE)} className="ltl-nudge-btn text-[10px]">
              Fine ↑
            </button>
            <button type="button" onClick={() => nudge(0, -NUDGE_FINE)} className="ltl-nudge-btn text-[10px]">
              Fine ↓
            </button>
            <button type="button" onClick={() => nudge(-NUDGE_FINE, 0)} className="ltl-nudge-btn text-[10px]">
              Fine ←
            </button>
            <button type="button" onClick={() => nudge(NUDGE_FINE, 0)} className="ltl-nudge-btn text-[10px]">
              Fine →
            </button>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={handleSaveBrowser}
              className="rounded-full bg-[var(--ld-neon-green)] py-2.5 text-sm font-black text-black"
            >
              {saved ? "Saved — open /overlay" : "Save to browser (preview)"}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-full border border-[var(--ld-border-green)] py-2.5 text-sm font-bold text-[var(--ld-neon-green)]"
            >
              {copied ? "Copied JSON" : "Copy georef JSON"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-[var(--ld-muted)] underline"
            >
              Reset to defaults
            </button>
          </div>
        </div>
      </div>

      <p className="text-xs text-[var(--ld-muted)]">
        Stage pin check (should sit on stage art after align):{" "}
        {samplePoints.map((p) => p.name).join(" · ")}
      </p>

      <style jsx global>{`
        .ltl-nudge-btn {
          border-radius: 0.5rem;
          border: 1px solid rgba(168, 168, 168, 0.22);
          background: #121212;
          padding: 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: #f2f2f2;
          cursor: pointer;
        }
        .ltl-nudge-btn:hover {
          border-color: rgba(57, 255, 20, 0.45);
          color: #39ff14;
        }
      `}</style>
    </div>
  );
}
