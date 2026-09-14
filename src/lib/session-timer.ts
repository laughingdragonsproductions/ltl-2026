export const FREE_LIMIT_MS = 600_000;
export const UNLOCK_DEADLINE = "2026-09-21T23:59:59-04:00";

const STORAGE_KEY = "ltl26_session";

export type SessionState = {
  usedMs: number;
  unlockedUntil: string | null;
  /** How many times the user earned +10 min by watching a promo video */
  videoExtensions?: number;
};

export function loadSession(): SessionState {
  if (typeof window === "undefined") {
    return { usedMs: 0, unlockedUntil: null };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { usedMs: 0, unlockedUntil: null };
    return JSON.parse(raw) as SessionState;
  } catch {
    return { usedMs: 0, unlockedUntil: null };
  }
}

export function saveSession(state: SessionState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function isUnlocked(state: SessionState): boolean {
  if (!state.unlockedUntil) return false;
  return new Date(state.unlockedUntil).getTime() > Date.now();
}

export function getRemainingMs(state: SessionState): number {
  if (isUnlocked(state)) return Infinity;
  return Math.max(0, FREE_LIMIT_MS - state.usedMs);
}

export function formatRemaining(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function setUnlockedUntil(until: string): SessionState {
  const state = loadSession();
  state.unlockedUntil = until;
  saveSession(state);
  return state;
}

export function addUsedMs(deltaMs: number): SessionState {
  const state = loadSession();
  if (isUnlocked(state)) return state;
  state.usedMs = Math.min(FREE_LIMIT_MS + 60_000, state.usedMs + deltaMs);
  saveSession(state);
  return state;
}

/** Reset overlay trial usage — another full 10 minutes after watching a promo video. */
export function grantVideoExtension(): SessionState {
  const state = loadSession();
  if (isUnlocked(state)) return state;
  state.usedMs = 0;
  state.videoExtensions = (state.videoExtensions ?? 0) + 1;
  saveSession(state);
  return state;
}
