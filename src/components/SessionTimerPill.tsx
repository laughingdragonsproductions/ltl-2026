"use client";

import { useSession } from "@/lib/session-context";

export function SessionTimerPill() {
  const { remainingLabel, unlocked, expired, openSupportModal, overlayTrialActive } =
    useSession();

  if (!overlayTrialActive && !unlocked) return null;

  return (
    <button
      type="button"
      onClick={() => expired && openSupportModal()}
      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide sm:text-xs ${
        unlocked
          ? "bg-[var(--ld-neon-green)]/20 text-[var(--ld-neon-green)] ring-1 ring-[var(--ld-neon-green)]/40"
          : expired
            ? "bg-red-950/60 text-red-300 ring-1 ring-red-500/50"
            : "bg-[var(--ld-purple-dim)]/40 text-[var(--ld-muted)] ring-1 ring-[var(--ld-purple-dim)]/50"
      }`}
    >
      {expired && !unlocked ? "Overlay trial ended — unlock" : remainingLabel}
    </button>
  );
}
