import type { PickableGameId } from "./free-game-choice";

/** One game free (user picks on first visit); $5 unlocks all games + 3D walkthrough. */
export function canPlayGame(
  gameId: string,
  unlocked: boolean,
  freeGameId: PickableGameId | null
): boolean {
  if (unlocked) return true;
  if (!freeGameId) return false;
  return gameId === freeGameId;
}

export function isFreeGameForUser(
  gameId: string,
  freeGameId: PickableGameId | null
): boolean {
  return Boolean(freeGameId && gameId === freeGameId);
}
