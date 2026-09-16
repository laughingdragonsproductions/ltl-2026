"use client";

import Link from "next/link";
import type { SetAlertPayload } from "@/hooks/use-my-set-alerts";
import { getStageName } from "@/lib/data";
import { formatTime } from "@/lib/schedule-time";

type Props = {
  alert: SetAlertPayload;
  onDismiss: () => void;
};

export function SetAlertToast({ alert, onDismiss }: Props) {
  const { set } = alert;

  return (
    <div
      role="alert"
      className="fixed left-3 right-3 top-[calc(7.5rem+env(safe-area-inset-top))] z-50 rounded-xl border border-[var(--ld-neon-green)] bg-[var(--ld-black)]/95 p-4 shadow-lg ring-2 ring-[var(--ld-neon-green)]/40 md:left-auto md:right-4 md:max-w-sm md:top-24"
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ld-neon-green)]">
        Set starting now
      </p>
      <p className="mt-1 text-lg font-black text-white">{set.artist}</p>
      <p className="mt-1 text-sm text-[var(--ld-muted)]">
        {getStageName(set.stage)} · {formatTime(set.start)} · {set.label}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={`/schedule?day=${set.date}`}
          onClick={onDismiss}
          className="rounded-full bg-[var(--ld-neon-green)] px-4 py-2 text-xs font-black text-black"
        >
          View schedule
        </Link>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full border border-[var(--ld-border)] px-4 py-2 text-xs font-semibold text-[var(--ld-muted)]"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
