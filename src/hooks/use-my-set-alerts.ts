"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { showBrowserNotification } from "@/lib/browser-notifications";
import { getStageName } from "@/lib/data";
import {
  areAlertsEnabled,
  loadAlertSoundEnabled,
  loadMySets,
  markSetAlerted,
  wasSetAlertedRecently,
  type SavedSet,
} from "@/lib/my-sets";
import { makeSetId } from "@/lib/my-sets-types";
import { formatTime, minutesUntil, setStartDate } from "@/lib/schedule-time";
import { playSetAlertSound } from "@/lib/set-alert-sound";
import {
  ensureShareNudgeSessionStart,
  markShareNudgeShown,
  rollShareNudge,
  SHARE_NUDGE_SESSION_DELAY_MS,
} from "@/lib/share-nudge";

export type SetAlertPayload = {
  kind: "set";
  phase: "soon" | "now";
  set: SavedSet;
  setId: string;
};

export type ShareAlertPayload = {
  kind: "share";
};

export type AppAlertPayload = SetAlertPayload | ShareAlertPayload;

const CHECK_INTERVAL_MS = 30_000;
const SHARE_CHECK_INTERVAL_MS = 90_000;
/** Fire "soon" when within this many minutes of start (and not started yet). */
const SOON_WINDOW_MINUTES = 15;
const START_GRACE_MINUTES = 2;

function alertKey(setId: string, phase: "soon" | "now"): string {
  return `${setId}:${phase}`;
}

export function useMySetAlerts() {
  const [activeAlert, setActiveAlert] = useState<AppAlertPayload | null>(null);
  const alertedSessionRef = useRef(new Set<string>());
  const activeKindRef = useRef<AppAlertPayload["kind"] | null>(null);

  useEffect(() => {
    activeKindRef.current = activeAlert?.kind ?? null;
  }, [activeAlert]);

  const dismissAlert = useCallback(() => {
    setActiveAlert(null);
  }, []);

  const fireSetAlert = useCallback(
    (set: SavedSet, setId: string, phase: "soon" | "now") => {
      const key = alertKey(setId, phase);
      alertedSessionRef.current.add(key);
      markSetAlerted(key);

      const stage = getStageName(set.stage);
      const time = formatTime(set.start);
      const title =
        phase === "soon" ? `${set.artist} in ~15 min` : `${set.artist} starting now`;
      const body = `${stage} · ${time} · ${set.label}`;

      setActiveAlert({ kind: "set", phase, set, setId });
      void showBrowserNotification({
        title,
        body,
        tag: key,
        url: `/schedule?day=${set.date}&view=my`,
      });

      if (loadAlertSoundEnabled()) playSetAlertSound();
    },
    []
  );

  const checkAlerts = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!areAlertsEnabled()) return;
    if (activeKindRef.current === "set") return;

    const sets = loadMySets();
    if (sets.length === 0) return;

    const now = new Date();

    for (const set of sets) {
      const setId = makeSetId(set);
      const startAt = setStartDate(set.date, set.start);
      const mins = minutesUntil(startAt, now);

      const soonKey = alertKey(setId, "soon");
      const nowKey = alertKey(setId, "now");

      // Starting now (or within grace)
      if (mins <= 0 && mins >= -START_GRACE_MINUTES) {
        if (alertedSessionRef.current.has(nowKey)) continue;
        if (wasSetAlertedRecently(nowKey, 60)) continue;
        fireSetAlert(set, setId, "now");
        return;
      }

      // ~15 min heads-up
      if (mins > 0 && mins <= SOON_WINDOW_MINUTES) {
        if (alertedSessionRef.current.has(soonKey)) continue;
        if (wasSetAlertedRecently(soonKey, 90)) continue;
        fireSetAlert(set, setId, "soon");
        return;
      }
    }
  }, [fireSetAlert]);

  const checkShareNudge = useCallback(() => {
    if (typeof window === "undefined") return;
    if (activeKindRef.current != null) return;
    ensureShareNudgeSessionStart();
    if (!rollShareNudge()) return;

    markShareNudgeShown();
    setActiveAlert({ kind: "share" });
  }, []);

  useEffect(() => {
    ensureShareNudgeSessionStart();
    checkAlerts();
    const alertInterval = window.setInterval(checkAlerts, CHECK_INTERVAL_MS);
    const shareInterval = window.setInterval(checkShareNudge, SHARE_CHECK_INTERVAL_MS);

    const onVisibility = () => {
      if (document.visibilityState === "visible") checkAlerts();
    };
    const onSetsChanged = () => checkAlerts();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("ltl26-my-sets-changed", onSetsChanged);

    // First share roll after session delay window (aligned with eligibility)
    const shareKickoff = window.setTimeout(checkShareNudge, SHARE_NUDGE_SESSION_DELAY_MS + 5_000);

    return () => {
      window.clearInterval(alertInterval);
      window.clearInterval(shareInterval);
      window.clearTimeout(shareKickoff);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("ltl26-my-sets-changed", onSetsChanged);
    };
  }, [checkAlerts, checkShareNudge]);

  return { activeAlert, dismissAlert };
}
