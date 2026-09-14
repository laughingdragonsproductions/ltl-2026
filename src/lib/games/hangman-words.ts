export type HangmanWord = {
  id: string;
  text: string;
  category: string;
  tiers: ("easy" | "normal" | "hard")[];
};

export const HANGMAN_WORDS: HangmanWord[] = [
  { id: "pit", text: "PIT", category: "Festival", tiers: ["easy", "normal"] },
  { id: "metal", text: "METAL", category: "Festival", tiers: ["easy", "normal"] },
  { id: "louder", text: "LOUDER", category: "Stage", tiers: ["easy", "normal"] },
  { id: "decibel", text: "DECIBEL", category: "Stage", tiers: ["normal", "hard"] },
  { id: "reverb", text: "REVERB", category: "Stage", tiers: ["normal", "hard"] },
  { id: "bourbon", text: "BOURBON", category: "Festival", tiers: ["normal", "hard"] },
  { id: "maiden", text: "MAIDEN", category: "Headliner", tiers: ["normal", "hard"] },
  { id: "bizkit", text: "BIZKIT", category: "Headliner", tiers: ["normal", "hard"] },
  { id: "tool", text: "TOOL", category: "Headliner", tiers: ["easy", "normal"] },
  { id: "skillet", text: "SKILLET", category: "Band", tiers: ["normal", "hard"] },
  { id: "anthrax", text: "ANTHRAX", category: "Band", tiers: ["normal", "hard"] },
  { id: "pantera", text: "PANTERA", category: "Band", tiers: ["normal", "hard"] },
  { id: "vip", text: "VIP", category: "Pass", tiers: ["easy", "normal"] },
  { id: "expo", text: "EXPO", category: "Venue", tiers: ["easy", "normal"] },
  { id: "louisville", text: "LOUISVILLE", category: "Venue", tiers: ["hard"] },
  { id: "headliner", text: "HEADLINER", category: "Festival", tiers: ["hard"] },
];

export const HANGMAN_TIERS = {
  easy: { maxLength: 4, misses: 8, hintAfterWrong: 3, showCategory: true },
  normal: { maxLength: 6, misses: 6, hintAfterWrong: 0, showCategory: true },
  hard: { maxLength: 10, misses: 5, hintAfterWrong: 0, showCategory: false },
} as const;

export const HANGMAN_RUN_SIZE = 5;
