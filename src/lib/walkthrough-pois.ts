import { data, tierHasAccess, type PassTier } from "./data";

export type WalkPOI = {
  id: string;
  name: string;
  category: string;
  mapPosition: { x: number; y: number };
  detail?: string;
  tiers?: string[];
  color?: string;
};

export function collectWalkthroughPOIs(tier: PassTier): WalkPOI[] {
  const pois: WalkPOI[] = [];

  for (const s of data.stages.stages) {
    pois.push({
      id: s.id,
      name: s.name,
      category: "stage",
      mapPosition: s.mapPosition,
      detail: s.description,
      color: "#f97316",
    });
  }

  for (const e of data.entrances.entrances) {
    pois.push({
      id: e.id,
      name: e.name,
      category: "entrance",
      mapPosition: e.mapPosition,
      detail: e.bestFor?.join(" · "),
      tiers: e.requiresTier ? [e.requiresTier] : undefined,
      color: "#facc15",
    });
  }

  pois.push({
    id: "will-call",
    name: data.entrances.boxOfficeWillCall.name,
    category: "box-office",
    mapPosition: data.entrances.boxOfficeWillCall.mapPosition,
    detail: data.entrances.boxOfficeWillCall.hours,
    color: "#a3e635",
  });

  for (const z of data.vipZones.zones) {
    pois.push({
      id: z.id,
      name: z.name,
      category: "vip-zone",
      mapPosition: z.mapPosition,
      detail: z.amenities.slice(0, 3).join(" · "),
      tiers: [z.tier],
      color: z.tier === "topshelf" ? "#ef4444" : "#22c55e",
    });
  }

  for (const f of data.foodZones.zones) {
    pois.push({
      id: `food-${f.id}`,
      name: f.name,
      category: "food",
      mapPosition: f.mapPosition,
      detail: f.vendors.slice(0, 4).join(", "),
      tiers: f.tiers,
      color: "#a855f7",
    });
  }

  for (const p of data.partners.partners.filter((x) => x.id === 8 || x.name.includes("Music"))) {
    pois.push({
      id: `partner-${p.id}`,
      name: p.name,
      category: "partner",
      mapPosition: p.mapPosition,
      detail: p.description,
      color: "#ec4899",
    });
  }

  return pois.filter((p) => tierHasAccess(tier, p.tiers));
}

/** Guided tour: key path for first-time VIP */
export const guidedTourIds = [
  "highland",
  "will-call",
  "vip",
  "vip-green",
  "louder",
  "life",
  "topshelf-red",
  "topshelf",
  "impact",
  "kingdom",
  "cardinal",
];

export function getTourWaypoints(tier: PassTier): WalkPOI[] {
  const all = collectWalkthroughPOIs(tier);
  const kingdomEntrance = data.entrances.entrances.find((e) => e.id === "kingdom");
  if (kingdomEntrance) {
    all.push({
      id: "kingdom",
      name: kingdomEntrance.name,
      category: "entrance",
      mapPosition: kingdomEntrance.mapPosition,
      color: "#38bdf8",
    });
  }

  const ordered: WalkPOI[] = [];
  for (const id of guidedTourIds) {
    const poi = all.find((p) => p.id === id);
    if (poi) ordered.push(poi);
  }
  return ordered;
}
