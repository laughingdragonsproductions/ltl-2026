import Link from "next/link";
import { InteractiveMap } from "@/components/InteractiveMap";
import { ShareButton } from "@/components/ShareButton";

export default function MapPage() {
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--ld-purple)]">
            Always free
          </p>
          <h1 className="mt-1 text-3xl font-black text-[var(--ld-neon-green)]">
            Festival Map
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--ld-muted)]">
            Official amenity map with pinch-zoom and tap pins. No time limit. Switch pass tier
            above to filter VIP points.
          </p>
        </div>
        <ShareButton />
      </div>

      <div className="mt-6">
        <InteractiveMap fullscreen />
      </div>

      <Link
        href="/overlay"
        className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-[var(--ld-purple)]/50 bg-[var(--ld-purple-dim)]/20 p-5 transition hover:border-[var(--ld-neon-green)]/40"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--ld-neon-green)]">
            Free
          </p>
          <p className="mt-1 text-lg font-black text-white">GPS Overlay</p>
          <p className="mt-1 text-sm text-[var(--ld-muted)]">
            Live GPS + aligned amenity map on satellite. Always free alongside this tap map.
          </p>
        </div>
        <span className="shrink-0 text-2xl text-[var(--ld-neon-green)]" aria-hidden>
          →
        </span>
      </Link>
      <Link
        href="/walkthrough"
        className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-[var(--ld-purple)]/50 bg-[var(--ld-purple-dim)]/20 p-5 transition hover:border-[var(--ld-neon-green)]/40"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--ld-purple)]">
            Premium · $5
          </p>
          <p className="mt-1 text-lg font-black text-white">Walking 3D Map</p>
          <p className="mt-1 text-sm text-[var(--ld-muted)]">
            First-person desktop walkthrough. Unlocks with all festival games for $5.
          </p>
        </div>
        <span className="shrink-0 text-2xl text-[var(--ld-neon-green)]" aria-hidden>
          →
        </span>
      </Link>
    </div>
  );
}
