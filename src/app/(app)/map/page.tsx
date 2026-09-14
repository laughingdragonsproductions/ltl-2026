"use client";

import { InteractiveMap } from "@/components/InteractiveMap";

export default function MapPage() {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--ld-purple)]">
        Base build
      </p>
      <h1 className="mt-1 text-3xl font-black text-[var(--ld-neon-green)]">
        Festival Map
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--ld-muted)]">
        Official 2026 amenity map with tap targets. Toggle layers and switch pass tier in
        the header to filter VIP-only points.
      </p>
      <div className="mt-6">
        <InteractiveMap />
      </div>
    </div>
  );
}
