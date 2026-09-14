export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--ld-purple)]">
        Louder Than Life 2026
      </p>
      <h1 className="ld-glow-green mt-4 text-4xl font-black tracking-tight text-[var(--ld-neon-green)] sm:text-6xl">
        ltl26.com
      </h1>
      <p className="mt-3 text-lg text-[var(--ld-muted)] sm:text-xl">
        Interactive festival map
      </p>

      <div className="ld-glow-purple mt-10 max-w-md rounded-2xl border border-[var(--ld-purple)]/50 bg-[var(--ld-purple-dim)]/20 px-8 py-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--ld-neon-green)]">
          Coming Soon
        </p>
        <p className="mt-4 text-sm leading-relaxed text-[var(--ld-text)]">
          Full interactive map, VIP guides, set times, and more — launching before gates
          open <strong className="text-white">Sept 17–20</strong> in Louisville.
        </p>
      </div>

      <p className="mt-8 max-w-lg text-sm text-[var(--ld-muted)]">
        Sept 17–20, 2026 · Highland Festival Grounds · Kentucky Expo Center
      </p>
    </div>
  );
}
