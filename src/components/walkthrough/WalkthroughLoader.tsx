"use client";

import Link from "next/link";
import { useSession } from "@/lib/session-context";
import { STRIPE_CHECKOUT_ENABLED, STRIPE_PAYMENT_LINK } from "@/lib/stripe-public";
import { UNLOCK_CTA_FULL, UNLOCK_FEATURES_SENTENCE } from "@/lib/unlock-copy";
import { WalkthroughErrorBoundary } from "./WalkthroughErrorBoundary";
import { WalkthroughExperience } from "./WalkthroughExperience";

export function WalkthroughLoader() {
  const { unlocked, openSupportModal } = useSession();

  if (!unlocked) {
    return (
      <div className="rounded-2xl border border-[var(--ld-border-green)] bg-[var(--ld-surface)]/90 p-8 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--ld-purple)]">
          Premium · 3D walk
        </p>
        <h2 className="mt-2 text-xl font-black text-[var(--ld-neon-green)]">
          Walking 3D festival map
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm text-[var(--ld-muted)]">
          First-person walk with 3D stages on phone or laptop. Basic map, GPS overlay, and{" "}
          <strong className="text-white">one game</strong> stay free (your pick).{" "}
          {UNLOCK_FEATURES_SENTENCE}
        </p>
        {STRIPE_CHECKOUT_ENABLED && STRIPE_PAYMENT_LINK ? (
          <a
            href={STRIPE_PAYMENT_LINK}
            className="mt-6 inline-flex min-h-[44px] items-center rounded-full bg-[var(--ld-neon-green)] px-8 py-3 text-sm font-black text-black"
          >
            {UNLOCK_CTA_FULL}
          </a>
        ) : (
          <button
            type="button"
            onClick={openSupportModal}
            className="mt-6 min-h-[44px] rounded-full bg-[var(--ld-neon-green)] px-8 py-3 text-sm font-black text-black"
          >
            {UNLOCK_CTA_FULL} · Coming soon
          </button>
        )}
        <Link href="/map" className="mt-4 block text-sm text-[var(--ld-muted)] underline">
          Back to free map
        </Link>
      </div>
    );
  }

  return (
    <WalkthroughErrorBoundary>
      <WalkthroughExperience />
    </WalkthroughErrorBoundary>
  );
}
