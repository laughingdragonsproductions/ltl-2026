const LAST_SHOWN_KEY = "ltl26-share-nudge-last";
const DISMISS_FOREVER_KEY = "ltl26-share-nudge-dismissed";
const SESSION_START_KEY = "ltl26-share-nudge-session";

/** Hours between share nudges. */
export const SHARE_NUDGE_COOLDOWN_HOURS = 18;

/** Wait this long into a browsing session before first nudge. */
export const SHARE_NUDGE_SESSION_DELAY_MS = 4 * 60_000;

export const SHARE_NUDGE_TITLE = "Hey — do you like LTL26?";

export const SHARE_NUDGE_BODY =
  "PLEASE tell everyone else about it and help me out! Free map, schedule & alerts for Louder Than Life.";

export const SHARE_NUDGE_SHARE_TEXT =
  "Free Louder Than Life 2026 map, schedule & set alerts — check out LTL26!";

export function isShareNudgeDismissedForever(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(DISMISS_FOREVER_KEY) === "1";
}

export function dismissShareNudgeForever(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DISMISS_FOREVER_KEY, "1");
}

export function markShareNudgeShown(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_SHOWN_KEY, new Date().toISOString());
}

export function ensureShareNudgeSessionStart(): void {
  if (typeof window === "undefined") return;
  if (!sessionStorage.getItem(SESSION_START_KEY)) {
    sessionStorage.setItem(SESSION_START_KEY, String(Date.now()));
  }
}

export function shareNudgeSessionElapsedMs(): number {
  if (typeof window === "undefined") return 0;
  const raw = sessionStorage.getItem(SESSION_START_KEY);
  if (!raw) return 0;
  return Date.now() - Number(raw);
}

export function isShareNudgeDue(): boolean {
  if (typeof window === "undefined") return false;
  if (isShareNudgeDismissedForever()) return false;

  ensureShareNudgeSessionStart();
  if (shareNudgeSessionElapsedMs() < SHARE_NUDGE_SESSION_DELAY_MS) return false;

  const last = localStorage.getItem(LAST_SHOWN_KEY);
  if (!last) return true;
  const hours = (Date.now() - new Date(last).getTime()) / 3_600_000;
  return hours >= SHARE_NUDGE_COOLDOWN_HOURS;
}

/** ~25% chance once due — keeps it feeling random, not spammy. */
export function rollShareNudge(): boolean {
  return isShareNudgeDue() && Math.random() < 0.25;
}
