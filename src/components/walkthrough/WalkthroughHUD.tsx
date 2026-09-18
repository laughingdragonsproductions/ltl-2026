"use client";

import type { WalkPOI } from "@/lib/walkthrough-pois";
import type { PassTier } from "@/lib/data";
import type { WalkMode } from "./WalkthroughExperience";
import type { GpsWalkStatus } from "./use-walkthrough-gps";

type Props = {
  mode: WalkMode;
  onModeChange: (m: WalkMode) => void;
  locked: boolean;
  mobile: boolean;
  nearPoi: WalkPOI | null;
  tourActive: boolean;
  tourIndex: number;
  tourTotal: number;
  currentTourStop: WalkPOI | null;
  onStartTour: () => void;
  onNextTourStop: () => void;
  onStopTour: () => void;
  tier: PassTier;
  gpsFollow: boolean;
  onGpsFollowChange: (on: boolean) => void;
  gpsStatus: GpsWalkStatus;
  gpsAccuracyM: number | null;
  showMobileHint?: boolean;
  onDismissMobileHint?: () => void;
};

export function WalkthroughHUD({
  mode,
  onModeChange,
  locked,
  mobile,
  nearPoi,
  tourActive,
  tourIndex,
  tourTotal,
  currentTourStop,
  onStartTour,
  onNextTourStop,
  onStopTour,
  tier,
  gpsFollow,
  onGpsFollowChange,
  gpsStatus,
  gpsAccuracyM,
  showMobileHint = false,
  onDismissMobileHint,
}: Props) {
  return (
    <>
      {!locked && !mobile && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40">
          <p className="rounded-lg bg-black/80 px-4 py-3 text-sm text-white">
            Click to enter walk mode · WASD to move · Mouse to look
          </p>
        </div>
      )}

      {mobile && showMobileHint && (
        <button
          type="button"
          onClick={onDismissMobileHint}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/65 p-6"
        >
          <div className="max-w-xs rounded-xl border border-[var(--ld-neon-green)]/40 bg-black/90 p-5 text-center">
            <p className="text-sm font-bold text-white">Mobile controls</p>
            <ul className="mt-3 space-y-2 text-left text-xs text-zinc-300">
              <li>
                <span className="font-bold text-[var(--ld-neon-green)]">Joystick</span> — move
                around
              </li>
              <li>
                <span className="font-bold text-[var(--ld-neon-green)]">Drag right side</span> —
                look around
              </li>
              <li>
                <span className="font-bold text-[var(--ld-neon-green)]">GPS follow</span> — auto-on;
                walks with you on-site
              </li>
            </ul>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Tap to start
            </p>
          </div>
        </button>
      )}

      <div className="pointer-events-auto absolute left-3 top-3 z-40 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onModeChange("festival")}
          className={`min-h-[36px] rounded px-3 py-1.5 text-xs font-bold ${
            mode === "festival" ? "bg-orange-600 text-white" : "bg-zinc-800 text-zinc-300"
          }`}
        >
          Festival Map
        </button>
        {!mobile && (
          <button
            type="button"
            onClick={() => onModeChange("satellite")}
            className={`min-h-[36px] rounded px-3 py-1.5 text-xs font-bold ${
              mode === "satellite" ? "bg-orange-600 text-white" : "bg-zinc-800 text-zinc-300"
            }`}
          >
            Satellite
          </button>
        )}
        {mode === "festival" && (
          <button
            type="button"
            onClick={() => onGpsFollowChange(!gpsFollow)}
            className={`min-h-[36px] rounded px-3 py-1.5 text-xs font-bold ${
              gpsFollow ? "bg-[var(--ld-neon-green)] text-black" : "bg-zinc-800 text-zinc-300"
            }`}
          >
            {gpsFollow ? "GPS follow on" : "GPS follow"}
          </button>
        )}
        {!tourActive ? (
          <button
            type="button"
            onClick={onStartTour}
            className="min-h-[36px] rounded bg-green-700 px-3 py-1.5 text-xs font-bold text-white"
          >
            {mobile ? "Tour" : "Guided VIP Tour"}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onNextTourStop}
              className="min-h-[36px] rounded bg-green-600 px-3 py-1.5 text-xs font-bold text-white"
            >
              Next ({tourIndex + 1}/{tourTotal})
            </button>
            <button
              type="button"
              onClick={onStopTour}
              className="min-h-[36px] rounded bg-zinc-700 px-3 py-1.5 text-xs font-bold text-white"
            >
              Free roam
            </button>
          </>
        )}
      </div>

      {gpsFollow && gpsStatus !== "off" && (
        <div className="pointer-events-none absolute right-3 top-14 z-40 max-w-[11rem] rounded bg-black/80 px-2 py-1 text-[10px] text-[var(--ld-muted)]">
          {gpsStatus === "acquiring" && "Finding GPS… allow location"}
          {gpsStatus === "active" &&
            `Following you · ±${gpsAccuracyM != null ? Math.round(gpsAccuracyM) : "?"}m`}
          {gpsStatus === "denied" &&
            (mobile ? "Location denied — use joystick" : "Location denied")}
          {gpsStatus === "out-of-bounds" && "Outside grounds — head to KEC"}
          {gpsStatus === "unsupported" && "GPS not available in this browser"}
        </div>
      )}

      {nearPoi && (
        <div className="pointer-events-none absolute bottom-[max(9rem,calc(env(safe-area-inset-bottom)+8rem))] left-3 right-3 z-40 rounded-lg border border-orange-800/50 bg-black/85 p-4 md:bottom-3 md:left-auto md:max-w-sm">
          <p className="text-xs uppercase text-orange-400">{nearPoi.category}</p>
          <h3 className="text-lg font-bold">{nearPoi.name}</h3>
          {nearPoi.detail && (
            <p className="mt-1 text-sm text-zinc-400">{nearPoi.detail}</p>
          )}
        </div>
      )}

      {tourActive && currentTourStop && (
        <div className="pointer-events-none absolute bottom-[max(9rem,calc(env(safe-area-inset-bottom)+8rem))] right-3 z-40 rounded-lg bg-green-950/90 px-3 py-2 text-xs text-green-300 md:bottom-3">
          Tour: {currentTourStop.name}
        </div>
      )}

      {!mobile && (
        <div className="pointer-events-none absolute bottom-3 left-3 hidden text-[10px] text-zinc-500 md:block">
          Esc to release mouse · Satellite = Esri imagery at KEC
        </div>
      )}
    </>
  );
}
