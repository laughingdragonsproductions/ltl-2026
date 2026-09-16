"use client";

import Link from "next/link";
import { useSession } from "@/lib/session-context";
import { canPlayGame } from "@/lib/games/unlocks";
import { GAME_TITLES } from "@/lib/games/free-game-choice";
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
  const { unlocked, freeGameId, openSupportModal } = useSession();

  if (canPlayGame(gameId, unlocked, freeGameId)) {
    return <>{children}</>;
  }

  const freeTitle = freeGameId ? GAME_TITLES[freeGameId] : null;
  const freeHref = freeGameId ? `/games/${freeGameId}` : "/games";

  return (
    <div className="rounded-2xl border border-[var(--ld-border-green)] bg-[var(--ld-surface)]/90 p-8 text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-[var(--ld-purple)]">
        Premium · $5
      </p>
      <h2 className="mt-2 text-xl font-black text-[var(--ld-neon-green)]">{gameTitle}</h2>
      <p className="mx-auto mt-3 max-w-sm text-sm text-[var(--ld-muted)]">
        {freeTitle ? (
          <>
            Your free pick is <strong className="text-white">{freeTitle}</strong>.{" "}
            <strong className="text-white">$5</strong> unlocks all festival games, the walking 3D
            map, and removes ads.
          </>
        ) : (
          <>
            Pick one free game on the{" "}
            <Link href="/games" className="text-[var(--ld-neon-green)] underline">
              games hub
            </Link>
            , or pay <strong className="text-white">$5</strong> for everything.
          </>
        )}
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
      {freeTitle && (
        <Link href={freeHref} className="mt-4 block text-sm text-[var(--ld-neon-green)] underline">
          Play your free game — {freeTitle}
        </Link>
      )}
      {!freeTitle && (
        <Link href="/games" className="mt-4 block text-sm text-[var(--ld-neon-green)] underline">
          Choose your free game
        </Link>
      )}
      <Link href="/games" className="mt-2 block text-sm text-[var(--ld-muted)] underline">
        Back to games
      </Link>
    </div>
  );
}
