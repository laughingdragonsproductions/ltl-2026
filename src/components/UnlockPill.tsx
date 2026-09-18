"use client";

import { useSession } from "@/lib/session-context";

export function UnlockPill() {
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
      className="rounded-full bg-[var(--ld-surface)] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--ld-muted)] ring-1 ring-[var(--ld-border-green)] hover:text-[var(--ld-neon-green)] sm:text-xs"
    >
      Games + calendar · $5
    </button>
  );
}
