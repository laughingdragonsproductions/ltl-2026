"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { georef } from "@/lib/georef";
import {
  buildAllMapPoints,
  DEFAULT_LAYERS,
  filterMapPoints,
  formatDistance,
  distanceMeters,
  LAYER_COLORS,
  type LayerKey,
  type MapPoint,
} from "@/lib/map-points";
import { syncOverlayMap } from "@/lib/overlay-map-sync";
import {
  getDefaultOverlayGeoref,
  mapPercentToLatLngWithBounds,
  type GeorefBounds,
} from "@/lib/overlay-georef";
import { useOverlayGeorefEditor } from "@/hooks/use-overlay-georef-editor";
import { useTier } from "@/lib/tier-context";
import Link from "next/link";
import { getEffectiveOverlayGeoref } from "@/lib/overlay-georef";

type UserLocation = { lat: number; lng: number };

const { center } = georef.venue;
const SATELLITE_URL = georef.satellite.tileUrl;
const defaultGeoref = getDefaultOverlayGeoref();

function buildPointsForBounds(bounds: GeorefBounds): MapPoint[] {
  return buildAllMapPoints().map((p) => {
    const { lat, lng } = mapPercentToLatLngWithBounds({ x: p.x, y: p.y }, bounds);
    return { ...p, lat, lng };
  });
}

function pointsToGeoJson(points: MapPoint[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: points.map((p) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [p.lng, p.lat] },
      properties: {
        id: p.id,
        name: p.name,
        layer: p.layer,
        detail: p.detail ?? "",
        color: LAYER_COLORS[p.layer],
      },
    })),
  };
}

export function VirtualOverlayMap() {
  const { tier } = useTier();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const userLocationRef = useRef<UserLocation | null>(null);
  const editor = useOverlayGeorefEditor(true);
  const { state, hydrated, setOpacity, reload } = editor;

  const [mapVisible, setMapVisible] = useState(false);
  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [basemap, setBasemap] = useState<"streets" | "satellite">("satellite");
  const [showFestivalOverlay, setShowFestivalOverlay] = useState(true);
  const [locStatus, setLocStatus] = useState<"idle" | "active" | "denied">("idle");

  const opacity = state.opacity ?? 0.72;
  const coordinates = state.coordinates;
  const bounds = state.bounds;

  const allPoints = useMemo(() => buildPointsForBounds(bounds), [bounds]);
  const visiblePoints = useMemo(
    () => filterMapPoints(allPoints, layers, tier),
    [allPoints, layers, tier]
  );
  const geojson = useMemo(() => pointsToGeoJson(visiblePoints), [visiblePoints]);

  const syncOptsRef = useRef({
    coordinates,
    opacity,
    showFestivalOverlay,
    basemap,
    geojson,
  });
  syncOptsRef.current = { coordinates, opacity, showFestivalOverlay, basemap, geojson };

  const pushToMap = useCallback(() => {
    const map = mapRef.current;
    if (!map) return false;
    return syncOverlayMap(map, syncOptsRef.current);
  }, []);

  useEffect(() => {
    const syncFromStorage = () => {
      const loaded = getEffectiveOverlayGeoref();
      syncOptsRef.current = {
        ...syncOptsRef.current,
        coordinates: loaded.coordinates,
        opacity: loaded.opacity ?? 0.72,
      };
      reload();
      pushToMap();
    };
    window.addEventListener("focus", syncFromStorage);
    return () => window.removeEventListener("focus", syncFromStorage);
  }, [reload, pushToMap]);

  useEffect(() => {
    if (!hydrated || !containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap",
          },
          satellite: {
            type: "raster",
            tiles: [SATELLITE_URL],
            tileSize: 256,
            attribution: "© Esri",
          },
          festivalMap: {
            type: "image",
            url: "/maps/ltl-2026-official-amenity-map.png",
            coordinates: syncOptsRef.current.coordinates,
          },
          pois: {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
          },
        },
        layers: [
          { id: "basemap-streets", type: "raster", source: "osm", layout: { visibility: "none" } },
          { id: "basemap-satellite", type: "raster", source: "satellite" },
          {
            id: "festival-overlay",
            type: "raster",
            source: "festivalMap",
            paint: { "raster-opacity": syncOptsRef.current.opacity },
          },
          {
            id: "poi-circles",
            type: "circle",
            source: "pois",
            paint: {
              "circle-radius": ["interpolate", ["linear"], ["zoom"], 14, 7, 17, 12],
              "circle-color": ["get", "color"],
              "circle-stroke-width": 2,
              "circle-stroke-color": "#0a0a0a",
            },
          },
        ],
      },
      center: [center.lng, center.lat],
      zoom: georef.satellite.defaultZoom,
      maxBounds: [
        [defaultGeoref.bounds.west - 0.008, defaultGeoref.bounds.south - 0.008],
        [defaultGeoref.bounds.east + 0.008, defaultGeoref.bounds.north + 0.008],
      ],
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");

    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserLocation: true,
      showAccuracyCircle: true,
    });
    map.addControl(geolocate, "top-right");

    geolocate.on("geolocate", (e) => {
      const loc = { lat: e.coords.latitude, lng: e.coords.longitude };
      userLocationRef.current = loc;
      setLocStatus("active");
    });
    geolocate.on("error", () => setLocStatus("denied"));

    const syncWhenReady = () => {
      pushToMap();
      map.resize();
    };

    map.on("load", syncWhenReady);
    map.on("idle", syncWhenReady);

    map.on("error", (e) => {
      console.error("MapLibre error:", e.error?.message ?? e);
    });

    map.on("click", "poi-circles", (e) => {
      const feature = e.features?.[0];
      if (!feature || feature.geometry.type !== "Point") return;
      const [lng, lat] = feature.geometry.coordinates;
      const name = feature.properties?.name ?? "Point";
      const layer = feature.properties?.layer ?? "";
      const detail = feature.properties?.detail ?? "";
      let distanceHtml = "";
      if (userLocationRef.current) {
        const d = distanceMeters(userLocationRef.current, { lat, lng });
        distanceHtml = `<p style="margin:6px 0 0;font-size:12px;color:#39ff14">${formatDistance(d)} away</p>`;
      }
      popupRef.current?.remove();
      popupRef.current = new maplibregl.Popup({ offset: 12, maxWidth: "240px" })
        .setLngLat([lng, lat])
        .setHTML(
          `<strong style="color:#39ff14">${name}</strong>
           <p style="margin:4px 0 0;font-size:11px;text-transform:uppercase;opacity:0.7">${layer}</p>
           ${detail ? `<p style="margin:6px 0 0;font-size:12px">${detail}</p>` : ""}
           ${distanceHtml}`
        )
        .addTo(map);
    });

    map.on("mouseenter", "poi-circles", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "poi-circles", () => {
      map.getCanvas().style.cursor = "";
    });

    mapRef.current = map;
    setMapVisible(true);
    queueMicrotask(syncWhenReady);

    return () => {
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
      setMapVisible(false);
    };
  }, [hydrated, pushToMap]);

  useEffect(() => {
    pushToMap();
  }, [coordinates, opacity, showFestivalOverlay, basemap, geojson, pushToMap]);

  const handleOpacityChange = useCallback(
    (value: number) => {
      setOpacity(value);
      syncOptsRef.current = { ...syncOptsRef.current, opacity: value };
      pushToMap();
    },
    [setOpacity, pushToMap]
  );

  const handleBasemap = useCallback(
    (mode: "streets" | "satellite") => {
      setBasemap(mode);
      syncOptsRef.current = { ...syncOptsRef.current, basemap: mode };
      pushToMap();
    },
    [pushToMap]
  );

  const handleToggleArt = useCallback(() => {
    setShowFestivalOverlay((prev) => {
      const next = !prev;
      syncOptsRef.current = { ...syncOptsRef.current, showFestivalOverlay: next };
      pushToMap();
      return next;
    });
  }, [pushToMap]);

  function centerOnMe() {
    const map = mapRef.current;
    if (!map || !navigator.geolocation) {
      setLocStatus("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        userLocationRef.current = loc;
        setLocStatus("active");
        map.flyTo({ center: [loc.lng, loc.lat], zoom: 17, essential: true });
      },
      () => setLocStatus("denied"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--ld-border-green)] bg-[var(--ld-surface)]/80 p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--ld-neon-green)]">
          Free · GPS overlay
        </p>
        <p className="mt-1 text-sm text-[var(--ld-text)]">
          Live GPS view. To move or resize the amenity art, use the{" "}
          <Link href="/overlay" className="font-bold text-[var(--ld-neon-green)] underline">
            overlay aligner
          </Link>
          .
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(layers) as LayerKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setLayers((prev) => ({ ...prev, [key]: !prev[key] }))}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase ${
                  layers[key]
                    ? "bg-[var(--ld-neon-green)] text-black"
                    : "border border-[var(--ld-border)] text-[var(--ld-muted)]"
                }`}
              >
                {key}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleBasemap("satellite")}
              className={`rounded px-3 py-1.5 text-xs font-semibold ${
                basemap === "satellite" ? "bg-[var(--ld-neon-green-dim)] text-white" : "bg-zinc-900 text-[var(--ld-muted)]"
              }`}
            >
              Satellite
            </button>
            <button
              type="button"
              onClick={() => handleBasemap("streets")}
              className={`rounded px-3 py-1.5 text-xs font-semibold ${
                basemap === "streets" ? "bg-[var(--ld-neon-green-dim)] text-white" : "bg-zinc-900 text-[var(--ld-muted)]"
              }`}
            >
              Streets
            </button>
            <button
              type="button"
              onClick={handleToggleArt}
              className={`rounded px-3 py-1.5 text-xs font-semibold ${
                showFestivalOverlay ? "bg-[var(--ld-neon-green)] text-black" : "bg-[var(--ld-surface)] text-[var(--ld-muted)]"
              }`}
            >
              {showFestivalOverlay ? "Hide art" : "Show art"}
            </button>
            <button
              type="button"
              onClick={centerOnMe}
              className="rounded bg-[var(--ld-neon-green)]/15 px-3 py-1.5 text-xs font-bold text-[var(--ld-neon-green)] ring-1 ring-[var(--ld-neon-green)]/40"
            >
              Center on me
            </button>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-[var(--ld-border-green)] ld-glow-purple">
            <div ref={containerRef} className="h-[min(70vh,560px)] w-full min-h-[320px] bg-[#111]" />
            {!mapVisible && (
              <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-[var(--ld-muted)]">
                Loading satellite map…
              </p>
            )}
          </div>

          <p className="text-xs text-[var(--ld-muted)]">
            {visiblePoints.length} GPS pins · Kentucky Expo Center
            {locStatus === "active" && " · GPS active"}
            {locStatus === "denied" && " · Enable location for live positioning"}
          </p>
        </div>

        <div className="space-y-4 rounded-xl border border-[var(--ld-border)] bg-[var(--ld-surface)] p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--ld-neon-green)]">
            View controls
          </p>
          <label className="block text-xs text-[var(--ld-muted)]">
            Opacity — {Math.round(opacity * 100)}%
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={opacity}
              onInput={(e) => handleOpacityChange(Number(e.currentTarget.value))}
              className="mt-1 w-full accent-[var(--ld-neon-green)]"
            />
          </label>
          <Link
            href="/overlay"
            className="block rounded-full bg-[var(--ld-neon-green)] py-2.5 text-center text-sm font-black text-black"
          >
            Open overlay aligner
          </Link>
        </div>
      </div>
    </div>
  );
}
