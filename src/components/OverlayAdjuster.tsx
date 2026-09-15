"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Link from "next/link";
import { georef } from "@/lib/georef";
import { buildAllMapPoints } from "@/lib/map-points";
import { getDefaultOverlayGeoref } from "@/lib/overlay-georef";
import { useOverlayGeorefEditor } from "@/hooks/use-overlay-georef-editor";
import { useOverlayCornerMarkers } from "@/hooks/use-overlay-corner-markers";
import { OverlayControlPanel } from "@/components/OverlayControlPanel";

const { center } = georef.venue;
const SATELLITE_URL = georef.satellite.tileUrl;
const defaultGeoref = getDefaultOverlayGeoref();

export function OverlayAdjuster() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const editor = useOverlayGeorefEditor(true);
  const {
    state,
    hydrated,
    lockAspect,
    setLockAspect,
    setOpacity,
    setCoordinates,
    updateBounds,
    nudge,
    scale,
    saveNow,
    reset,
    copyJson,
  } = editor;

  const opacity = state.opacity ?? 0.72;
  const coordinates = state.coordinates;
  const bounds = state.bounds;

  const samplePoints = useMemo(
    () => buildAllMapPoints().filter((p) => p.layer === "stages").slice(0, 6),
    []
  );

  const handleCoordinatesChange = useCallback(
    (coords: typeof coordinates) => setCoordinates(coords),
    [setCoordinates]
  );

  useOverlayCornerMarkers(mapRef.current, mapReady, coordinates, true, handleCoordinatesChange);

  useEffect(() => {
    if (!hydrated || !containerRef.current || mapRef.current) return;

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
            coordinates,
          },
        },
        layers: [
          { id: "basemap-satellite", type: "raster", source: "satellite" },
          {
            id: "festival-overlay",
            type: "raster",
            source: "festivalMap",
            paint: { "raster-opacity": opacity },
          },
        ],
      },
      center: [center.lng, center.lat],
      zoom: 16,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");
    map.on("load", () => {
      setMapReady(true);
      map.resize();
    });
    map.on("error", (e) => {
      console.error("MapLibre error:", e.error?.message ?? e);
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [hydrated]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const src = map.getSource("festivalMap") as maplibregl.ImageSource | undefined;
    src?.setCoordinates(coordinates);
    map.setPaintProperty("festival-overlay", "raster-opacity", opacity);
  }, [coordinates, opacity, mapReady]);

  async function handleCopy() {
    await copyJson();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSave() {
    saveNow();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--ld-border-green)] bg-[var(--ld-surface)]/80 p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--ld-neon-green)]">
          Full-screen overlay adjuster
        </p>
        <p className="mt-1 text-sm text-[var(--ld-muted)]">
          Drag corners, set opacity, nudge placement. Auto-saves in browser — preview on{" "}
          <Link href="/overlay" className="text-[var(--ld-neon-green)] underline">
            /overlay
          </Link>
          . Copy JSON into <code className="text-white">data/georef.json</code> for permanent deploy.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="relative overflow-hidden rounded-xl border border-[var(--ld-border-green)]">
          <div ref={containerRef} className="h-[min(75vh,640px)] w-full min-h-[360px] bg-[#111]" />
          {!mapReady && (
            <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-[var(--ld-muted)]">
              Loading satellite map…
            </p>
          )}
        </div>

        <OverlayControlPanel
          bounds={bounds}
          opacity={opacity}
          lockAspect={lockAspect}
          adjustMode
          copied={copied}
          saved={saved}
          onOpacityChange={setOpacity}
          onLockAspectChange={setLockAspect}
          onBoundsChange={updateBounds}
          onNudge={nudge}
          onScale={scale}
          onSave={handleSave}
          onCopy={handleCopy}
          onReset={reset}
        />
      </div>

      <p className="text-xs text-[var(--ld-muted)]">
        Stage pin check (should sit on stage art after align):{" "}
        {samplePoints.map((p) => p.name).join(" · ")}
      </p>
    </div>
  );
}
