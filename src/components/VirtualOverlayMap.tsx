"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Link from "next/link";
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
import {
  getEffectiveOverlayGeoref,
  mapPercentToLatLngWithBounds,
  type GeorefBounds,
  type OverlayGeorefOverride,
} from "@/lib/overlay-georef";
import { useTier } from "@/lib/tier-context";

type UserLocation = { lat: number; lng: number };

const { center } = georef.venue;
const SATELLITE_URL = georef.satellite.tileUrl;

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

  const [overlayGeoref, setOverlayGeoref] = useState<OverlayGeorefOverride | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [basemap, setBasemap] = useState<"streets" | "satellite">("satellite");
  const [showFestivalOverlay, setShowFestivalOverlay] = useState(true);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locStatus, setLocStatus] = useState<"idle" | "active" | "denied">("idle");

  useEffect(() => {
    const refresh = () => setOverlayGeoref(getEffectiveOverlayGeoref());
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const allPoints = useMemo(
    () => (overlayGeoref ? buildPointsForBounds(overlayGeoref.bounds) : []),
    [overlayGeoref]
  );
  const visiblePoints = useMemo(
    () => filterMapPoints(allPoints, layers, tier),
    [allPoints, layers, tier]
  );
  const geojson = useMemo(() => pointsToGeoJson(visiblePoints), [visiblePoints]);

  const bounds = overlayGeoref?.bounds;
  const coordinates = overlayGeoref?.coordinates;
  const overlayOpacity = overlayGeoref?.opacity ?? 0.72;

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !coordinates || !bounds) return;

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
            coordinates,
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
            paint: { "raster-opacity": overlayOpacity },
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
        [bounds.west - 0.008, bounds.south - 0.008],
        [bounds.east + 0.008, bounds.north + 0.008],
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
      setUserLocation(loc);
      setLocStatus("active");
    });
    geolocate.on("error", () => setLocStatus("denied"));

    map.on("load", () => {
      setMapReady(true);
      map.resize();
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
    return () => {
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [coordinates, bounds, overlayOpacity]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !coordinates) return;
    const src = map.getSource("festivalMap") as maplibregl.ImageSource | undefined;
    src?.setCoordinates(coordinates);
    map.setPaintProperty(
      "festival-overlay",
      "raster-opacity",
      showFestivalOverlay ? overlayOpacity : 0
    );
  }, [coordinates, overlayOpacity, showFestivalOverlay, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    (map.getSource("pois") as maplibregl.GeoJSONSource)?.setData(geojson);
  }, [geojson, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    map.setLayoutProperty("basemap-streets", "visibility", basemap === "streets" ? "visible" : "none");
    map.setLayoutProperty("basemap-satellite", "visibility", basemap === "satellite" ? "visible" : "none");
  }, [basemap, mapReady]);

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
        setUserLocation(loc);
        setLocStatus("active");
        map.flyTo({ center: [loc.lng, loc.lat], zoom: 17, essential: true });
      },
      () => setLocStatus("denied"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  if (!overlayGeoref) {
    return (
      <div className="flex h-48 items-center justify-center text-[var(--ld-muted)]">
        Loading map…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--ld-border-green)] bg-[var(--ld-surface)]/80 p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--ld-neon-green)]">
          Free · GPS overlay
        </p>
        <p className="mt-1 text-sm text-[var(--ld-text)]">
          Live satellite + official map aligned on real GPS. Misaligned?{" "}
          <Link href="/overlay/adjust" className="font-bold text-[var(--ld-neon-green)] underline">
            Open adjuster
          </Link>
          .
        </p>
      </div>

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
          onClick={() => setBasemap("satellite")}
          className={`rounded px-3 py-1.5 text-xs font-semibold ${
            basemap === "satellite" ? "bg-[var(--ld-neon-green-dim)] text-white" : "bg-zinc-900 text-[var(--ld-muted)]"
          }`}
        >
          Satellite
        </button>
        <button
          type="button"
          onClick={() => setBasemap("streets")}
          className={`rounded px-3 py-1.5 text-xs font-semibold ${
            basemap === "streets" ? "bg-[var(--ld-neon-green-dim)] text-white" : "bg-zinc-900 text-[var(--ld-muted)]"
          }`}
        >
          Streets
        </button>
        <button
          type="button"
          onClick={() => setShowFestivalOverlay((v) => !v)}
          className={`rounded px-3 py-1.5 text-xs font-semibold ${
            showFestivalOverlay ? "bg-[var(--ld-neon-green)] text-black" : "bg-[var(--ld-surface)] text-[var(--ld-muted)]"
          }`}
        >
          Amenity overlay
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
        <div ref={containerRef} className="h-[min(70vh,560px)] w-full min-h-[320px]" />
      </div>

      <p className="text-xs text-[var(--ld-muted)]">
        {visiblePoints.length} GPS pins · Amenity art georeferenced over Kentucky Expo Center
        {locStatus === "active" && userLocation && " · GPS active"}
        {locStatus === "denied" && " · Enable location for live positioning"}
      </p>
    </div>
  );
}
