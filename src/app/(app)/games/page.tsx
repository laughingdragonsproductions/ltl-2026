import { readFileSync } from "fs";
import { join } from "path";
import "@/components/games/games.css";
import { GamesHub, type HubGame } from "@/components/games/GamesHub";

type BandManifest = { bands: { id: string; name: string; src: string }[] };

function getBandCount(): number {
  try {
    const raw = readFileSync(join(process.cwd(), "data/band-matcher.json"), "utf8");
    const data = JSON.parse(raw) as BandManifest;
    if ((data.bands?.length ?? 0) >= 4) return data.bands.length;
  } catch {
    /* fall through */
  }
  try {
    const raw = readFileSync(join(process.cwd(), "data/slider-images.json"), "utf8");
    const data = JSON.parse(raw) as { images?: unknown[] };
    return data.images?.length ?? 0;
  } catch {
    return 0;
  }
}

export default function GamesPage() {
  const bandCount = getBandCount();

  const games: HubGame[] = [
    {
      id: "flappy-skull",
      href: "/games/flappy-skull",
      title: "Flappy Skull",
      desc: "Tap through the trusses. Glasses @ 5, headphones @ 10.",
      ready: true,
    },
    {
      id: "puzzle",
      href: "/games/puzzle",
      title: "LTL Slider",
      desc: "Slide the tiles — rebuild festival art from 20 LTL puzzles.",
      ready: true,
    },
    {
      id: "hangman",
      href: "/games/hangman",
      title: "Hangman",
      desc: "Guess LTL stage names, headliners, and festival words.",
      ready: true,
    },
    {
      id: "band-matcher",
      href: "/games/band-matcher",
      title: "Band Matcher",
      desc:
        bandCount >= 4
          ? `Mahjong-style logo pairs — ${bandCount} bands ready.`
          : "Mahjong-style logo pairs — match bands before the next set. Logos uploading.",
      ready: bandCount >= 4,
      comingSoon: bandCount < 4,
    },
  ];

  return (
    <div className="ltl-game">
      <p className="ltl-game-eyebrow">Pick one free · unlock the rest</p>
      <h1 className="mt-1 text-3xl font-black text-[var(--ld-neon-green)]">Festival Games</h1>
      <p className="mt-2 max-w-xl text-[var(--ld-muted)]">
        Choose <strong className="text-white">one game free</strong> on your first visit.{" "}
        <strong className="text-white">$5</strong> unlocks all games and the walking 3D map.
      </p>
      <GamesHub games={games} />
    </div>
  );
}
