"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";

const WalkthroughExperience = dynamic(
  () =>
    import("./WalkthroughExperience").then((m) => m.WalkthroughExperience),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[480px] items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-400">
        Loading 3D walkthrough…
      </div>
    ),
  }
);

function isMobilePrimary(): boolean {
  if (typeof window === "undefined") return false;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 768px)").matches;
  return coarse || narrow;
}

export function WalkthroughLoader() {
  const [mobile, setMobile] = useState<boolean | null>(null);

  useEffect(() => {
    setMobile(isMobilePrimary());
  }, []);

  if (mobile === null) {
    return (
      <div className="flex h-48 items-center justify-center text-[var(--ld-muted)]">
        Loading…
      </div>
    );
  }

  if (mobile) {
    return (
      <div className="rounded-2xl border border-[var(--ld-purple-dim)]/50 bg-[var(--ld-purple-dim)]/20 p-8 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--ld-purple)]">
          Desktop experience
        </p>
        <h2 className="mt-2 text-xl font-black text-[var(--ld-neon-green)]">
          3D walk is best on laptop
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm text-[var(--ld-muted)]">
          On your phone, use the pinch-zoom <strong className="text-white">2D Map</strong> with
          live GPS — built for the crowd and spotty signal.
        </p>
        <Link
          href="/map"
          className="mt-6 inline-flex min-h-[44px] items-center rounded-full bg-[var(--ld-neon-green)] px-8 py-3 text-sm font-black text-black"
        >
          Open 2D Map
        </Link>
      </div>
    );
  }

  return <WalkthroughExperience />;
}
