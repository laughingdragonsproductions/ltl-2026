import Link from "next/link";
import { readFileSync } from "fs";
import { join } from "path";
import "@/components/games/games.css";

type BandManifest = { bands: { id: string; name: string; src: string }[] };

function getBandCount(): number {
  try {
    const raw = readFileSync(join(process.cwd(), "data/band-matcher.json"), "utf8");
    const data = JSON.parse(raw) as BandManifest;
    return data.bands?.length ?? 0;
  } catch {
    return 0;
  }
}

const GAMES = [
  {
    href: "/games/flappy-skull",
    title: "Flappy Skull",
    desc: "Tap through the trusses. Glasses @ 5, headphones @ 10.",
    ready: true,
  },
  {
    href: "/games/puzzle",
    title: "LTL Slider",
    desc: "Slide the tiles — rebuild the festival poster, booth, or map.",
    ready: true,
  },
  {
    href: "/games/hangman",
    title: "Hangman",
    desc: "Guess LTL stage names, headliners, and festival words.",
    ready: true,
  },
  {
    href: "/games/band-matcher",
    title: "Band Matcher",
    desc: "Mahjong-style logo pairs — match bands before the next set.",
    ready: false,
  },
] as const;

export default function GamesPage() {
  const bandCount = getBandCount();
  const games = GAMES.map((g) =>
    g.href === "/games/band-matcher"
      ? { ...g, ready: bandCount >= 4, desc: g.desc + (bandCount >= 4 ? ` (${bandCount} logos ready)` : " — logos uploading") }
      : g
  );

  return (
    <div className="ltl-game">
      <p className="ltl-game-eyebrow">Free while you wait</p>
      <h1 className="mt-1 text-3xl font-black text-[var(--ld-neon-green)]">Festival Games</h1>
      <p className="mt-2 max-w-xl text-[var(--ld-muted)]">
        LOUDERTHANLIFE2026 mini-games from Laughing Dragons Productions. Always free — no trial timer.
      </p>
      <div className="ltl-games-grid mt-8">
        {games.map((game) => (
          <Link
            key={game.href}
            href={game.href}
            className={`ltl-game-card${game.ready ? "" : game.href === "/games/band-matcher" ? "" : " is-soon"}`}
          >
            <h3>{game.title}</h3>
            <p>{game.desc}</p>
            {!game.ready && game.href === "/games/band-matcher" && (
              <p className="mt-2 text-xs text-[var(--ld-purple)]">Coming soon — tap for details</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
