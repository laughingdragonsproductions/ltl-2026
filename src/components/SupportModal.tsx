"use client";

import { useSession } from "@/lib/session-context";
import { STRIPE_CHECKOUT_ENABLED, STRIPE_PAYMENT_LINK } from "@/lib/stripe-public";

const KOFI_URL = process.env.NEXT_PUBLIC_KOFI_URL;

export function SupportModal() {
  const { showSupportModal, dismissSupportModal, unlocked } = useSession();

  if (!showSupportModal || unlocked) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div
        className="ld-glow-purple w-full max-w-md rounded-2xl border border-[var(--ld-border-green)] bg-[var(--ld-black)] p-6 shadow-2xl"
        role="dialog"
        aria-labelledby="support-title"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--ld-purple)]">
          Fan-built map
        </p>
        <h2 id="support-title" className="mt-2 text-xl font-black text-[var(--ld-neon-green)]">
          Unlock the full LTL26 experience
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--ld-text)]">
          Basic tap map, GPS overlay, and locators stay <strong className="text-white">free</strong>.
          {" "}<strong className="text-white">Flappy Skull</strong> is free to play.{" "}
          <strong className="text-white">$5</strong> unlocks the{" "}
          <strong className="text-white">walking 3D map</strong>,{" "}
          <strong className="text-white">all festival games</strong>, and removes{" "}
          <strong className="text-white">all ads</strong>.
        </p>

        {STRIPE_CHECKOUT_ENABLED && STRIPE_PAYMENT_LINK ? (
          <a
            href={STRIPE_PAYMENT_LINK}
            className="mt-5 flex w-full items-center justify-center rounded-full bg-[var(--ld-neon-green)] px-6 py-3 text-sm font-black text-black transition hover:opacity-90"
          >
            Unlock 3D walk + all games — $5
          </a>
        ) : (
          <p
            className="mt-5 flex w-full cursor-not-allowed items-center justify-center rounded-full border border-[var(--ld-border)] bg-[var(--ld-surface)] px-6 py-3 text-sm font-black text-[var(--ld-muted)]"
            aria-disabled="true"
          >
            Unlock 3D walk + all games — $5 · Coming soon
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
