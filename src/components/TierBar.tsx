"use client";

import { useTier } from "@/lib/tier-context";
import type { PassTier } from "@/lib/data";
import { UnlockPill } from "@/components/UnlockPill";

const tierLabels: Record<PassTier, string> = {
  ga: "GA",
  vip: "VIP",
  topshelf: "Top Shelf",
};

export function TierBar() {
  const { tier, setTier } = useTier();

  return (
    <div className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--ld-border)] bg-[var(--ld-black)]/90 px-4 py-2 backdrop-blur">
      <div className="flex flex-wrap gap-1.5">
        <span className="self-center text-[10px] uppercase text-[var(--ld-muted)]">Pass</span>
        {(["ga", "vip", "topshelf"] as PassTier[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTier(t)}
            className={`min-h-[44px] min-w-[44px] rounded-full px-3 py-2 text-xs font-bold ${
              tier === t
                ? t === "topshelf"
                  ? "bg-red-600 text-white"
                  : t === "vip"
                    ? "bg-[var(--ld-neon-green-dim)] text-white"
                    : "bg-zinc-600 text-white"
                : "bg-zinc-900 text-[var(--ld-muted)]"
            }`}
          >
            {tierLabels[t]}
          </button>
        ))}
      </div>
      <UnlockPill />
    </div>
  );
}
