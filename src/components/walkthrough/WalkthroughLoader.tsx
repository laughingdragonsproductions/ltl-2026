"use client";

/** Mobile 3D walk (on-screen controls + GPS follow) — see docs/walkthrough-mobile-future.md */

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/session-context";
import { STRIPE_CHECKOUT_ENABLED, STRIPE_PAYMENT_LINK } from "@/lib/stripe-public";

const WalkthroughExperience = dynamic(
  () =>
    import("./WalkthroughExperience").then((m) => m.WalkthroughExperience),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[480px] items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-400">
        Loading 3D walkthrough…
      </div>
    ),
  }
);

function isMobilePrimary(): boolean {
  if (typeof window === "undefined") return false;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 768px)").matches;
  return coarse || narrow;
}

export function WalkthroughLoader() {
  const [mobile, setMobile] = useState<boolean | null>(null);
  const { unlocked, openSupportModal } = useSession();

  useEffect(() => {
    setMobile(isMobilePrimary());
  }, []);

  if (mobile === null) {
    return (
      <div className="flex h-48 items-center justify-center text-[var(--ld-muted)]">
        Loading…
      </div>
    );
  }

  if (mobile) {
    return (
      <div className="rounded-2xl border border-[var(--ld-border-green)] bg-[var(--ld-surface)]/80 p-8 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--ld-purple)]">
          Desktop experience
        </p>
        <h2 className="mt-2 text-xl font-black text-[var(--ld-neon-green)]">
          3D walk is best on laptop
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm text-[var(--ld-muted)]">
          On your phone, use the free pinch-zoom <strong className="text-white">2D Map</strong> or{" "}
          <strong className="text-white">GPS Overlay</strong> — built for the crowd and spotty
          signal.
        </p>
        <Link
          href="/overlay"
          className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-[var(--ld-neon-green)] px-8 py-3 text-sm font-black text-black"
        >
          Free GPS Overlay
        </Link>
        <Link
          href="/map"
          className="mt-3 block text-sm text-[var(--ld-neon-green)] underline"
        >
          Free basic map
        </Link>
      </div>
    );
  }

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
          First-person WASD walkthrough of the grounds. Basic map, GPS overlay, and{" "}
          <strong className="text-white">Flappy Skull</strong> stay free.{" "}
          <strong className="text-white">$5</strong> unlocks the 3D walk and all festival games.
        </p>
        {STRIPE_CHECKOUT_ENABLED && STRIPE_PAYMENT_LINK ? (
          <a
            href={STRIPE_PAYMENT_LINK}
            className="mt-6 inline-flex rounded-full bg-[var(--ld-neon-green)] px-8 py-3 text-sm font-black text-black"
          >
            Unlock 3D walk + all games — $5
          </a>
        ) : (
          <button
            type="button"
            onClick={openSupportModal}
            className="mt-6 rounded-full bg-[var(--ld-neon-green)] px-8 py-3 text-sm font-black text-black"
          >
            Unlock 3D walk + all games — $5 · Coming soon
          </button>
        )}
        <Link href="/map" className="mt-4 block text-sm text-[var(--ld-muted)] underline">
          Back to free map
        </Link>
      </div>
    );
  }

  return <WalkthroughExperience />;
}
