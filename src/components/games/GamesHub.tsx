"use client";

import Link from "next/link";
import { useSession } from "@/lib/session-context";
import { canPlayGame, FREE_GAME_ID } from "@/lib/games/unlocks";

export type HubGame = {
  id: string;
  href: string;
  title: string;
  desc: string;
  ready: boolean;
  comingSoon?: boolean;
};

export function GamesHub({ games }: { games: HubGame[] }) {
  const { unlocked } = useSession();

  return (
    <div className="ltl-games-grid mt-8">
      {games.map((game) => {
        const playable = game.ready && canPlayGame(game.id, unlocked);
        const locked = game.ready && !canPlayGame(game.id, unlocked);
        const soon = !game.ready || game.comingSoon;

        return (
          <Link
            key={game.href}
            href={playable ? game.href : locked ? game.href : "#"}
            className={`ltl-game-card${playable ? "" : soon && !locked ? "" : locked ? " is-locked" : " is-soon"}`}
            aria-disabled={soon && !locked ? true : undefined}
            onClick={(e) => {
              if (soon && !locked) e.preventDefault();
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <h3>{game.title}</h3>
              {game.id === FREE_GAME_ID && !unlocked && (
                <span className="shrink-0 rounded-full bg-[var(--ld-neon-green)]/20 px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--ld-neon-green)]">
                  Free
                </span>
              )}
              {locked && (
                <span className="shrink-0 rounded-full bg-[var(--ld-purple-dim)]/40 px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--ld-purple)]">
                  $5
                </span>
              )}
            </div>
            <p>{game.desc}</p>
            {locked && (
              <p className="mt-2 text-xs text-[var(--ld-purple)]">
                Unlock all games with $5 — try Flappy Skull free
              </p>
            )}
            {soon && !locked && (
              <p className="mt-2 text-xs text-[var(--ld-purple)]">Coming soon — tap for details</p>
            )}
          </Link>
        );
      })}
    </div>
  );
}
