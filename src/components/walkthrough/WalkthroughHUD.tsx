"use client";

import type { WalkPOI } from "@/lib/walkthrough-pois";
import type { PassTier } from "@/lib/data";
import type { WalkMode } from "./WalkthroughExperience";

type Props = {
  mode: WalkMode;
  onModeChange: (m: WalkMode) => void;
  locked: boolean;
  nearPoi: WalkPOI | null;
  tourActive: boolean;
  tourIndex: number;
  tourTotal: number;
  currentTourStop: WalkPOI | null;
  onStartTour: () => void;
  onNextTourStop: () => void;
  onStopTour: () => void;
  tier: PassTier;
};

export function WalkthroughHUD({
  mode,
  onModeChange,
  locked,
  nearPoi,
  tourActive,
  tourIndex,
  tourTotal,
  currentTourStop,
  onStartTour,
  onNextTourStop,
  onStopTour,
  tier,
}: Props) {
  return (
    <>
      {!locked && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40">
          <p className="rounded-lg bg-black/80 px-4 py-3 text-sm text-white">
            Click to enter walk mode · WASD to move · Mouse to look
          </p>
        </div>
      )}

      <div className="pointer-events-auto absolute left-3 top-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onModeChange("festival")}
          className={`rounded px-3 py-1.5 text-xs font-bold ${
            mode === "festival" ? "bg-orange-600 text-white" : "bg-zinc-800 text-zinc-300"
          }`}
        >
          Festival Map
        </button>
        <button
          type="button"
          onClick={() => onModeChange("satellite")}
          className={`rounded px-3 py-1.5 text-xs font-bold ${
            mode === "satellite" ? "bg-orange-600 text-white" : "bg-zinc-800 text-zinc-300"
          }`}
        >
          Satellite (Esri)
        </button>
        {!tourActive ? (
          <button
            type="button"
            onClick={onStartTour}
            className="rounded bg-green-700 px-3 py-1.5 text-xs font-bold text-white"
          >
            Guided VIP Tour
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onNextTourStop}
              className="rounded bg-green-600 px-3 py-1.5 text-xs font-bold text-white"
            >
              Next stop ({tourIndex + 1}/{tourTotal})
            </button>
            <button
              type="button"
              onClick={onStopTour}
              className="rounded bg-zinc-700 px-3 py-1.5 text-xs font-bold text-white"
            >
              Free roam
            </button>
          </>
        )}
      </div>

      {nearPoi && (
        <div className="pointer-events-none absolute bottom-3 left-3 right-3 rounded-lg border border-orange-800/50 bg-black/85 p-4 md:left-auto md:max-w-sm">
          <p className="text-xs uppercase text-orange-400">{nearPoi.category}</p>
          <h3 className="text-lg font-bold">{nearPoi.name}</h3>
          {nearPoi.detail && (
            <p className="mt-1 text-sm text-zinc-400">{nearPoi.detail}</p>
          )}
        </div>
      )}

      {tourActive && currentTourStop && (
        <div className="pointer-events-none absolute bottom-3 right-3 rounded-lg bg-green-950/90 px-3 py-2 text-xs text-green-300">
          Tour: {currentTourStop.name} · {tier.toUpperCase()} path
        </div>
      )}

      <div className="pointer-events-none absolute bottom-3 left-3 hidden text-[10px] text-zinc-500 md:block">
        Esc to release mouse · Satellite = open Esri imagery georeferenced to KEC
      </div>
    </>
  );
}
