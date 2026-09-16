export const UNLOCK_DEADLINE = "2026-09-21T23:59:59-04:00";

const STORAGE_KEY = "ltl26_session";

/** Local dev only — set NEXT_PUBLIC_DEV_UNLOCK=true in .env.local (ignored in production builds). */
export function isDevUnlockEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_DEV_UNLOCK === "true"
  );
}

export type SessionState = {
  unlockedUntil: string | null;
};

export function loadSession(): SessionState {
  if (typeof window === "undefined") {
    return { unlockedUntil: null };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { unlockedUntil: null };
    const parsed = JSON.parse(raw) as { unlockedUntil?: string | null };
    return { unlockedUntil: parsed.unlockedUntil ?? null };
  } catch {
    return { unlockedUntil: null };
  }
}

export function saveSession(state: SessionState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function isUnlocked(state: SessionState): boolean {
  if (!state.unlockedUntil) return false;
  return new Date(state.unlockedUntil).getTime() > Date.now();
}

export function setUnlockedUntil(until: string): SessionState {
  const state = loadSession();
  state.unlockedUntil = until;
  saveSession(state);
  return state;
}
