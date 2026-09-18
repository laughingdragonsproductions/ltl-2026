"use client";

import Link from "next/link";
import { useSession } from "@/lib/session-context";
import { isDevUnlockEnabled } from "@/lib/unlock-state";
import { canPlayGame, isFreeGameForUser } from "@/lib/games/unlocks";
import { FreeGamePicker } from "@/components/games/FreeGamePicker";

export type HubGame = {
  id: string;
  href: string;
  title: string;
  desc: string;
  ready: boolean;
  comingSoon?: boolean;
};

export function GamesHub({ games }: { games: HubGame[] }) {
  const { unlocked, freeGameId, freeGameHydrated, chooseFreeGame } = useSession();

  const showPicker =
    freeGameHydrated && !unlocked && !isDevUnlockEnabled() && freeGameId === null;

  return (
    <>
      {showPicker && <FreeGamePicker games={games} onChoose={chooseFreeGame} />}

      <div className={`ltl-games-grid mt-8${showPicker ? " pointer-events-none opacity-40" : ""}`}>
        {games.map((game) => {
          const playable = game.ready && canPlayGame(game.id, unlocked, freeGameId);
          const locked = game.ready && !canPlayGame(game.id, unlocked, freeGameId);
          const soon = !game.ready || game.comingSoon;
          const isUsersFree = isFreeGameForUser(game.id, freeGameId) && !unlocked;

          return (
            <Link
              key={game.href}
              href={playable ? game.href : locked ? game.href : "#"}
              className={`ltl-game-card${playable ? "" : soon && !locked ? "" : locked ? " is-locked" : " is-soon"}`}
              aria-disabled={soon && !locked ? true : undefined}
              onClick={(e) => {
                if (showPicker) e.preventDefault();
                if (soon && !locked) e.preventDefault();
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <h3>{game.title}</h3>
                {isUsersFree && (
                  <span className="shrink-0 rounded-full bg-[var(--ld-neon-green)]/20 px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--ld-neon-green)]">
                    Your free pick
                  </span>
                )}
                {locked && (
                  <span className="shrink-0 rounded-full bg-[var(--ld-surface-2)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--ld-accent)]">
                    $5
                  </span>
                )}
              </div>
              <p>{game.desc}</p>
              {locked && freeGameId && (
                <p className="mt-2 text-xs text-[var(--ld-purple)]">
                  Unlock all games + calendar — $5
                </p>
              )}
              {locked && !freeGameId && freeGameHydrated && (
                <p className="mt-2 text-xs text-[var(--ld-purple)]">
                  Pick your free game above to unlock one title
                </p>
              )}
              {soon && !locked && (
                <p className="mt-2 text-xs text-[var(--ld-purple)]">Coming soon — tap for details</p>
              )}
            </Link>
          );
        })}
      </div>
    </>
  );
}
