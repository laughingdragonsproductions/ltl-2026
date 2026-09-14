"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { data, getStageName } from "@/lib/data";
import { ShareButton } from "@/components/ShareButton";
import { useTier } from "@/lib/tier-context";
import type { PassTier } from "@/lib/data";

export function ScheduleView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tier, setTier } = useTier();
  const days = data.schedule.days;

  const [selectedDay, setSelectedDay] = useState(days[0].date);
  const [selectedStage, setSelectedStage] = useState<string>("all");

  useEffect(() => {
    const day = searchParams.get("day");
    const stage = searchParams.get("stage");
    const tierParam = searchParams.get("tier") as PassTier | null;
    if (day && days.some((d) => d.date === day)) setSelectedDay(day);
    if (stage) setSelectedStage(stage);
    if (tierParam && ["ga", "vip", "topshelf"].includes(tierParam)) setTier(tierParam);
  }, [searchParams, days, setTier]);

  const syncUrl = useCallback(
    (day: string, stage: string) => {
      const params = new URLSearchParams();
      params.set("day", day);
      if (stage !== "all") params.set("stage", stage);
      params.set("tier", tier);
      router.replace(`/schedule?${params.toString()}`, { scroll: false });
    },
    [router, tier]
  );

  const day = days.find((d) => d.date === selectedDay)!;

  const filteredSets = useMemo(() => {
    const sets = [...day.sets].sort((a, b) => a.start.localeCompare(b.start));
    if (selectedStage === "all") return sets;
    return sets.filter((s) => s.stage === selectedStage);
  }, [day, selectedStage]);

  const overlapping = useMemo(() => {
    const toMinutes = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
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
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    if (today !== selectedDay) return null;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const toMinutes = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    const current = filteredSets.find((s) => {
      const start = toMinutes(s.start);
      const end = toMinutes(s.end);
      return currentMinutes >= start && currentMinutes <= end;
    });

    const next = filteredSets.find((s) => toMinutes(s.start) > currentMinutes);

    return { current, next };
  }, [filteredSets, selectedDay]);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/schedule?day=${selectedDay}${selectedStage !== "all" ? `&stage=${selectedStage}` : ""}&tier=${tier}`
      : `https://ltl26.com/schedule?day=${selectedDay}`;

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
          {days.map((d) => (
            <button
              key={d.date}
              type="button"
              onClick={() => {
                setSelectedDay(d.date);
                syncUrl(d.date, selectedStage);
              }}
              className={`min-h-[44px] rounded px-3 py-2 text-sm font-semibold ${
                selectedDay === d.date
                  ? "bg-orange-600 text-white"
                  : "bg-zinc-800 text-zinc-300"
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

        {!nowNext?.current && !nowNext?.next && (
          <ShareButton url={shareUrl} />
        )}

        <div className="overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900 text-zinc-400">
              <tr>
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">Artist</th>
                <th className="px-4 py-2">Stage</th>
              </tr>
            </thead>
            <tbody>
              {filteredSets.map((set, i) => {
                const key = `${set.artist}-${set.start}`;
                const conflict = overlapping.has(key);
                return (
                  <tr
                    key={`${set.artist}-${set.start}-${i}`}
                    className={`border-t border-zinc-800 ${
                      set.headliner
                        ? "bg-orange-950/20"
                        : conflict
                          ? "bg-red-950/20"
                          : "bg-black/40"
                    }`}
                  >
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
        </p>
      </div>
  );
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${suffix}`;
}
