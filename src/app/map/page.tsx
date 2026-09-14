"use client";

import { useState } from "react";
import { InteractiveMap } from "@/components/InteractiveMap";
import { MapLibreView } from "@/components/MapLibreView";

export default function MapPage() {
  const [view, setView] = useState<"interactive" | "satellite">("interactive");

  return (
    <div>
      <h1 className="text-3xl font-black">Interactive Festival Map</h1>
      <p className="mt-2 text-zinc-400">
        Official 2026 amenity map with tap targets. Toggle layers and switch pass tier in the
        nav to filter VIP-only points.
      </p>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setView("interactive")}
          className={`rounded px-3 py-1.5 text-sm font-semibold ${
            view === "interactive" ? "bg-orange-600 text-white" : "bg-zinc-800 text-zinc-400"
          }`}
        >
          Tap Map
        </button>
        <button
          type="button"
          onClick={() => setView("satellite")}
          className={`rounded px-3 py-1.5 text-sm font-semibold ${
            view === "satellite" ? "bg-orange-600 text-white" : "bg-zinc-800 text-zinc-400"
          }`}
        >
          Satellite Overlay
        </button>
      </div>
      <div className="mt-6">
        {view === "interactive" ? <InteractiveMap /> : <MapLibreView />}
      </div>
    </div>
  );
}
