#!/usr/bin/env node
/**
 * Copies LTL game assets from external folder into public/games/ltl26/
 * Usage: npm run games:assets
 */
import { copyFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public/games/ltl26");
const srcDir =
  process.env.LTL_GAME_ASSETS ||
  "G:\\Laughing Dragons\\Websites\\ltl26.com\\Images for games";

const copies = [
  ["flappy skull sprites.png", "flappy-sprites.png"],
  ["Preparing_artwork_for_booth_20260914173249.jpeg", "puzzle-poster.jpg"],
  [
    "Creating_generic_festival_booth_._20260914180040.jpeg",
    "puzzle-booth.jpg",
  ],
  [
    "Creating_generic_festival_booth_._2K_20260914180039.jpeg",
    "puzzle-booth.jpg",
  ],
  ["Hangman Skull set sprites.png", "hangman-skull-sprites.png"],
];

mkdirSync(outDir, { recursive: true });

let ok = 0;
for (const [from, to] of copies) {
  const src = join(srcDir, from);
  const dest = join(outDir, to);
  if (!existsSync(src)) {
    console.warn(`Skip (missing): ${src}`);
    continue;
  }
  copyFileSync(src, dest);
  console.log(`Copied → public/games/ltl26/${to}`);
  ok += 1;
}

console.log(`Done (${ok}/${copies.length} files).`);
