"use client";

import type { HubGame } from "@/components/games/GamesHub";
import type { PickableGameId } from "@/lib/games/free-game-choice";

export function FreeGamePicker({
  games,
  onChoose,
}: {
  games: HubGame[];
  onChoose: (gameId: PickableGameId) => void;
}) {
  const choices = games.filter((g) => g.ready && !g.comingSoon);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/85 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="free-game-picker-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-[var(--ld-border-green)] bg-[var(--ld-surface)] p-6 shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--ld-purple)]">
          Pick your free game
        </p>
        <h2
          id="free-game-picker-title"
          className="mt-2 text-2xl font-black text-[var(--ld-neon-green)]"
        >
          Choose one — yours forever
        </h2>
        <p className="mt-2 text-sm text-[var(--ld-muted)]">
          You get <strong className="text-white">one</strong> full game free on this device.{" "}
          <strong className="text-white">$5</strong> unlocks all games and Google Calendar export
          for My sets.
        </p>
        <ul className="mt-5 space-y-2">
          {choices.map((game) => (
            <li key={game.id}>
              <button
                type="button"
                onClick={() => onChoose(game.id as PickableGameId)}
                className="w-full rounded-xl border border-[var(--ld-border-green)] bg-black/50 px-4 py-3 text-left transition hover:border-[var(--ld-neon-green)] hover:bg-[var(--ld-neon-green)]/10"
              >
                <span className="block font-bold text-white">{game.title}</span>
                <span className="mt-0.5 block text-xs text-[var(--ld-muted)]">{game.desc}</span>
              </button>
            </li>
          ))}
        </ul>
        {choices.length === 0 && (
          <p className="mt-4 text-sm text-[var(--ld-muted)]">No games ready yet — check back soon.</p>
        )}
      </div>
    </div>
  );
}
