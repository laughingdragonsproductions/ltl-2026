import { VirtualOverlayMap } from "@/components/VirtualOverlayMap";
import { ShareButton } from "@/components/ShareButton";
import Link from "next/link";

export default function OverlayLivePage() {
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
            <Link href="/overlay" className="text-[var(--ld-neon-green)] underline">
              Align overlay
            </Link>{" "}
            first, then use GPS pins here at the fest.
          </p>
        </div>
        <ShareButton url="https://ltl26.com/overlay/live" />
      </div>
      <div className="mt-6">
        <VirtualOverlayMap />
      </div>
    </div>
  );
}
