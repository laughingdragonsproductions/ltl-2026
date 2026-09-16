const STORAGE_KEY = "ltl26-free-game";

/** Games eligible for the one-time free pick (must match hub ids). */
export const PICKABLE_GAME_IDS = [
  "flappy-skull",
  "puzzle",
  "hangman",
  "band-matcher",
] as const;

export type PickableGameId = (typeof PICKABLE_GAME_IDS)[number];

export const GAME_TITLES: Record<PickableGameId, string> = {
  "flappy-skull": "Flappy Skull",
  puzzle: "LTL Slider",
  hangman: "Hangman",
  "band-matcher": "Band Matcher",
};

function isPickableGameId(id: string): id is PickableGameId {
  return (PICKABLE_GAME_IDS as readonly string[]).includes(id);
}

export function loadFreeGameChoice(): PickableGameId | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { gameId?: string };
    if (data.gameId && isPickableGameId(data.gameId)) return data.gameId;
    return null;
  } catch {
    return null;
  }
}

export function saveFreeGameChoice(gameId: PickableGameId): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ gameId, chosenAt: new Date().toISOString() })
  );
}

export function clearFreeGameChoice(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
