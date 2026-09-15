import { data, tierHasAccess, type PassTier } from "@/lib/data";
import { mapPercentToLatLng, type MapPosition } from "@/lib/georef";

export type LayerKey =
  | "stages"
  | "entrances"
  | "vip"
  | "food"
  | "partners"
  | "kingdom"
  | "pois";

export type MapPoint = {
  id: string;
  name: string;
  x: number;
  y: number;
  lat: number;
  lng: number;
  layer: LayerKey;
  detail?: string;
  tiers?: string[];
};

export const LAYER_COLORS: Record<LayerKey, string> = {
  stages: "#f97316",
  entrances: "#facc15",
  vip: "#39ff14",
  food: "#84cc16",
  partners: "#ec4899",
  kingdom: "#60a5fa",
  pois: "#22d3ee",
};

export const DEFAULT_LAYERS: Record<LayerKey, boolean> = {
  stages: true,
  entrances: true,
  vip: true,
  food: false,
  partners: false,
  kingdom: false,
  pois: true,
};

function withLatLng(
  point: Omit<MapPoint, "lat" | "lng"> & { x: number; y: number }
): MapPoint {
  const { lat, lng } = mapPercentToLatLng({ x: point.x, y: point.y } satisfies MapPosition);
  return { ...point, lat, lng };
}

export function buildAllMapPoints(): MapPoint[] {
  const all: MapPoint[] = [];

  for (const s of data.stages.stages) {
    all.push(
      withLatLng({
        id: s.id,
        name: s.name,
        x: s.mapPosition.x,
        y: s.mapPosition.y,
        layer: "stages",
        detail: s.description,
      })
    );
  }

  for (const e of data.entrances.entrances) {
    all.push(
      withLatLng({
        id: e.id,
        name: e.name,
        x: e.mapPosition.x,
        y: e.mapPosition.y,
        layer: "entrances",
        detail: e.bestFor?.join(" · "),
        tiers: e.requiresTier ? [e.requiresTier] : ["ga", "vip", "topshelf"],
      })
    );
  }

  for (const z of data.vipZones.zones) {
    all.push(
      withLatLng({
        id: z.id,
        name: z.name,
        x: z.mapPosition.x,
        y: z.mapPosition.y,
        layer: "vip",
        detail: z.amenities.slice(0, 4).join(" · "),
        tiers: [z.tier],
      })
    );
  }

  for (const f of data.foodZones.zones) {
    all.push(
      withLatLng({
        id: `food-${f.id}`,
        name: f.name,
        x: f.mapPosition.x,
        y: f.mapPosition.y,
        layer: "food",
        detail: f.vendors.slice(0, 3).join(", "),
        tiers: f.tiers,
      })
    );
  }

  for (const p of data.partners.partners) {
    all.push(
      withLatLng({
        id: `partner-${p.id}`,
        name: p.name,
        x: p.mapPosition.x,
        y: p.mapPosition.y,
        layer: "partners",
        detail: p.description,
      })
    );
  }

  for (const a of data.kingdom.attractions) {
    all.push(
      withLatLng({
        id: `kingdom-${a.id}`,
        name: `${a.id}: ${a.name}`,
        x: a.mapPosition.x,
        y: a.mapPosition.y,
        layer: "kingdom",
      })
    );
  }

  for (const feature of data.pois.features) {
    const [x, y] = feature.geometry.coordinates;
    all.push(
      withLatLng({
        id: feature.properties.id,
        name: feature.properties.name,
        x,
        y,
        layer: "pois",
        tiers: feature.properties.tiers,
      })
    );
  }

  return all;
}

export function filterMapPoints(
  points: MapPoint[],
  layers: Record<LayerKey, boolean>,
  tier: PassTier
): MapPoint[] {
  return points.filter(
    (p) => layers[p.layer] && tierHasAccess(tier, p.tiers)
  );
}

/** Great-circle distance in meters */
export function distanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}
