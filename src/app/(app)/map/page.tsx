"use client";

import { useState } from "react";
import { InteractiveMap } from "@/components/InteractiveMap";
import { LiveGpsMap } from "@/components/LiveGpsMap";
import { ShareButton } from "@/components/ShareButton";

type MapMode = "touch" | "gps";

export default function MapPage() {
  const [mode, setMode] = useState<MapMode>("touch");

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--ld-purple)]">
            Mobile-first
          </p>
          <h1 className="mt-1 text-3xl font-black text-[var(--ld-neon-green)]">
            Festival Map
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--ld-muted)]">
            Pinch-zoom the official map or use live GPS. Switch pass tier above to filter VIP
            pins. First 10 minutes free.
          </p>
        </div>
        <ShareButton />
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("touch")}
          className={`min-h-[44px] rounded-full px-4 py-2 text-sm font-bold ${
            mode === "touch"
              ? "bg-[var(--ld-neon-green)] text-black"
              : "bg-zinc-900 text-[var(--ld-muted)]"
          }`}
        >
          2D Tap Map
        </button>
        <button
          type="button"
          onClick={() => setMode("gps")}
          className={`min-h-[44px] rounded-full px-4 py-2 text-sm font-bold ${
            mode === "gps"
              ? "bg-[var(--ld-purple)] text-white"
              : "bg-zinc-900 text-[var(--ld-muted)]"
          }`}
        >
          Live GPS
        </button>
      </div>

      <div className="mt-6">
        {mode === "touch" ? (
          <InteractiveMap fullscreen />
        ) : (
          <LiveGpsMap />
        )}
      </div>
    </div>
  );
}
