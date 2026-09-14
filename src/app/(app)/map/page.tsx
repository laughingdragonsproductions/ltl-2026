"use client";

import { useState } from "react";
import { InteractiveMap } from "@/components/InteractiveMap";
import { LiveGpsMap } from "@/components/LiveGpsMap";

type MapMode = "live" | "festival";

export default function MapPage() {
  const [mode, setMode] = useState<MapMode>("live");

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--ld-purple)]">
        Base build
      </p>
      <h1 className="mt-1 text-3xl font-black text-[var(--ld-neon-green)]">
        Festival Map
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--ld-muted)]">
        OpenStreetMap-style live GPS — see where you are relative to stages, entrances,
        and VIP zones. Switch pass tier in the header to filter pins.
      </p>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("live")}
          className={`rounded-full px-4 py-2 text-sm font-bold ${
            mode === "live"
              ? "bg-[var(--ld-neon-green)] text-black"
              : "bg-zinc-900 text-[var(--ld-muted)]"
          }`}
        >
          Live GPS
        </button>
        <button
          type="button"
          onClick={() => setMode("festival")}
          className={`rounded-full px-4 py-2 text-sm font-bold ${
            mode === "festival"
              ? "bg-[var(--ld-purple)] text-white"
              : "bg-zinc-900 text-[var(--ld-muted)]"
          }`}
        >
          Official map
        </button>
      </div>

      <div className="mt-6">{mode === "live" ? <LiveGpsMap /> : <InteractiveMap />}</div>
    </div>
  );
}
