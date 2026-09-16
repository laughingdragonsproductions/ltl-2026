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
            Live GPS with the fest map on satellite. Map placement is fixed — adjust opacity in
            the sidebar.{" "}
            <Link href="/map" className="text-[var(--ld-neon-green)] underline">
              Tap map
            </Link>{" "}
            for pinch-zoom pins.
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
