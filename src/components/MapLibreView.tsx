"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { FESTIVAL_MAP_SRC } from "@/lib/festival-map";

const KEC = { lng: -85.7416, lat: 38.1969 };

export function MapLibreView() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: [
              "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution: "© OpenStreetMap",
          },
          festivalMap: {
            type: "image",
            url: FESTIVAL_MAP_SRC,
            coordinates: [
              [-85.752, 38.204],
              [-85.728, 38.204],
              [-85.728, 38.188],
              [-85.752, 38.188],
            ],
          },
        },
        layers: [
          { id: "osm", type: "raster", source: "osm" },
          { id: "festival-overlay", type: "raster", source: "festivalMap", paint: { "raster-opacity": 0.85 } },
        ],
      },
      center: [KEC.lng, KEC.lat],
      zoom: 15,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    new maplibregl.Marker({ color: "#f97316" })
      .setLngLat([KEC.lng, KEC.lat])
      .setPopup(new maplibregl.Popup().setHTML("<strong>Kentucky Expo Center</strong><br/>LTL 2026"))
      .addTo(map);

    return () => map.remove();
  }, []);

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="h-[480px] w-full overflow-hidden rounded-xl border border-zinc-700"
      />
      <p className="text-xs text-zinc-500">
        MapLibre satellite view with official amenity map georeferenced over KY Expo Center
        (approximate bounds).
      </p>
    </div>
  );
}
