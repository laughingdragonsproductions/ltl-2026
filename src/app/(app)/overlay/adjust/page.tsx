import Link from "next/link";
import { OverlayAdjuster } from "@/components/OverlayAdjuster";

export default function OverlayAdjustPage() {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--ld-accent)]">
            Admin tool
          </p>
          <h1 className="mt-1 text-3xl font-black text-[var(--ld-neon-green)]">
            Align amenity overlay
          </h1>
          <p className="mt-2 text-sm text-[var(--ld-muted)]">
            Match the official map PNG to Esri satellite, then save or copy into{" "}
            <code className="text-white">data/georef.json</code>.
          </p>
        </div>
        <Link
          href="/overlay"
          className="text-sm font-semibold text-[var(--ld-neon-green)] underline"
        >
          Back to live overlay →
        </Link>
      </div>
      <OverlayAdjuster />
    </div>
  );
}
