"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { PassTier } from "@/lib/data";
import {
  buildAllMapPoints,
  DEFAULT_LAYERS,
  filterMapPoints,
  type LayerKey,
  type MapPoint,
} from "@/lib/map-points";
import { useTier } from "@/lib/tier-context";

export function InteractiveMap() {
  const { tier } = useTier();
  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [selected, setSelected] = useState<MapPoint | null>(null);

  const allPoints = useMemo(() => buildAllMapPoints(), []);
  const points = useMemo(
    () => filterMapPoints(allPoints, layers, tier),
    [allPoints, layers, tier]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(layers) as LayerKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setLayers((prev) => ({ ...prev, [key]: !prev[key] }))}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
              layers[key]
                ? "bg-[var(--ld-purple)] text-white"
                : "border border-[var(--ld-purple-dim)]/50 bg-black/40 text-[var(--ld-muted)]"
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      <div className="relative w-full overflow-hidden rounded-xl border border-[var(--ld-purple-dim)]/50 bg-black/60 ld-glow-purple">
        <div className="relative aspect-[4/3] w-full touch-pan-y">
          <Image
            src="/maps/ltl-2026-official-amenity-map.png"
            alt="Louder Than Life 2026 official festival map"
            fill
            className="object-contain"
            priority
          />
          {points.map((point) => (
            <button
              key={point.id}
              type="button"
              title={point.name}
              onClick={() => setSelected(point)}
              className={`absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-black shadow-lg transition hover:scale-125 sm:h-3 sm:w-3 ${dotColor(point.layer, tier)}`}
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
            />
          ))}
        </div>
      </div>

      {selected && (
        <div className="rounded-lg border border-[var(--ld-purple-dim)]/50 bg-[var(--ld-purple-dim)]/20 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[var(--ld-neon-green)]">
                {selected.name}
              </h3>
              <p className="text-xs uppercase text-[var(--ld-muted)]">{selected.layer}</p>
              {selected.detail && (
                <p className="mt-2 text-sm text-[var(--ld-text)]">{selected.detail}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded px-2 py-1 text-[var(--ld-muted)] hover:bg-black/30 hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-[var(--ld-muted)]">
        {points.length} pins · Static official map view (no GPS)
      </p>
    </div>
  );
}

function dotColor(layer: LayerKey, tier: PassTier): string {
  if (layer === "vip") return tier === "topshelf" ? "bg-red-500" : "bg-green-500";
  if (layer === "entrances") return "bg-yellow-400";
  if (layer === "stages") return "bg-orange-500";
  if (layer === "food") return "bg-purple-500";
  if (layer === "kingdom") return "bg-blue-400";
  if (layer === "partners") return "bg-pink-500";
  return "bg-cyan-400";
}
