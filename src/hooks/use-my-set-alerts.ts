"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  areAlertsEnabled,
  loadAlertSoundEnabled,
  loadMySets,
  markSetAlerted,
  wasSetAlertedRecently,
  type SavedSet,
} from "@/lib/my-sets";
import { makeSetId } from "@/lib/my-sets-types";
import { minutesUntil, setStartDate } from "@/lib/schedule-time";
import { playSetAlertSound } from "@/lib/set-alert-sound";

export type SetAlertPayload = {
  set: SavedSet;
  setId: string;
};

const CHECK_INTERVAL_MS = 30_000;
const START_GRACE_MINUTES = 2;

export function useMySetAlerts() {
  const [activeAlert, setActiveAlert] = useState<SetAlertPayload | null>(null);
  const alertedSessionRef = useRef(new Set<string>());

  const dismissAlert = useCallback(() => {
    setActiveAlert(null);
  }, []);

  const checkAlerts = useCallback(() => {
    if (typeof document === "undefined") return;
    if (document.visibilityState !== "visible") return;
    if (!areAlertsEnabled()) return;

    const sets = loadMySets();
    if (sets.length === 0) return;

    const now = new Date();
    const soundOn = loadAlertSoundEnabled();

    for (const set of sets) {
      const setId = makeSetId(set);
      if (alertedSessionRef.current.has(setId)) continue;
      if (wasSetAlertedRecently(setId, 60)) continue;

      const startAt = setStartDate(set.date, set.start);
      const mins = minutesUntil(startAt, now);

      if (mins > 0) continue;
      if (mins < -START_GRACE_MINUTES) continue;

      alertedSessionRef.current.add(setId);
      markSetAlerted(setId);
      setActiveAlert({ set, setId });
      if (soundOn) playSetAlertSound();
      break;
    }
  }, []);

  useEffect(() => {
    checkAlerts();
    const interval = window.setInterval(checkAlerts, CHECK_INTERVAL_MS);
    const onVisibility = () => {
      if (document.visibilityState === "visible") checkAlerts();
    };
    const onSetsChanged = () => checkAlerts();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("ltl26-my-sets-changed", onSetsChanged);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("ltl26-my-sets-changed", onSetsChanged);
    };
  }, [checkAlerts]);

  return { activeAlert, dismissAlert };
}
