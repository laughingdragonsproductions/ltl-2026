"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { data, getStageName } from "@/lib/data";
import { ShareButton } from "@/components/ShareButton";
import { useTier } from "@/lib/tier-context";
import type { PassTier } from "@/lib/data";
import {
  areAlertsEnabled,
  dismissDisclaimer,
  getMySetsForDay,
  hasSeenFirstSaveCallout,
  isDisclaimerDismissed,
  loadAlertSoundEnabled,
  loadMySets,
  markFirstSaveCalloutSeen,
  saveAlertSoundEnabled,
  saveAlertsEnabled,
  toggleMySet,
  type SavedSet,
} from "@/lib/my-sets";
import { makeSetId } from "@/lib/my-sets-types";
import {
  currentFestivalMinutes,
  festivalTodayIso,
  formatTime,
  toMinutes,
} from "@/lib/schedule-time";
import { playSetAlertSound, unlockAlertSound } from "@/lib/set-alert-sound";

type ScheduleSet = (typeof data.schedule.days)[number]["sets"][number];
type ViewMode = "all" | "my";

export function ScheduleView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tier, setTier } = useTier();
  const days = data.schedule.days;

  const [selectedDay, setSelectedDay] = useState(days[0].date);
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [mySets, setMySets] = useState<SavedSet[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [disclaimerDismissed, setDisclaimerDismissed] = useState(true);
  const [showFirstSaveCallout, setShowFirstSaveCallout] = useState(false);

  const refreshMySetsState = useCallback(() => {
    setMySets(loadMySets());
    setAlertsEnabled(areAlertsEnabled());
    setSoundEnabled(loadAlertSoundEnabled());
    setDisclaimerDismissed(isDisclaimerDismissed());
    setShowFirstSaveCallout(!hasSeenFirstSaveCallout() && loadMySets().length > 0);
  }, []);

  useEffect(() => {
    refreshMySetsState();
    setHydrated(true);
    const onChange = () => refreshMySetsState();
    window.addEventListener("ltl26-my-sets-changed", onChange);
    return () => window.removeEventListener("ltl26-my-sets-changed", onChange);
  }, [refreshMySetsState]);

  useEffect(() => {
    const day = searchParams.get("day");
    const stage = searchParams.get("stage");
    const view = searchParams.get("view");
    const tierParam = searchParams.get("tier") as PassTier | null;
    if (day && days.some((d) => d.date === day)) setSelectedDay(day);
    if (stage) setSelectedStage(stage);
    if (view === "my") setViewMode("my");
    if (tierParam && ["ga", "vip", "topshelf"].includes(tierParam)) setTier(tierParam);
  }, [searchParams, days, setTier]);

  const syncUrl = useCallback(
    (day: string, stage: string, view: ViewMode = viewMode) => {
      const params = new URLSearchParams();
      params.set("day", day);
      if (stage !== "all") params.set("stage", stage);
      if (view === "my") params.set("view", "my");
      params.set("tier", tier);
      router.replace(`/schedule?${params.toString()}`, { scroll: false });
    },
    [router, tier, viewMode]
  );

  const day = days.find((d) => d.date === selectedDay)!;
  const mySetIds = useMemo(() => new Set(mySets.map(makeSetId)), [mySets]);
  const savedCount = mySets.length;

  const filteredSets = useMemo(() => {
    if (viewMode === "my") {
      const saved = getMySetsForDay(selectedDay, mySets);
      if (selectedStage === "all") return saved;
      return saved.filter((s) => s.stage === selectedStage);
    }
    const sets = [...day.sets].sort((a, b) => a.start.localeCompare(b.start));
    if (selectedStage === "all") return sets;
    return sets.filter((s) => s.stage === selectedStage);
  }, [day, selectedStage, viewMode, mySets, selectedDay]);

  const overlapping = useMemo(() => {
    const ids = new Set<string>();
    for (let i = 0; i < filteredSets.length; i++) {
      for (let j = i + 1; j < filteredSets.length; j++) {
        const a = filteredSets[i];
        const b = filteredSets[j];
        const aStart = toMinutes(a.start);
        const aEnd = toMinutes(a.end);
        const bStart = toMinutes(b.start);
        const bEnd = toMinutes(b.end);
        if (aStart < bEnd && bStart < aEnd) {
          ids.add(`${a.artist}-${a.start}`);
          ids.add(`${b.artist}-${b.start}`);
        }
      }
    }
    return ids;
  }, [filteredSets]);

  const nowNext = useMemo(() => {
    const today = festivalTodayIso();
    if (today !== selectedDay) return null;

    const currentMinutes = currentFestivalMinutes();

    const current = filteredSets.find((s) => {
      const start = toMinutes(s.start);
      const end = toMinutes(s.end);
      return currentMinutes >= start && currentMinutes <= end;
    });

    const next = filteredSets.find((s) => toMinutes(s.start) > currentMinutes);

    return { current, next };
  }, [filteredSets, selectedDay]);

  const handleToggleSave = useCallback(
    async (set: ScheduleSet) => {
      void unlockAlertSound();
      const next = toggleMySet({
        date: selectedDay,
        label: day.label,
        stage: set.stage,
        artist: set.artist,
        start: set.start,
        end: set.end,
        headliner: set.headliner,
      });
      setMySets(next);
      setAlertsEnabled(areAlertsEnabled());
      if (next.length > 0 && !hasSeenFirstSaveCallout()) {
        setShowFirstSaveCallout(true);
      }
    },
    [selectedDay, day.label]
  );

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/schedule?day=${selectedDay}${selectedStage !== "all" ? `&stage=${selectedStage}` : ""}${viewMode === "my" ? "&view=my" : ""}&tier=${tier}`
      : `https://ltl26.com/schedule?day=${selectedDay}`;

  const showDisclaimerBanner =
    hydrated && alertsEnabled && savedCount > 0 && !disclaimerDismissed;

  return (
    <div className="space-y-4">
      {nowNext && (nowNext.current || nowNext.next) && (
        <div className="sticky top-[7.5rem] z-20 rounded-lg border border-orange-700/50 bg-orange-950/40 p-4 backdrop-blur md:top-24">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-orange-400">
                Who&apos;s on NOW
              </h3>
              {nowNext.current && (
                <p className="mt-2 text-white">
                  <span className="text-orange-400">NOW:</span> {nowNext.current.artist} @{" "}
                  {getStageName(nowNext.current.stage)} ({formatTime(nowNext.current.start)})
                </p>
              )}
              {nowNext.next && (
                <p className="mt-1 text-zinc-300">
                  <span className="text-zinc-400">NEXT:</span> {nowNext.next.artist} @{" "}
                  {getStageName(nowNext.next.stage)} ({formatTime(nowNext.next.start)})
                </p>
              )}
            </div>
            <ShareButton url={shareUrl} />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setViewMode("all");
            syncUrl(selectedDay, selectedStage, "all");
          }}
          className={`min-h-[44px] rounded px-3 py-2 text-sm font-semibold ${
            viewMode === "all"
              ? "bg-[var(--ld-neon-green)] text-black"
              : "bg-zinc-800 text-zinc-300"
          }`}
        >
          All sets
        </button>
        <button
          type="button"
          onClick={() => {
            setViewMode("my");
            syncUrl(selectedDay, selectedStage, "my");
          }}
          className={`min-h-[44px] rounded px-3 py-2 text-sm font-semibold ${
            viewMode === "my"
              ? "bg-[var(--ld-neon-green)] text-black"
              : "bg-zinc-800 text-zinc-300"
          }`}
        >
          My sets{hydrated && savedCount > 0 ? ` (${savedCount})` : ""}
        </button>
      </div>

      {showFirstSaveCallout && (
        <div className="rounded-lg border border-[var(--ld-neon-green)]/50 bg-[var(--ld-neon-green)]/10 p-3 text-sm text-[var(--ld-text)]">
          <p className="font-bold text-[var(--ld-neon-green)]">My sets saved on this device</p>
          <p className="mt-1 text-[var(--ld-muted)]">
            In-app alerts fire at set start time while this browser tab is open. Close the browser
            and alerts may not work — keep LTL26 active during the fest.
          </p>
          <button
            type="button"
            onClick={() => {
              markFirstSaveCalloutSeen();
              setShowFirstSaveCallout(false);
            }}
            className="mt-2 text-xs font-semibold text-[var(--ld-neon-green)] underline"
          >
            Got it
          </button>
        </div>
      )}

      {showDisclaimerBanner && (
        <div className="rounded-lg border border-amber-600/50 bg-amber-950/30 p-3 text-sm">
          <p className="font-bold text-amber-400">Alert</p>
          <p className="mt-1 text-zinc-300">
            In-app alerts only work while this browser tab is open and active. If you close the
            browser or switch away for long periods, alerts may not fire. Keep LTL26 open on your
            phone or laptop during the fest.
          </p>
          <button
            type="button"
            onClick={() => {
              dismissDisclaimer();
              setDisclaimerDismissed(true);
            }}
            className="mt-2 text-xs text-zinc-400 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {hydrated && savedCount > 0 && (
        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={alertsEnabled}
              onChange={(e) => {
                saveAlertsEnabled(e.target.checked);
                setAlertsEnabled(e.target.checked);
              }}
              className="accent-[var(--ld-neon-green)]"
            />
            <span className="text-zinc-300">Set alerts</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => {
                const on = e.target.checked;
                if (on) void unlockAlertSound();
                saveAlertSoundEnabled(on);
                setSoundEnabled(on);
              }}
              className="accent-[var(--ld-neon-green)]"
            />
            <span className="text-zinc-300">Sound</span>
          </label>
          <button
            type="button"
            onClick={() => {
              void unlockAlertSound().then(() => playSetAlertSound());
            }}
            className="text-xs text-[var(--ld-neon-green)] underline"
          >
            Test sound
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {days.map((d) => (
          <button
            key={d.date}
            type="button"
            onClick={() => {
              setSelectedDay(d.date);
              syncUrl(d.date, selectedStage);
            }}
            className={`min-h-[44px] rounded px-3 py-2 text-sm font-semibold ${
              selectedDay === d.date ? "bg-orange-600 text-white" : "bg-zinc-800 text-zinc-300"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <select
        value={selectedStage}
        onChange={(e) => {
          setSelectedStage(e.target.value);
          syncUrl(selectedDay, e.target.value);
        }}
        className="min-h-[44px] w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm md:w-auto"
      >
        <option value="all">All stages</option>
        {data.stages.stages.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      {!nowNext?.current && !nowNext?.next && <ShareButton url={shareUrl} />}

      {viewMode === "my" && filteredSets.length === 0 && (
        <p className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-400">
          No saved sets for this day yet. Switch to <strong className="text-white">All sets</strong>{" "}
          and tap the star on any set to build your lineup.
        </p>
      )}

      {filteredSets.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900 text-zinc-400">
              <tr>
                <th className="w-10 px-2 py-2" aria-label="Save" />
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">Artist</th>
                <th className="px-4 py-2">Stage</th>
              </tr>
            </thead>
            <tbody>
              {filteredSets.map((set, i) => {
                const rowKey = `${set.artist}-${set.start}-${i}`;
                const conflict = overlapping.has(`${set.artist}-${set.start}`);
                const rowDate = "date" in set && typeof set.date === "string" ? set.date : selectedDay;
                const setId = makeSetId({
                  date: rowDate,
                  stage: set.stage,
                  artist: set.artist,
                  start: set.start,
                });
                const saved = mySetIds.has(setId);
                const isMyView = viewMode === "my";

                return (
                  <tr
                    key={rowKey}
                    className={`border-t border-zinc-800 ${
                      saved
                        ? "ring-1 ring-inset ring-[var(--ld-neon-green)]/30 bg-[var(--ld-neon-green)]/5"
                        : set.headliner
                          ? "bg-orange-950/20"
                          : conflict
                            ? "bg-red-950/20"
                            : "bg-black/40"
                    }`}
                  >
                    <td className="px-2 py-2 text-center">
                      {!isMyView && (
                        <button
                          type="button"
                          aria-label={saved ? "Remove from My sets" : "Save to My sets"}
                          onClick={() => handleToggleSave(set as ScheduleSet)}
                          className={`min-h-[44px] min-w-[44px] text-lg leading-none ${
                            saved ? "text-[var(--ld-neon-green)]" : "text-zinc-600 hover:text-zinc-300"
                          }`}
                        >
                          {saved ? "★" : "☆"}
                        </button>
                      )}
                      {isMyView && (
                        <button
                          type="button"
                          aria-label="Remove from My sets"
                          onClick={() => {
                            const savedSet = set as SavedSet;
                            toggleMySet({
                              date: savedSet.date,
                              label: savedSet.label,
                              stage: savedSet.stage,
                              artist: savedSet.artist,
                              start: savedSet.start,
                              end: savedSet.end,
                              headliner: savedSet.headliner,
                            });
                          }}
                          className="min-h-[44px] min-w-[44px] text-lg text-[var(--ld-neon-green)]"
                        >
                          ★
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-2 font-mono text-zinc-300">
                      {formatTime(set.start)}–{formatTime(set.end)}
                    </td>
                    <td className="px-4 py-2 font-semibold">
                      {set.artist}
                      {set.headliner && (
                        <span className="ml-2 rounded bg-orange-600 px-1.5 py-0.5 text-[10px] uppercase">
                          Headliner
                        </span>
                      )}
                      {conflict && (
                        <span className="ml-2 rounded bg-red-700/80 px-1.5 py-0.5 text-[10px] uppercase">
                          Overlap
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-zinc-400">{getStageName(set.stage)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-zinc-500">
        Gates open {data.schedule.gatesOpen} daily. Set times subject to change — check the{" "}
        <a
          href={data.festival.links.schedule}
          className="text-orange-400 underline"
          target="_blank"
          rel="noreferrer"
        >
          official schedule
        </a>
        . Red rows = overlapping sets you might have to choose between.
        {viewMode === "my" && disclaimerDismissed && savedCount > 0 && alertsEnabled && (
          <> In-app alerts require an open browser tab.</>
        )}
      </p>
    </div>
  );
}
