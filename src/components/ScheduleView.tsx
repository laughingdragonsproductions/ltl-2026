"use client";

import { useMemo, useState } from "react";
import { data, getStageName } from "@/lib/data";

export function ScheduleView() {
  const days = data.schedule.days;
  const [selectedDay, setSelectedDay] = useState(days[0].date);
  const [selectedStage, setSelectedStage] = useState<string>("all");

  const day = days.find((d) => d.date === selectedDay)!;

  const filteredSets = useMemo(() => {
    const sets = [...day.sets].sort((a, b) => a.start.localeCompare(b.start));
    if (selectedStage === "all") return sets;
    return sets.filter((s) => s.stage === selectedStage);
  }, [day, selectedStage]);

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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {days.map((d) => (
          <button
            key={d.date}
            type="button"
            onClick={() => setSelectedDay(d.date)}
            className={`rounded px-3 py-2 text-sm font-semibold ${
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
        onChange={(e) => setSelectedStage(e.target.value)}
        className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
      >
        <option value="all">All stages</option>
        {data.stages.stages.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      {nowNext && (nowNext.current || nowNext.next) && (
        <div className="rounded-lg border border-orange-700/50 bg-orange-950/30 p-4">
          <h3 className="text-sm font-bold uppercase tracking-wide text-orange-400">
            Live Now / Next
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
            {filteredSets.map((set, i) => (
              <tr
                key={`${set.artist}-${set.start}-${i}`}
                className={`border-t border-zinc-800 ${
                  set.headliner ? "bg-orange-950/20" : "bg-black/40"
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
                </td>
                <td className="px-4 py-2 text-zinc-400">{getStageName(set.stage)}</td>
              </tr>
            ))}
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
        .
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
