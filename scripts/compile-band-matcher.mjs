#!/usr/bin/env node
/**
 * Ingest band logo PNGs → public/games/ltl26/bands/ + data/band-matcher.json
 * Usage: npm run games:band-matcher
 */
import {
  copyFileSync,
  mkdirSync,
  readdirSync,
  writeFileSync,
  existsSync,
} from "fs";
import { dirname, join, basename } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const logoDir =
  process.env.LTL_BAND_LOGOS ||
  join(
    "G:\\Laughing Dragons\\Websites\\ltl26.com\\Images for games",
    "band-logos"
  );
const outBands = join(root, "public/games/ltl26/bands");
const manifestPath = join(root, "data/band-matcher.json");

function slugToName(slug) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

if (!existsSync(logoDir)) {
  console.error(`Logo folder not found: ${logoDir}`);
  console.error("Create it and add PNGs (e.g. iron-maiden.png), then re-run.");
  process.exit(1);
}

const pngs = readdirSync(logoDir).filter((f) => /\.png$/i.test(f));
if (pngs.length === 0) {
  console.error(`No PNG files in ${logoDir}`);
  process.exit(1);
}

mkdirSync(outBands, { recursive: true });

const bands = pngs.map((file) => {
  const id = basename(file, ".png").toLowerCase();
  copyFileSync(join(logoDir, file), join(outBands, file));
  return {
    id,
    name: slugToName(id),
    src: `/games/ltl26/bands/${file}`,
  };
});

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
