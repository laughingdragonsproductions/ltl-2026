import { VirtualOverlayMap } from "@/components/VirtualOverlayMap";
import { ShareButton } from "@/components/ShareButton";
import Link from "next/link";

export default function OverlayPage() {
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--ld-purple)]">
            Virtual overlay
          </p>
          <h1 className="mt-1 text-3xl font-black text-[var(--ld-neon-green)]">
            Live GPS Overlay
          </h1>
          <p className="mt-2 text-sm text-[var(--ld-muted)]">
            <Link href="/map" className="text-[var(--ld-neon-green)] underline">
              Basic map
            </Link>{" "}
            is always free — this mode adds real-world positioning.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/overlay/adjust"
            className="text-xs font-bold uppercase tracking-wide text-[var(--ld-accent)] underline hover:text-[var(--ld-neon-green)]"
          >
            Align overlay
          </Link>
          <ShareButton url="https://ltl26.com/overlay" />
        </div>
      </div>
      <div className="mt-6">
        <VirtualOverlayMap />
      </div>
    </div>
  );
}
