"use client";

import Link from "next/link";
import { useSession } from "@/lib/session-context";
import { canPlayGame } from "@/lib/games/unlocks";
import { STRIPE_CHECKOUT_ENABLED, STRIPE_PAYMENT_LINK } from "@/lib/stripe-public";

export function GamePremiumGate({
  gameId,
  gameTitle,
  children,
}: {
  gameId: string;
  gameTitle: string;
  children: React.ReactNode;
}) {
  const { unlocked, openSupportModal } = useSession();

  if (canPlayGame(gameId, unlocked)) {
    return <>{children}</>;
  }

  return (
    <div className="rounded-2xl border border-[var(--ld-purple-dim)]/50 bg-black/80 p-8 text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-[var(--ld-purple)]">
        Premium · $5
      </p>
      <h2 className="mt-2 text-xl font-black text-[var(--ld-neon-green)]">{gameTitle}</h2>
      <p className="mx-auto mt-3 max-w-sm text-sm text-[var(--ld-muted)]">
        <strong className="text-white">Flappy Skull</strong> is free to play.{" "}
        <strong className="text-white">$5</strong> unlocks all festival games, the walking 3D
        map, and removes ads.
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
      <Link
        href="/games/flappy-skull"
        className="mt-4 block text-sm text-[var(--ld-neon-green)] underline"
      >
        Play free Flappy Skull
      </Link>
      <Link href="/games" className="mt-2 block text-sm text-[var(--ld-muted)] underline">
        Back to games
      </Link>
    </div>
  );
}
