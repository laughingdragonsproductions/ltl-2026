"use client";

import Link from "next/link";
import type { GeorefBounds } from "@/lib/overlay-georef";

const NUDGE = 0.00005;
const NUDGE_FINE = 0.00001;

type OverlayControlPanelProps = {
  bounds: GeorefBounds;
  opacity: number;
  lockAspect: boolean;
  adjustMode: boolean;
  compact?: boolean;
  copied?: boolean;
  saved?: boolean;
  onOpacityChange: (value: number) => void;
  onLockAspectChange: (value: boolean) => void;
  onAdjustModeChange?: (value: boolean) => void;
  onBoundsChange: (patch: Partial<GeorefBounds>) => void;
  onNudge: (dLng: number, dLat: number) => void;
  onScale: (factor: number) => void;
  onSave?: () => void;
  onCopy?: () => void;
  onReset?: () => void;
};

export function OverlayControlPanel({
  bounds,
  opacity,
  lockAspect,
  adjustMode,
  compact = false,
  copied = false,
  saved = false,
  onOpacityChange,
  onLockAspectChange,
  onAdjustModeChange,
  onBoundsChange,
  onNudge,
  onScale,
  onSave,
  onCopy,
  onReset,
}: OverlayControlPanelProps) {
  return (
    <div
      className={`space-y-3 rounded-xl border border-[var(--ld-border)] bg-[var(--ld-surface)] p-4 ${compact ? "" : "lg:max-w-sm"}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--ld-neon-green)]">
          Overlay controls
        </p>
        {onAdjustModeChange && (
          <button
            type="button"
            onClick={() => onAdjustModeChange(!adjustMode)}
            className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
              adjustMode
                ? "bg-[var(--ld-neon-green)] text-black"
                : "border border-[var(--ld-border-green)] text-[var(--ld-neon-green)]"
            }`}
          >
            {adjustMode ? "Adjusting" : "Adjust placement"}
          </button>
        )}
      </div>

      <label className="block text-xs text-[var(--ld-muted)]">
        Opacity — {Math.round(opacity * 100)}%
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={opacity}
          onChange={(e) => onOpacityChange(Number(e.target.value))}
          className="mt-1 w-full accent-[var(--ld-neon-green)]"
        />
      </label>

      {adjustMode && (
        <>
          <p className="text-xs text-[var(--ld-muted)]">
            <strong className="text-[#39ff14]">Green</strong> corners & edges ·{" "}
            <strong className="text-[#7eb8d4]">cyan ✥</strong> move whole overlay ·{" "}
            <strong className="text-[#e8bc55]">gold ↻</strong> rotate (Shift = 15°) · drag inside
            dashed frame to pan. Saves automatically in this browser.
          </p>

          <label className="flex items-center gap-2 text-sm text-[var(--ld-text)]">
            <input
              type="checkbox"
              checked={lockAspect}
              onChange={(e) => onLockAspectChange(e.target.checked)}
              className="accent-[var(--ld-neon-green)]"
            />
            Lock PNG aspect (1024×503)
          </label>

          {!compact &&
            (["west", "east", "north", "south"] as const).map((key) => (
              <label key={key} className="block text-xs uppercase text-[var(--ld-muted)]">
                {key}
                <input
                  type="number"
                  step={0.0001}
                  value={bounds[key]}
                  onChange={(e) => onBoundsChange({ [key]: Number(e.target.value) })}
                  className="mt-1 w-full rounded border border-[var(--ld-border)] bg-black px-2 py-1.5 text-sm text-white"
                />
              </label>
            ))}

          <div className="grid grid-cols-3 gap-1">
            <span />
            <button type="button" onClick={() => onNudge(0, NUDGE)} className="ltl-nudge-btn">
              ↑ N
            </button>
            <span />
            <button type="button" onClick={() => onNudge(-NUDGE, 0)} className="ltl-nudge-btn">
              ← W
            </button>
            <button type="button" onClick={() => onNudge(0, -NUDGE)} className="ltl-nudge-btn">
              ↓ S
            </button>
            <button type="button" onClick={() => onNudge(NUDGE, 0)} className="ltl-nudge-btn">
              E →
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => onScale(0.98)} className="ltl-nudge-btn flex-1">
              Shrink
            </button>
            <button type="button" onClick={() => onScale(1.02)} className="ltl-nudge-btn flex-1">
              Grow
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => onNudge(0, NUDGE_FINE)} className="ltl-nudge-btn text-[10px]">
              Fine ↑
            </button>
            <button type="button" onClick={() => onNudge(0, -NUDGE_FINE)} className="ltl-nudge-btn text-[10px]">
              Fine ↓
            </button>
            <button type="button" onClick={() => onNudge(-NUDGE_FINE, 0)} className="ltl-nudge-btn text-[10px]">
              Fine ←
            </button>
            <button type="button" onClick={() => onNudge(NUDGE_FINE, 0)} className="ltl-nudge-btn text-[10px]">
              Fine →
            </button>
          </div>
        </>
      )}

      <div className="flex flex-col gap-2 border-t border-[var(--ld-border)] pt-3">
        {onSave && (
          <button
            type="button"
            onClick={onSave}
            className="rounded-full bg-[var(--ld-neon-green)] py-2 text-sm font-black text-black"
          >
            {saved ? "Saved in browser" : "Save placement"}
          </button>
        )}
        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="rounded-full border border-[var(--ld-border-green)] py-2 text-sm font-bold text-[var(--ld-neon-green)]"
          >
            {copied ? "Copied JSON" : "Copy georef JSON"}
          </button>
        )}
        {onReset && (
          <button type="button" onClick={onReset} className="text-xs text-[var(--ld-muted)] underline">
            Reset overlay defaults
          </button>
        )}
        {!compact && (
          <Link href="/overlay/live" className="text-xs text-[var(--ld-accent)] underline">
            Overlay aligner →
          </Link>
        )}
      </div>
    </div>
  );
}
