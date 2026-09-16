import bandManifest from "../../../data/band-matcher.json";
import sliderManifest from "../../../data/slider-images.json";

export type Band = { id: string; name: string; src: string };

export const BAND_MATCHER_DIFFICULTIES = {
  easy: { label: "Easy", pairs: 4 },
  med: { label: "Med", pairs: 6 },
  hard: { label: "Hard", pairs: 8 },
} as const;

export type BandMatcherDifficulty = keyof typeof BAND_MATCHER_DIFFICULTIES;

function bandsFromSlider(): Band[] {
  return (sliderManifest.images ?? []).map((img) => ({
    id: img.id,
    name: img.label,
    src: img.src,
  }));
}

function verifiedBands(bands: Band[]): Band[] {
  return bands.filter(
    (b) =>
      (b as Band & { verified?: boolean }).verified !== false &&
      Boolean(b.name?.trim()) &&
      Boolean(b.src?.trim())
  );
}

export const BAND_MATCHER_BANDS: Band[] = verifiedBands(
  (bandManifest.bands?.length ?? 0) >= 4 ? bandManifest.bands : bandsFromSlider()
);

export function bandMatcherCreateRng(seed?: number) {
  let s = seed ?? Date.now();
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

export function bandMatcherShuffle<T>(items: T[], rng: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function bandMatcherPickRandomBands(
  bands: Band[],
  pairCount: number,
  rng: () => number
): Band[] {
  const shuffled = bandMatcherShuffle(bands, rng);
  return shuffled.slice(0, Math.min(pairCount, shuffled.length));
}

export function bandMatcherBuildDeck(bands: Band[]): { bandId: string; key: string }[] {
  const cards: { bandId: string; key: string }[] = [];
  for (const band of bands) {
    cards.push({ bandId: band.id, key: `${band.id}-a` });
    cards.push({ bandId: band.id, key: `${band.id}-b` });
  }
  return cards;
}

export function bandMatcherGridColumns(pairCount: number): number {
  if (pairCount <= 4) return 4;
  if (pairCount <= 6) return 4;
  return 4;
}
