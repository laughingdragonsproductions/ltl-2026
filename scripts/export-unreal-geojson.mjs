/**
 * Export all festival POIs to WGS84 GeoJSON for Unreal / Cesium for Unreal import.
 * Run: node scripts/export-unreal-geojson.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const georef = JSON.parse(readFileSync(join(root, "data/georef.json"), "utf8"));
const { bounds } = georef;

function mapPercentToLatLng(x, y) {
  return {
    lng: bounds.west + (x / 100) * (bounds.east - bounds.west),
    lat: bounds.north - (y / 100) * (bounds.north - bounds.south),
  };
}

function load(name) {
  return JSON.parse(readFileSync(join(root, `data/${name}`), "utf8"));
}

const stages = load("stages.json").stages;
const entrances = load("entrances.json").entrances;
const vipZones = load("vip-zones.json").zones;
const foodZones = load("food-zones.json").zones;
const partners = load("partners.json").partners;
const kingdom = load("kingdom.json").attractions;

const features = [];

function addFeature(id, name, category, mapPosition, extra = {}) {
  const { lat, lng } = mapPercentToLatLng(mapPosition.x, mapPosition.y);
  features.push({
    type: "Feature",
    properties: { id, name, category, ...extra },
    geometry: { type: "Point", coordinates: [lng, lat, 0] },
  });
}

for (const s of stages) {
  addFeature(s.id, s.name, "stage", s.mapPosition, { stageType: s.type });
}
for (const e of entrances) {
  addFeature(e.id, e.name, "entrance", e.mapPosition, {
    requiresTier: e.requiresTier ?? null,
  });
}
for (const z of vipZones) {
  addFeature(z.id, z.name, "vip-zone", z.mapPosition, { tier: z.tier });
}
for (const f of foodZones) {
  addFeature(`food-${f.id}`, f.name, "food", f.mapPosition, { zoneId: f.id });
}
for (const p of partners) {
  addFeature(`partner-${p.id}`, p.name, "partner", p.mapPosition);
}
for (const a of kingdom) {
  addFeature(`kingdom-${a.id}`, a.name, "kingdom", a.mapPosition);
}

const outDir = join(root, "data/export");
mkdirSync(outDir, { recursive: true });

const geojson = {
  type: "FeatureCollection",
  metadata: {
    source: "LTL 2026 Virtual Map",
    crs: "EPSG:4326",
    venue: georef.venue,
    bounds: georef.bounds,
  },
  features,
};

const outPath = join(outDir, "ltl-pois-wgs84.geojson");
writeFileSync(outPath, JSON.stringify(geojson, null, 2));
console.log(`Exported ${features.length} features to ${outPath}`);
