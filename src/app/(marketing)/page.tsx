import Image from "next/image";
import Link from "next/link";
import { ShareButton } from "@/components/ShareButton";

export default function HomePage() {
  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] max-w-4xl flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
        <Image
          src="/maps/ltl-2026-official-amenity-map.png"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--ld-black)] via-[var(--ld-black)]/80 to-[var(--ld-black)]" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--ld-purple)]">
          Louder Than Life 2026
        </p>
        <h1 className="ld-glow-green mt-4 text-4xl font-black tracking-tight text-[var(--ld-neon-green)] sm:text-6xl">
          ltl26.com
        </h1>
        <p className="mt-3 text-lg text-[var(--ld-muted)] sm:text-xl">
          Live map & schedule
        </p>

        <div className="ld-glow-purple mt-10 max-w-md rounded-2xl border border-[var(--ld-border-green)] bg-[var(--ld-surface)]/80 px-8 py-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-[var(--ld-neon-green)]">
            Fan-built companion
          </p>
          <p className="mt-4 text-sm leading-relaxed text-[var(--ld-text)]">
            Free tap map, GPS overlay, and locators forever. Flappy Skull is free to play.{" "}
            <strong className="text-white">$5</strong> unlocks the walking 3D map, all games,
            and removes ads.
          </p>
        </div>

        <Link
          href="/map"
          className="mt-8 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--ld-neon-green)]/60 bg-[var(--ld-neon-green)] px-8 py-3 text-sm font-black uppercase tracking-wide text-black transition hover:opacity-90"
        >
          Free map
          <span aria-hidden>→</span>
        </Link>
        <Link
          href="/overlay"
          className="mt-3 text-sm font-semibold text-[var(--ld-neon-green)] underline hover:text-white"
        >
          Try virtual overlay →
        </Link>
        <Link
          href="/games"
          className="mt-2 text-sm font-semibold text-[var(--ld-muted)] underline hover:text-white"
        >
          Play festival games →
        </Link>

        <ShareButton
          url="https://ltl26.com/map"
          className="mt-4"
        />

        <p className="mt-8 max-w-lg text-sm text-[var(--ld-muted)]">
          Sept 17–20, 2026 · Highland Festival Grounds · Kentucky Expo Center
        </p>
      </div>
    </div>
  );
}
