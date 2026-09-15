"use client";

import { useSession } from "@/lib/session-context";

export function SessionTimerPill() {
  const { unlocked, openSupportModal } = useSession();

  if (unlocked) {
    return (
      <span className="rounded-full bg-[var(--ld-neon-green)]/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--ld-neon-green)] ring-1 ring-[var(--ld-neon-green)]/40 sm:text-xs">
        Unlocked · Ad-free
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={openSupportModal}
      className="rounded-full bg-[var(--ld-purple-dim)]/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--ld-muted)] ring-1 ring-[var(--ld-purple-dim)]/50 hover:text-white sm:text-xs"
    >
      3D + games · $5
    </button>
  );
}
