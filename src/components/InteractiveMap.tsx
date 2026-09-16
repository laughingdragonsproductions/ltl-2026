"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import type { PassTier } from "@/lib/data";
import {
  buildAllMapPoints,
  DEFAULT_LAYERS,
  filterMapPoints,
  type LayerKey,
  type MapPoint,
} from "@/lib/map-points";
import {
  FESTIVAL_MAP_ASPECT,
  FESTIVAL_MAP_SRC,
  mapPinPercentToImage,
} from "@/lib/festival-map";
import { useTier } from "@/lib/tier-context";
type QuickFilter = "all" | "stages" | "food" | "vip" | "pois";

const QUICK_FILTERS: { id: QuickFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "stages", label: "Stages" },
  { id: "food", label: "Food" },
  { id: "vip", label: "VIP" },
  { id: "pois", label: "Services" },
];

function layersForQuickFilter(q: QuickFilter): Record<LayerKey, boolean> {
  if (q === "all") return { ...DEFAULT_LAYERS, food: true };
  return {
    stages: q === "stages",
    entrances: q === "vip",
    vip: q === "vip",
    food: q === "food",
    partners: false,
    kingdom: false,
    pois: q === "pois",
  };
}

export function InteractiveMap({ fullscreen = false }: { fullscreen?: boolean }) {
  const { tier } = useTier();
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [selected, setSelected] = useState<MapPoint | null>(null);

  const activeLayers = quickFilter === "all" ? layers : layersForQuickFilter(quickFilter);

  const allPoints = useMemo(() => buildAllMapPoints(), []);
  const points = useMemo(
    () => filterMapPoints(allPoints, activeLayers, tier),
    [allPoints, activeLayers, tier]
  );

  const mapHeight = fullscreen
    ? "h-[calc(100dvh-11rem-env(safe-area-inset-bottom))] min-h-[280px]"
    : "h-[min(70vh,560px)] min-h-[320px]";

  return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {QUICK_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setQuickFilter(f.id)}
              className={`min-h-[44px] rounded-full px-4 py-2 text-xs font-bold uppercase ${
                quickFilter === f.id
                  ? "bg-[var(--ld-neon-green)] text-black"
                  : "bg-zinc-900 text-[var(--ld-muted)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {quickFilter === "all" && (
          <div className="flex flex-wrap gap-2">
            {(Object.keys(layers) as LayerKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setLayers((prev) => ({ ...prev, [key]: !prev[key] }))}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                  layers[key]
                    ? "bg-[var(--ld-neon-green)] text-black"
                    : "border border-[var(--ld-border)] bg-[var(--ld-surface)] text-[var(--ld-muted)]"
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        )}

        <div
          className={`relative w-full overflow-hidden rounded-xl border border-[var(--ld-border-green)] bg-black/80 ld-glow-purple ${mapHeight}`}
        >
          <TransformWrapper
            initialScale={1}
            minScale={0.6}
            maxScale={4}
            centerOnInit
            doubleClick={{ mode: "zoomIn" }}
            pinch={{ step: 5 }}
          >
            <TransformComponent wrapperClass="!h-full !w-full" contentClass="!h-full !w-full">
              <div className="flex h-full w-full items-center justify-center">
                <div
                  className="relative w-full max-h-full"
                  style={{ aspectRatio: FESTIVAL_MAP_ASPECT }}
                >
                <Image
                  src={FESTIVAL_MAP_SRC}
                  alt="Louder Than Life 2026 official festival map"
                  fill
                  className="object-contain"
                  priority
                  draggable={false}
                />
                {points.map((point) => {
                  const pos = mapPinPercentToImage(point.x, point.y);
                  return (
                  <button
                    key={point.id}
                    type="button"
                    title={point.name}
                    onClick={() => setSelected(point)}
                    className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                    style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
                  >
                    <span
                      className={`h-3.5 w-3.5 rounded-full border-2 border-black shadow-lg ${dotColor(point.layer, tier)}`}
                    />
                  </button>
                  );
                })}
                </div>
              </div>
            </TransformComponent>
          </TransformWrapper>
        </div>

        {selected && (
          <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 mx-4 rounded-t-2xl border border-[var(--ld-border-green)] bg-[var(--ld-black)]/95 p-4 shadow-2xl md:static md:mx-0 md:rounded-lg md:bg-[var(--ld-surface)]/90">
            <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-zinc-600 md:hidden" />
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
                className="min-h-[44px] min-w-[44px] rounded px-2 py-1 text-[var(--ld-muted)] hover:bg-black/30 hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <p className="text-xs text-[var(--ld-muted)]">
          {points.length} pins · Always free · Pinch to zoom · Tap for details
        </p>
      </div>
  );
}

function dotColor(layer: LayerKey, tier: PassTier): string {
  if (layer === "vip") return tier === "topshelf" ? "bg-red-500" : "bg-green-500";
  if (layer === "entrances") return "bg-yellow-400";
  if (layer === "stages") return "bg-orange-500";
  if (layer === "food") return "bg-lime-500";
  if (layer === "kingdom") return "bg-blue-400";
  if (layer === "partners") return "bg-pink-500";
  return "bg-cyan-400";
}
