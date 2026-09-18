"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import type { AppAlertPayload } from "@/hooks/use-my-set-alerts";
import { getStageName } from "@/lib/data";
import { formatTime } from "@/lib/schedule-time";
import {
  dismissShareNudgeForever,
  SHARE_NUDGE_BODY,
  SHARE_NUDGE_SHARE_TEXT,
  SHARE_NUDGE_TITLE,
} from "@/lib/share-nudge";

type Props = {
  alert: AppAlertPayload;
  onDismiss: () => void;
};

export function SetAlertToast({ alert, onDismiss }: Props) {
  if (alert.kind === "share") {
    return <ShareNudgeToast onDismiss={onDismiss} />;
  }

  const { set, phase } = alert;
  const soon = phase === "soon";

  return (
    <div
      role="alert"
      className="fixed left-3 right-3 top-[calc(7.5rem+env(safe-area-inset-top))] z-50 rounded-xl border border-[var(--ld-neon-green)] bg-[var(--ld-black)]/95 p-4 shadow-lg ring-2 ring-[var(--ld-neon-green)]/40 md:left-auto md:right-4 md:max-w-sm md:top-24"
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ld-neon-green)]">
        {soon ? "Coming up in ~15 min" : "Set starting now"}
      </p>
      <p className="mt-1 text-lg font-black text-white">{set.artist}</p>
      <p className="mt-1 text-sm text-[var(--ld-muted)]">
        {getStageName(set.stage)} · {formatTime(set.start)} · {set.label}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={`/schedule?day=${set.date}&view=my`}
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

function ShareNudgeToast({ onDismiss }: { onDismiss: () => void }) {
  const [copied, setCopied] = useState(false);

  const share = useCallback(async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/` : "https://ltl26.com/";
    if (navigator.share) {
      try {
        await navigator.share({
          title: "LTL26 — Louder Than Life 2026",
          text: SHARE_NUDGE_SHARE_TEXT,
          url,
        });
        onDismiss();
        return;
      } catch {
        /* cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(`${SHARE_NUDGE_SHARE_TEXT} ${url}`);
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
        onDismiss();
      }, 1600);
    } catch {
      onDismiss();
    }
  }, [onDismiss]);

  return (
    <div
      role="status"
      className="fixed left-3 right-3 top-[calc(7.5rem+env(safe-area-inset-top))] z-50 rounded-xl border border-fuchsia-400/70 bg-[var(--ld-black)]/95 p-4 shadow-lg ring-2 ring-fuchsia-500/30 md:left-auto md:right-4 md:max-w-sm md:top-24"
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-300">
        Quick favor
      </p>
      <p className="mt-1 text-lg font-black text-white">{SHARE_NUDGE_TITLE}</p>
      <p className="mt-2 text-sm text-[var(--ld-muted)]">{SHARE_NUDGE_BODY}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void share()}
          className="rounded-full bg-fuchsia-400 px-4 py-2 text-xs font-black text-black"
        >
          {copied ? "Link copied!" : "Share LTL26"}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full border border-[var(--ld-border)] px-4 py-2 text-xs font-semibold text-[var(--ld-muted)]"
        >
          Not now
        </button>
        <button
          type="button"
          onClick={() => {
            dismissShareNudgeForever();
            onDismiss();
          }}
          className="rounded-full px-2 py-2 text-[10px] text-zinc-500 underline"
        >
          Don&apos;t ask again
        </button>
      </div>
    </div>
  );
}
