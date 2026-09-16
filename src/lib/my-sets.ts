import { makeSetId, type SavedSet, type ScheduleSetInput } from "@/lib/my-sets-types";

export type { SavedSet, ScheduleSetInput } from "@/lib/my-sets-types";
export { makeSetId } from "@/lib/my-sets-types";

const STORAGE_KEY = "ltl26-my-sets";
const ALERTS_ENABLED_KEY = "ltl26-my-sets-alerts-enabled";
const ALERT_SOUND_KEY = "ltl26-my-sets-alert-sound";
const DISCLAIMER_DISMISSED_KEY = "ltl26-my-sets-alert-disclaimer-dismissed";
const ALERTED_KEY = "ltl26-my-sets-alerted";
const FIRST_SAVE_SEEN_KEY = "ltl26-my-sets-first-save-seen";

type MySetsStore = {
  version: 1;
  sets: SavedSet[];
};

function emptyStore(): MySetsStore {
  return { version: 1, sets: [] };
}

export function loadMySets(): SavedSet[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MySetsStore;
    if (parsed.version !== 1 || !Array.isArray(parsed.sets)) return [];
    return parsed.sets;
  } catch {
    return [];
  }
}

export function saveMySets(sets: SavedSet[]): void {
  if (typeof window === "undefined") return;
  const store: MySetsStore = { version: 1, sets };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent("ltl26-my-sets-changed"));
}

export function isMySet(id: string, sets?: SavedSet[]): boolean {
  const list = sets ?? loadMySets();
  return list.some((s) => makeSetId(s) === id);
}

export function getMySetsForDay(date: string, sets?: SavedSet[]): SavedSet[] {
  const list = sets ?? loadMySets();
  return list
    .filter((s) => s.date === date)
    .sort((a, b) => a.start.localeCompare(b.start));
}

export function toggleMySet(input: ScheduleSetInput): SavedSet[] {
  const id = makeSetId(input);
  const existing = loadMySets();
  const idx = existing.findIndex((s) => makeSetId(s) === id);
  if (idx >= 0) {
    const next = existing.filter((_, i) => i !== idx);
    saveMySets(next);
    return next;
  }
  const saved: SavedSet = {
    ...input,
    savedAt: new Date().toISOString(),
  };
  const next = [...existing, saved];
  saveMySets(next);
  if (loadAlertsEnabled() === null && next.length === 1) {
    saveAlertsEnabled(true);
  }
  return next;
}

export function loadAlertsEnabled(): boolean | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(ALERTS_ENABLED_KEY);
  if (raw == null) return null;
  return raw === "true";
}

export function saveAlertsEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ALERTS_ENABLED_KEY, String(enabled));
  window.dispatchEvent(new CustomEvent("ltl26-my-sets-changed"));
}

export function areAlertsEnabled(): boolean {
  const saved = loadAlertsEnabled();
  if (saved != null) return saved;
  return loadMySets().length > 0;
}

export function loadAlertSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const raw = localStorage.getItem(ALERT_SOUND_KEY);
  if (raw == null) return true;
  return raw === "true";
}

export function saveAlertSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ALERT_SOUND_KEY, String(enabled));
}

export function isDisclaimerDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DISCLAIMER_DISMISSED_KEY) === "true";
}

export function dismissDisclaimer(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DISCLAIMER_DISMISSED_KEY, "true");
}

export function hasSeenFirstSaveCallout(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(FIRST_SAVE_SEEN_KEY) === "true";
}

export function markFirstSaveCalloutSeen(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(FIRST_SAVE_SEEN_KEY, "true");
}

type AlertedRecord = Record<string, string>;

export function loadAlertedRecords(): AlertedRecord {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ALERTED_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as AlertedRecord;
  } catch {
    return {};
  }
}

export function markSetAlerted(setId: string): void {
  if (typeof window === "undefined") return;
  const records = loadAlertedRecords();
  records[setId] = new Date().toISOString();
  localStorage.setItem(ALERTED_KEY, JSON.stringify(records));
}

export function wasSetAlertedRecently(setId: string, withinMinutes = 2): boolean {
  const records = loadAlertedRecords();
  const at = records[setId];
  if (!at) return false;
  const elapsed = (Date.now() - new Date(at).getTime()) / 60_000;
  return elapsed < withinMinutes;
}
