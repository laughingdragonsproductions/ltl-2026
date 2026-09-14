import Link from "next/link";
import { readFileSync } from "fs";
import { join } from "path";

function getBands() {
  try {
    const raw = readFileSync(join(process.cwd(), "data/band-matcher.json"), "utf8");
    return (JSON.parse(raw) as { bands: { id: string; name: string; src: string }[] }).bands ?? [];
  } catch {
    return [];
  }
}

export function BandMatcherPlaceholder() {
  const bands = getBands();
  const ready = bands.length >= 4;

  if (ready) {
    return (
      <div className="rounded-xl border border-[var(--ld-neon-green)]/50 bg-[var(--ld-neon-green)]/10 p-6 text-center">
        <p className="font-bold text-[var(--ld-neon-green)]">
          {bands.length} band logos compiled — game wiring next deploy.
        </p>
        <p className="mt-2 text-sm text-[var(--ld-muted)]">
          Run <code className="text-white">npm run games:band-matcher</code> after adding logos.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--ld-purple-dim)] p-6 text-center">
      <h2 className="text-xl font-black text-[var(--ld-purple)]">Coming soon</h2>
      <p className="mt-3 text-sm text-[var(--ld-muted)]">
        Upload band logo PNGs to{" "}
        <code className="text-xs text-white">Images for games/band-logos/</code>, then run{" "}
        <code className="text-xs text-white">npm run games:band-matcher</code>.
      </p>
      <Link href="/games" className="mt-4 inline-block text-sm text-[var(--ld-neon-green)] underline">
        Back to games
      </Link>
    </div>
  );
}
