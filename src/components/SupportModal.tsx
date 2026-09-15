"use client";

import { useSession } from "@/lib/session-context";
import { STRIPE_CHECKOUT_ENABLED, STRIPE_PAYMENT_LINK } from "@/lib/stripe-public";

const KOFI_URL = process.env.NEXT_PUBLIC_KOFI_URL;

export function SupportModal() {
  const { showSupportModal, dismissSupportModal, openVideoModal, unlocked } = useSession();

  if (!showSupportModal || unlocked) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div
        className="ld-glow-purple w-full max-w-md rounded-2xl border border-[var(--ld-purple)]/60 bg-[var(--ld-black)] p-6 shadow-2xl"
        role="dialog"
        aria-labelledby="support-title"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--ld-purple)]">
          Fan-built map
        </p>
        <h2 id="support-title" className="mt-2 text-xl font-black text-[var(--ld-neon-green)]">
          You&apos;ve had 10 minutes on the virtual overlay
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--ld-text)]">
          This unofficial LTL companion costs real money to make and host. The basic tap map
          stays free. Watch a short promo video for{" "}
          <strong className="text-white">another 10 minutes</strong>, or{" "}
          <strong className="text-white">$5</strong> unlocks{" "}
          <strong className="text-white">all features</strong> and removes{" "}
          <strong className="text-white">all ads</strong> — always.
        </p>

        <button
          type="button"
          onClick={openVideoModal}
          className="mt-5 flex w-full items-center justify-center rounded-full border border-[var(--ld-purple)] bg-[var(--ld-purple-dim)]/30 px-6 py-3 text-sm font-black text-[var(--ld-neon-green)] transition hover:bg-[var(--ld-purple-dim)]/50"
        >
          Watch video → +10 min free
        </button>

        {STRIPE_CHECKOUT_ENABLED && STRIPE_PAYMENT_LINK ? (
          <a
            href={STRIPE_PAYMENT_LINK}
            className="mt-3 flex w-full items-center justify-center rounded-full bg-[var(--ld-neon-green)] px-6 py-3 text-sm font-black text-black transition hover:opacity-90"
          >
            Unlock all features — $5
          </a>
        ) : (
          <p
            className="mt-3 flex w-full cursor-not-allowed items-center justify-center rounded-full border border-[var(--ld-purple-dim)] bg-[var(--ld-purple-dim)]/20 px-6 py-3 text-sm font-black text-[var(--ld-muted)]"
            aria-disabled="true"
          >
            Unlock all features — $5 · Coming soon
          </p>
        )}

        {KOFI_URL && (
          <a
            href={KOFI_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-3 block text-center text-xs text-[var(--ld-muted)] underline hover:text-white"
          >
            Support on Ko-fi (optional tip)
          </a>
        )}

        <button
          type="button"
          onClick={dismissSupportModal}
          className="mt-4 w-full py-2 text-sm text-[var(--ld-muted)] hover:text-white"
        >
          Maybe later
        </button>

        <p className="mt-3 text-center text-[10px] text-[var(--ld-muted)]">
          Unofficial fan guide · Real hosting costs · Basic map always free
        </p>
      </div>
    </div>
  );
}
