"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { data, tierHasAccess, type PassTier } from "@/lib/data";
import { useTier } from "@/lib/tier-context";

type LayerKey =
  | "stages"
  | "entrances"
  | "vip"
  | "food"
  | "partners"
  | "kingdom"
  | "pois";

type MapPoint = {
  id: string;
  name: string;
  x: number;
  y: number;
  layer: LayerKey;
  detail?: string;
  tiers?: string[];
};

export function InteractiveMap() {
  const { tier } = useTier();
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    stages: true,
    entrances: true,
    vip: true,
    food: false,
    partners: false,
    kingdom: false,
    pois: true,
  });
  const [selected, setSelected] = useState<MapPoint | null>(null);

  const points = useMemo(() => {
    const all: MapPoint[] = [];

    for (const s of data.stages.stages) {
      all.push({
        id: s.id,
        name: s.name,
        x: s.mapPosition.x,
        y: s.mapPosition.y,
        layer: "stages",
        detail: s.description,
      });
    }

    for (const e of data.entrances.entrances) {
      all.push({
        id: e.id,
        name: e.name,
        x: e.mapPosition.x,
        y: e.mapPosition.y,
        layer: "entrances",
        detail: e.bestFor?.join(" · "),
        tiers: e.requiresTier ? [e.requiresTier] : ["ga", "vip", "topshelf"],
      });
    }

    for (const z of data.vipZones.zones) {
      all.push({
        id: z.id,
        name: z.name,
        x: z.mapPosition.x,
        y: z.mapPosition.y,
        layer: "vip",
        detail: z.amenities.slice(0, 4).join(" · "),
        tiers: [z.tier],
      });
    }

    for (const f of data.foodZones.zones) {
      all.push({
        id: `food-${f.id}`,
        name: f.name,
        x: f.mapPosition.x,
        y: f.mapPosition.y,
        layer: "food",
        detail: f.vendors.slice(0, 3).join(", "),
        tiers: f.tiers,
      });
    }

    for (const p of data.partners.partners) {
      all.push({
        id: `partner-${p.id}`,
        name: p.name,
        x: p.mapPosition.x,
        y: p.mapPosition.y,
        layer: "partners",
        detail: p.description,
      });
    }

    for (const a of data.kingdom.attractions) {
      all.push({
        id: `kingdom-${a.id}`,
        name: `${a.id}: ${a.name}`,
        x: a.mapPosition.x,
        y: a.mapPosition.y,
        layer: "kingdom",
      });
    }

    for (const feature of data.pois.features) {
      const [x, y] = feature.geometry.coordinates;
      all.push({
        id: feature.properties.id,
        name: feature.properties.name,
        x,
        y,
        layer: "pois",
        tiers: feature.properties.tiers,
      });
    }

    return all.filter(
      (p) =>
        layers[p.layer] &&
        tierHasAccess(tier, p.tiers)
    );
  }, [layers, tier]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(layers) as LayerKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setLayers((prev) => ({ ...prev, [key]: !prev[key] }))}
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
              layers[key]
                ? "bg-orange-600 text-white"
                : "bg-zinc-800 text-zinc-400"
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      <div className="relative w-full overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900">
        <div className="relative aspect-[4/3] w-full">
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
              className={`absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-black shadow-lg transition hover:scale-150 ${dotColor(point.layer, tier)}`}
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
            />
          ))}
        </div>
      </div>

      {selected && (
        <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-orange-400">{selected.name}</h3>
              <p className="text-xs uppercase text-zinc-500">{selected.layer}</p>
              {selected.detail && (
                <p className="mt-2 text-sm text-zinc-300">{selected.detail}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-zinc-500 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-zinc-500">
        Map pins use percentage coordinates on the official 2026 amenity map. Layout is confirmed;
        absolute GPS is approximate.
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
