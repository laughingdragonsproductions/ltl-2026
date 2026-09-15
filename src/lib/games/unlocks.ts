/** One full game free; $5 unlocks all games + 3D walkthrough. */
export const FREE_GAME_ID = "flappy-skull";

export function canPlayGame(gameId: string, unlocked: boolean): boolean {
  if (unlocked) return true;
  return gameId === FREE_GAME_ID;
}

export function isFreeGame(gameId: string): boolean {
  return gameId === FREE_GAME_ID;
}
