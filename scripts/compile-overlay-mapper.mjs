/**
 * Vendors HotspotMapper from Them1947 (them1947.com) for LTL26 overlay alignment.
 * Same box/polygon editor used on Laughing Dragons dashboard art — compiled here
 * so the georef adapter can stay in sync with the upstream tool.
 *
 * Source: G:/LocalAIagent/Them1947/assets/js/hotspot-mapper.{js,css}
 * Output: public/vendor/hotspot-mapper/
 */
import { cpSync, mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const upstream = join("G:", "LocalAIagent", "Them1947", "assets");
const outDir = join(root, "public", "vendor", "hotspot-mapper");

const files = [
  { from: join(upstream, "js", "hotspot-mapper.js"), to: "hotspot-mapper.js" },
  { from: join(upstream, "css", "hotspot-mapper.css"), to: "hotspot-mapper.css" },
  { from: join("G:", "LocalAIagent", "Them1947", "HOTSPOT-MAPPER.md"), to: "README.md" },
];

mkdirSync(outDir, { recursive: true });

for (const { from, to } of files) {
  if (!existsSync(from)) {
    console.warn(`skip (missing upstream): ${from}`);
    continue;
  }
  cpSync(from, join(outDir, to));
  console.log(`copied → public/vendor/hotspot-mapper/${to}`);
}

const manifest = {
  compiledAt: new Date().toISOString(),
  upstream: "G:/LocalAIagent/Them1947",
  usage: "MapLibre georef adapter in src/hooks/use-overlay-freeform-mapper.ts",
  docs: "docs/overlay-freeform-mapper.md",
};

writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log("wrote manifest.json");
