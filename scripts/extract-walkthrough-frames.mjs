#!/usr/bin/env node
/**
 * Extract reference frames from a walk-through video for 3D structure tuning.
 *
 * Requires ffmpeg on PATH.
 *
 * Usage:
 *   npm run walk:frames -- ./my-tiktok-download.mp4 impact-stage
 *   npm run walk:frames -- ./video.mp4 louder-stage 0.5
 *
 * Args: <videoPath> <outputFolderName> [fps=1]
 */
import { execSync, spawnSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outRoot = join(root, "assets/walkthrough/reference/frames");

const videoPath = resolve(process.argv[2] ?? "");
const folderName = (process.argv[3] ?? "clip").replace(/[^\w-]/g, "-");
const fps = process.argv[4] ?? "1";

if (!videoPath || !existsSync(videoPath)) {
  console.error("Usage: npm run walk:frames -- <video.mp4> <folder-name> [fps]");
  console.error("Example: npm run walk:frames -- ./grit-load-in.mp4 main-stages 0.5");
  process.exit(1);
}

const ffmpegCheck = spawnSync("ffmpeg", ["-version"], { encoding: "utf8" });
if (ffmpegCheck.error || ffmpegCheck.status !== 0) {
  console.error("ffmpeg not found. Install from https://ffmpeg.org/ and retry.");
  process.exit(1);
}

const outDir = join(outRoot, folderName);
mkdirSync(outDir, { recursive: true });

const pattern = join(outDir, "frame-%04d.png");
console.log(`Extracting ${fps} fps → ${outDir}`);

execSync(
  `ffmpeg -i "${videoPath}" -vf fps=${fps} -q:v 2 "${pattern}" -y`,
  { stdio: "inherit" }
);

console.log("\nDone. Use frames to tune data/walkthrough-structures.json");
console.log(`Reference folder: assets/walkthrough/reference/frames/${folderName}/`);
