import Link from "next/link";
import "./games.css";

export function GameShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="ltl-game">
      <Link
        href="/games"
        className="text-sm text-[var(--ld-purple)] underline hover:text-white"
      >
        ← All games
      </Link>
      <p className="ltl-game-eyebrow mt-4">LOUDERTHANLIFE2026</p>
      <h1 className="mt-1 text-3xl font-black text-[var(--ld-neon-green)]">{title}</h1>
      {subtitle && <p className="mt-2 text-[var(--ld-muted)]">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}
