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

/** Assemble Flow-ready single-paragraph prompt from structured shot fields. */
function assembleFlowPrompt(shot) {
  const parts = [
    shot.cinematography,
    shot.subjectAction,
    shot.environment,
    shot.lightingStyle,
    `Audio: ${shot.audio.replace(/^Audio:\s*/i, "")}`,
    `Constraints: ${shot.constraints.replace(/^Constraints:\s*/i, "")}`,
  ];
  return parts.join(". ").replace(/\.\./g, ".");
}

const totalSec = shotlist.shots.reduce((n, s) => n + s.durationSec, 0);

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
  `- Clip length: **under 10s each** (${shotlist.shots.map((s) => s.durationSec + "s").join(", ")})`,
  `- Raw total: **${totalSec}s** — trim in edit to ~30s viral cut`,
  `- Primary aspect: ${shotlist.flowDefaults.primaryAspectRatio}`,
  `- Also export: ${shotlist.flowDefaults.aspectRatios.filter((a) => a !== shotlist.flowDefaults.primaryAspectRatio).join(", ") || "none"}`,
  `- Audio: ${shotlist.flowDefaults.audio ? "on" : "off"}`,
  "",
  "### Prompt rules",
  "",
  ...shotlist.flowDefaults.promptRules.map((r) => `- ${r}`),
  "",
  "## 2025 reference videos (style only)",
  "",
  ...shotlist.sourceVideos2025.map((s) => `- ${s}`),
  "",
  "## Shot list — paste into Google Flow",
  "",
  "For each shot: set **duration** in Flow UI → attach **ingredients** → paste **Flow prompt** → optional **Negative prompt**.",
  "",
];

for (const shot of shotlist.shots) {
  const flowPrompt = assembleFlowPrompt(shot);
  lines.push(`### ${shot.id} — ${shot.beat}`);
  lines.push(`**Duration:** ${shot.durationSec}s (max ${shotlist.flowDefaults.durationSecMax}s)`);
  if (shot.onScreenText) lines.push(`**Overlay text (add in edit):** ${shot.onScreenText}`);
  lines.push(`**Ingredients:** ${shot.ingredients.join(", ")}`);
  lines.push("");
  lines.push("**Flow prompt:**");
  lines.push("");
  lines.push("```");
  lines.push(flowPrompt);
  lines.push("```");
  lines.push("");
  if (shot.negativePrompt) {
    lines.push("**Negative prompt:**");
    lines.push("");
    lines.push("```");
    lines.push(shot.negativePrompt);
    lines.push("```");
    lines.push("");
  }
}

lines.push(`## Voiceover (~${Math.min(totalSec, 30)}s cut)`, "");
lines.push("One line per clip — record tight to match sub-10s beats.", "");
for (const line of shotlist.voiceoverScript) {
  lines.push(`- ${line}`);
}

lines.push("", "## Social captions", "");
for (const [platform, text] of Object.entries(shotlist.captionCopy)) {
  lines.push(`**${platform}:** ${text}`);
  lines.push("");
}

lines.push("## Edit assembly", "");
lines.push("1. Generate all clips in 9:16 at listed durations.");
lines.push("2. Hard-cut on beat — no transitions longer than 0.2s.");
lines.push("3. Burn **onScreenText** in CapCut/DaVinci (Flow cannot render promo text reliably).");
lines.push("4. Optional: trim crowd + CTA clips to 4s each for a ~35s TikTok export.");

const outDir = join(root, "assets/flow-export");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "flow-brief.md");
writeFileSync(outPath, lines.join("\n"), "utf8");
console.log(`Wrote ${outPath} (${shotlist.shots.length} clips, ${totalSec}s raw)`);
