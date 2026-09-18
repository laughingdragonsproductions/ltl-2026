import { isMobilePrimary } from "./is-mobile-primary";

const STORAGE_KEY = "ltl26_low_data";

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: string;
};

/** Prefer less bandwidth — auto on save-data / slow networks; user can override. */
export function isLowDataPreferred(): boolean {
  if (typeof window === "undefined") return false;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "off") return false;
  if (stored === "on") return true;

  const conn = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  if (conn?.saveData) return true;
  if (conn?.effectiveType && ["slow-2g", "2g", "3g"].includes(conn.effectiveType)) {
    return true;
  }

  // Festival crowds: default cautious on phones until user opts into full quality.
  return isMobilePrimary();
}

export function setLowDataOverride(mode: "on" | "off" | "auto") {
  if (typeof window === "undefined") return;
  if (mode === "auto") localStorage.removeItem(STORAGE_KEY);
  else localStorage.setItem(STORAGE_KEY, mode);
}

export function getLowDataOverride(): "on" | "off" | "auto" {
  if (typeof window === "undefined") return "auto";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "on" || stored === "off") return stored;
  return "auto";
}
