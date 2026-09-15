#!/usr/bin/env node
/**
 * Copies LTL game assets from external folder into public/games/ltl26/
 * Usage: npm run games:assets
 */
import {
  copyFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
  writeFileSync,
} from "fs";
import { dirname, join, extname } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outRoot = join(root, "public/games/ltl26");
const dataDir = join(root, "data");
const srcDir =
  process.env.LTL_GAME_ASSETS ||
  "G:\\Laughing Dragons\\Websites\\ltl26.com\\Images for games";

const MAX_EDGE = 1024;

async function centerCropSquare(src, dest, { resize = true } = {}) {
  const img = sharp(src);
  const meta = await img.metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  const size = Math.min(w, h);
  const left = Math.floor((w - size) / 2);
  const top = Math.floor((h - size) / 2);

  let pipeline = img.extract({ left, top, width: size, height: size });
  if (resize && size > MAX_EDGE) {
    pipeline = pipeline.resize(MAX_EDGE, MAX_EDGE, { fit: "cover" });
  }

  await pipeline.toFile(dest);
}

async function copyAsIs(src, dest) {
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
}

async function processFlappy() {
  const flappySrc = join(srcDir, "Flappy skull");
  const flappyOut = join(outRoot, "flappy");
  mkdirSync(flappyOut, { recursive: true });

  const mappings = [
    ["Skull sprite.png", "skull.png", true],
    ["glasses.png", "glasses.png", false],
    ["Deadphones.png", "headphones.png", false],
  ];

  let ok = 0;
  for (const [from, to, crop] of mappings) {
    const src = join(flappySrc, from);
    const dest = join(flappyOut, to);
    if (!existsSync(src)) {
      console.warn(`Skip (missing): ${src}`);
      continue;
    }
    if (crop) {
      await centerCropSquare(src, dest);
    } else {
      await copyAsIs(src, dest);
    }
    console.log(`Flappy → public/games/ltl26/flappy/${to}`);
    ok += 1;
  }
  return ok;
}

async function processHangman() {
  const hangmanSrc = join(srcDir, "Hangman");
  const hangmanOut = join(outRoot, "hangman");
  mkdirSync(hangmanOut, { recursive: true });

  const mappings = [
    ["Hangman Skull head sprites.png", "head.png"],
    ["Hangman body sprite.png", "body.png"],
    ["Hangman LEFT arm sprite.png", "arm-l.png"],
    ["Hangman Right arm sprite.png", "arm-r.png"],
    ["Hangman Left leg sprite.png", "leg-l.png"],
    ["Hangman Right leg sprite.png", "leg-r.png"],
  ];

  let ok = 0;
  for (const [from, to] of mappings) {
    const src = join(hangmanSrc, from);
    const dest = join(hangmanOut, to);
    if (!existsSync(src)) {
      console.warn(`Skip (missing): ${src}`);
      continue;
    }
    await copyAsIs(src, dest);
    console.log(`Hangman → public/games/ltl26/hangman/${to}`);
    ok += 1;
  }
  return ok;
}

function resolveSliderSrc() {
  const candidates = [
    join(srcDir, "slider puzzle images", "LTL"),
    join(srcDir, "slider puzzle images"),
  ];
  for (const dir of candidates) {
    if (!existsSync(dir)) continue;
    const pngs = readdirSync(dir).filter((f) => /\.png$/i.test(f));
    if (pngs.length > 0) return dir;
  }
  return null;
}

async function processSlider() {
  const sliderSrc = resolveSliderSrc();
  const sliderOut = join(outRoot, "puzzles");
  mkdirSync(sliderOut, { recursive: true });

  if (!sliderSrc) {
    console.warn(`Skip slider (no PNGs in slider puzzle images/)`);
    return { ok: 0, manifest: [] };
  }

  const pngs = readdirSync(sliderSrc)
    .filter((f) => /\.png$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const manifest = [];
  let ok = 0;

  for (let i = 0; i < pngs.length; i += 1) {
    const file = pngs[i];
    const num = String(i + 1).padStart(2, "0");
    const id = `puzzle-${num}`;
    const destName = `${id}.png`;
    const src = join(sliderSrc, file);
    const dest = join(sliderOut, destName);

    const meta = await sharp(src).metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    if (w !== h) {
      await centerCropSquare(src, dest);
    } else {
      let pipeline = sharp(src);
      if (Math.max(w, h) > MAX_EDGE) {
        pipeline = pipeline.resize(MAX_EDGE, MAX_EDGE, { fit: "inside" });
      }
      await pipeline.toFile(dest);
    }

    const bandName = file
      .replace(/\.png$/i, "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    manifest.push({
      id,
      label: bandName || `LTL puzzle ${i + 1}`,
      src: `/games/ltl26/puzzles/${destName}`,
    });
    console.log(`Slider → public/games/ltl26/puzzles/${destName}`);
    ok += 1;
  }

  return { ok, manifest };
}

async function processGeneric() {
  const genericSrc = join(srcDir, "Generic images");
  if (!existsSync(genericSrc)) return 0;

  const jpgs = readdirSync(genericSrc).filter((f) =>
    /\.(jpe?g)$/i.test(f)
  );
  if (jpgs.length === 0) return 0;

  const poster = jpgs.find((f) => /Preparing_artwork/i.test(f)) ?? jpgs[0];
  const booth =
    jpgs.find((f) => /Creating_generic_festival_booth/i.test(f)) ?? jpgs[0];

  let ok = 0;
  for (const [file, name] of [
    [poster, "puzzle-poster.jpg"],
    [booth, "puzzle-booth.jpg"],
  ]) {
    const src = join(genericSrc, file);
    const dest = join(outRoot, name);
    if (!existsSync(src)) continue;
    await centerCropSquare(src, dest);
    console.log(`Generic → public/games/ltl26/${name}`);
    ok += 1;
  }
  return ok;
}

async function main() {
  mkdirSync(outRoot, { recursive: true });
  mkdirSync(dataDir, { recursive: true });

  console.log(`Source: ${srcDir}\n`);

  const flappyOk = await processFlappy();
  const hangmanOk = await processHangman();
  const { ok: sliderOk, manifest } = await processSlider();
  const genericOk = await processGeneric();

  if (manifest.length > 0) {
    const compiledAt = new Date().toISOString();
    const manifestPath = join(dataDir, "slider-images.json");
    writeFileSync(
      manifestPath,
      JSON.stringify({ images: manifest, compiledAt }, null, 2),
      "utf8"
    );
    console.log(`\nWrote ${manifest.length} slider entries → data/slider-images.json`);

    const bands = manifest.map(({ id, label, src }) => ({ id, name: label, src }));
    const bandPath = join(dataDir, "band-matcher.json");
    writeFileSync(
      bandPath,
      JSON.stringify({ bands, compiledAt }, null, 2),
      "utf8"
    );
    console.log(`Wrote ${bands.length} band entries → data/band-matcher.json`);
  }

  const total = flappyOk + hangmanOk + sliderOk + genericOk;
  console.log(
    `\nDone (${total} files: flappy ${flappyOk}, hangman ${hangmanOk}, slider ${sliderOk}, generic ${genericOk}).`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
