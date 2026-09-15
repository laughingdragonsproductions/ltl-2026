#!/usr/bin/env node
/**
 * Ingest band logo PNGs → public/games/ltl26/bands/ + data/band-matcher.json
 * Usage: npm run games:band-matcher
 */
import {
  mkdirSync,
  readdirSync,
  writeFileSync,
  existsSync,
} from "fs";
import { dirname, join, basename } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const logoDir =
  process.env.LTL_BAND_LOGOS ||
  join(
    "G:\\Laughing Dragons\\Websites\\ltl26.com\\Images for games",
    "Sprites for bands-Coozie lids"
  );
const outBands = join(root, "public/games/ltl26/bands");
const manifestPath = join(root, "data/band-matcher.json");

const MAX_EDGE = 512;

function slugToName(slug) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function squareCropLogo(src, dest) {
  const img = sharp(src);
  const meta = await img.metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  const size = Math.min(w, h);
  const left = Math.floor((w - size) / 2);
  const top = Math.floor((h - size) / 2);

  await img
    .extract({ left, top, width: size, height: size })
    .resize(MAX_EDGE, MAX_EDGE, { fit: "inside" })
    .png()
    .toFile(dest);
}

if (!existsSync(logoDir)) {
  console.warn(`Logo folder not found: ${logoDir}`);
  console.warn("Band Matcher stays 'Coming soon' until logos are added.");
  process.exit(0);
}

const pngs = readdirSync(logoDir).filter((f) => /\.png$/i.test(f));
if (pngs.length === 0) {
  console.warn(`No PNG files in ${logoDir}`);
  console.warn("Band Matcher stays 'Coming soon' until logos are added.");
  process.exit(0);
}

mkdirSync(outBands, { recursive: true });

const bands = [];
for (const file of pngs) {
  const id = basename(file, ".png").toLowerCase().replace(/\s+/g, "-");
  const outFile = `${id}.png`;
  await squareCropLogo(join(logoDir, file), join(outBands, outFile));
  bands.push({
    id,
    name: slugToName(id),
    src: `/games/ltl26/bands/${outFile}`,
  });
}

bands.sort((a, b) => a.name.localeCompare(b.name));

writeFileSync(
  manifestPath,
  JSON.stringify({ bands, compiledAt: new Date().toISOString() }, null, 2),
  "utf8"
);

console.log(`Compiled ${bands.length} band logos → ${manifestPath}`);
if (bands.length < 8) {
  console.warn("Warning: Hard mode needs 8+ logos. Easy (4 pairs) still works.");
}
