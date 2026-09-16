#!/usr/bin/env node
/** Apply verified names from data/band-logos.json → slider-images.json + band-matcher.json */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(root, "data");

const logos = JSON.parse(readFileSync(join(dataDir, "band-logos.json"), "utf8"));
const verified = (logos.bands ?? []).filter(
  (b) => b.verified !== false && b.name?.trim()
);
const compiledAt = new Date().toISOString();
const images = verified.map(({ id, name }) => ({
  id,
  label: name,
  src: `/games/ltl26/puzzles/${id}.png`,
  verified: true,
}));

writeFileSync(
  join(dataDir, "slider-images.json"),
  JSON.stringify({ images, compiledAt }, null, 2),
  "utf8"
);

const bands = images.map(({ id, label, src }) => ({
  id,
  name: label,
  src,
  verified: true,
}));

writeFileSync(
  join(dataDir, "band-matcher.json"),
  JSON.stringify({ bands, compiledAt }, null, 2),
  "utf8"
);

console.log(`Synced ${bands.length} verified band logos from band-logos.json`);
for (const b of bands) {
  console.log(`  ${b.id} → ${b.name}`);
}
