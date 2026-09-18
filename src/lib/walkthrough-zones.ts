import { data, tierHasAccess, type PassTier } from "./data";

export type WalkthroughZone = {
  id: string;
  name: string;
  category: "vip" | "food";
  mapPosition: { x: number; y: number };
  width: number;
  depth: number;
  color: string;
  opacity: number;
  subtitle?: string;
  tiers?: string[];
};

const VIP_ZONE_SIZES: Record<string, { width: number; depth: number }> = {
  "vip-green": { width: 180, depth: 120 },
  "topshelf-red": { width: 80, depth: 100 },
};

export function getWalkthroughZones(tier: PassTier): WalkthroughZone[] {
  const zones: WalkthroughZone[] = [];

  for (const z of data.vipZones.zones) {
    const size = VIP_ZONE_SIZES[z.id] ?? { width: 100, depth: 80 };
    zones.push({
      id: z.id,
      name: z.name,
      category: "vip",
      mapPosition: z.mapPosition,
      width: size.width,
      depth: size.depth,
      color: z.color ?? (z.tier === "topshelf" ? "#ef4444" : "#22c55e"),
      opacity: 0.22,
      subtitle: z.tier === "topshelf" ? "Top Shelf VIP" : "VIP",
      tiers: [z.tier],
    });
  }

  for (const f of data.foodZones.zones) {
    zones.push({
      id: `food-${f.id}`,
      name: f.name,
      category: "food",
      mapPosition: f.mapPosition,
      width: 52,
      depth: 52,
      color: "#a855f7",
      opacity: 0.18,
      subtitle: f.location,
      tiers: f.tiers,
    });
  }

  return zones.filter((z) => tierHasAccess(tier, z.tiers));
}
