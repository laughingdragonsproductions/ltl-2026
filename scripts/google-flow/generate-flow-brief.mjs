#!/usr/bin/env node
/**
 * Generates a human + bot readable Google Flow production brief.
 * Usage: npm run flow:brief
 */
import { readFileSync, mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const shotlist = JSON.parse(
  readFileSync(join(root, "scripts/google-flow/viral-ltl26-shotlist.json"), "utf8")
);

const lines = [
  `# ${shotlist.project}`,
  "",
  `**URL:** ${shotlist.productUrl}`,
  `**Brand:** ${shotlist.brand.site} · ${shotlist.brand.studio} · ${shotlist.brand.partner}`,
  `**Disclaimer:** ${shotlist.brand.disclaimer}`,
  "",
  "## Flow settings",
  "",
  `- Model: ${shotlist.flowDefaults.model}`,
  `- Duration: ${shotlist.flowDefaults.durationSec}s per clip`,
  `- Aspect ratios: ${shotlist.flowDefaults.aspectRatios.join(", ")}`,
  `- Audio: ${shotlist.flowDefaults.audio ? "on" : "off"}`,
  "",
  "## 2025 reference videos (style only)",
  "",
  ...shotlist.sourceVideos2025.map((s) => `- ${s}`),
  "",
  "## Shot list — paste into Google Flow",
  "",
];

for (const shot of shotlist.shots) {
  lines.push(`### ${shot.id} — ${shot.beat}`);
  if (shot.onScreenText) lines.push(`**Overlay text:** ${shot.onScreenText}`);
  lines.push(`**Ingredients:** ${shot.ingredients.join(", ")}`);
  lines.push("");
  lines.push("```");
  lines.push(shot.veoPrompt);
  lines.push("```");
  lines.push("");
}

lines.push("## Voiceover (30s cut)", "");
for (const line of shotlist.voiceoverScript) {
  lines.push(`- ${line}`);
}

lines.push("", "## Social captions", "");
for (const [platform, text] of Object.entries(shotlist.captionCopy)) {
  lines.push(`**${platform}:** ${text}`);
  lines.push("");
}

const outDir = join(root, "assets/flow-export");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "flow-brief.md");
writeFileSync(outPath, lines.join("\n"), "utf8");
console.log(`Wrote ${outPath}`);
