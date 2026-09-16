import bandLogos from "../../../data/band-logos.json";

export type HangmanWord = {
  id: string;
  text: string;
  category: string;
  tiers: ("easy" | "normal" | "hard")[];
};

function tiersForBand(name: string): HangmanWord["tiers"] {
  const len = name.replace(/[^A-Z]/gi, "").length;
  if (len <= 5) return ["easy", "normal"];
  if (len <= 9) return ["normal", "hard"];
  return ["hard"];
}

const BAND_WORDS: HangmanWord[] = (bandLogos.bands ?? [])
  .filter(
    (band) =>
      band.verified !== false &&
      typeof band.name === "string" &&
      band.name.trim().length > 0
  )
  .map((band) => ({
    id: band.id,
    text: band.name.toUpperCase(),
    category: "Band",
    tiers: tiersForBand(band.name),
  }));

export const HANGMAN_WORDS: HangmanWord[] = [
  ...BAND_WORDS,
  { id: "pit", text: "PIT", category: "Festival", tiers: ["easy", "normal"] },
  { id: "metal", text: "METAL", category: "Festival", tiers: ["easy", "normal"] },
  { id: "bourbon", text: "BOURBON", category: "Festival", tiers: ["normal", "hard"] },
  { id: "vip", text: "VIP", category: "Pass", tiers: ["easy", "normal"] },
  { id: "expo", text: "EXPO", category: "Venue", tiers: ["easy", "normal"] },
];

export const HANGMAN_TIERS = {
  easy: { maxLength: 6, misses: 8, hintAfterWrong: 3, showCategory: true },
  normal: { maxLength: 12, misses: 6, hintAfterWrong: 0, showCategory: true },
  hard: { maxLength: 20, misses: 5, hintAfterWrong: 0, showCategory: false },
} as const;

export const HANGMAN_RUN_SIZE = 5;
