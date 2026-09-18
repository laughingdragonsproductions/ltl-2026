"use client";

import { useSession } from "@/lib/session-context";
import { STRIPE_CHECKOUT_ENABLED, STRIPE_PAYMENT_LINK } from "@/lib/stripe-public";
import { UNLOCK_CTA_FULL, UNLOCK_FEATURES_SHORT } from "@/lib/unlock-copy";

/** Sticky unlock pitch on /games — primary conversion surface during the fest. */
export function GamesUnlockBanner() {
  const { unlocked, openSupportModal } = useSession();

  if (unlocked) return null;

  return (
    <div className="mt-6 rounded-2xl border border-[var(--ld-neon-green)]/40 bg-gradient-to-r from-[var(--ld-surface)] to-black p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--ld-purple)]">
          Festival weekend
        </p>
        <p className="mt-1 text-sm text-[var(--ld-text)]">
          One game free · <strong className="text-white">$5</strong> unlocks{" "}
          {UNLOCK_FEATURES_SHORT}.
        </p>
      </div>
      {STRIPE_CHECKOUT_ENABLED && STRIPE_PAYMENT_LINK ? (
        <a
          href={STRIPE_PAYMENT_LINK}
          className="mt-3 inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full bg-[var(--ld-neon-green)] px-6 py-2.5 text-sm font-black text-black sm:mt-0"
        >
          {UNLOCK_CTA_FULL}
        </a>
      ) : (
        <button
          type="button"
          onClick={openSupportModal}
          className="mt-3 inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full bg-[var(--ld-neon-green)] px-6 py-2.5 text-sm font-black text-black sm:mt-0"
        >
          {UNLOCK_CTA_FULL}
        </button>
      )}
    </div>
  );
}
