"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PROMO_ADS, type PromoAd } from "@/lib/promo-ads";
import { useSession } from "@/lib/session-context";

const ACCENT: Record<PromoAd["accent"], string> = {
  green: "border-[var(--ld-neon-green)]/50 bg-[var(--ld-neon-green)]/10 text-[var(--ld-neon-green)]",
  purple: "border-[var(--ld-purple)]/50 bg-[var(--ld-purple-dim)]/25 text-[var(--ld-purple)]",
  orange: "border-orange-500/50 bg-orange-950/40 text-orange-400",
};

function AdUnit({ ad, compact }: { ad: PromoAd; compact?: boolean }) {
  const isExternal = ad.href.startsWith("http");
  const className = `block rounded-lg border p-3 transition hover:opacity-90 ${ACCENT[ad.accent]} ${compact ? "text-left" : ""}`;

  const inner = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="rounded bg-black/40 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--ld-muted)]">
          Ad
        </span>
        <span className="text-[10px] text-[var(--ld-muted)]">Sponsored</span>
      </div>
      <p className={`mt-2 font-black ${compact ? "text-sm" : "text-base"}`}>{ad.title}</p>
      <p className="mt-1 text-xs text-[var(--ld-text)] opacity-90">{ad.tagline}</p>
      <span className="mt-2 inline-block text-xs font-bold underline">{ad.cta} →</span>
    </>
  );

  if (isExternal) {
    return (
      <a href={ad.href} target="_blank" rel="noreferrer sponsored" className={className}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={ad.href} className={className}>
      {inner}
    </Link>
  );
}

export function PromoAds() {
  const { unlocked } = useSession();
  const pathname = usePathname();
  const [index, setIndex] = useState(0);

  const hidden =
    unlocked ||
    pathname.startsWith("/support");

  useEffect(() => {
    if (hidden) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % PROMO_ADS.length);
    }, 8000);
    return () => clearInterval(id);
  }, [hidden]);

  if (hidden) return null;

  const current = PROMO_ADS[index];

  return (
    <>
      {/* Top strip — fake browser ad bar */}
      <div className="border-b border-[var(--ld-purple-dim)]/30 bg-black/80 px-3 py-2">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <span className="shrink-0 text-[9px] font-bold uppercase tracking-widest text-[var(--ld-muted)]">
            Promo
          </span>
          <div className="min-w-0 flex-1">
            <AdUnit ad={current} compact />
          </div>
        </div>
      </div>

      {/* Bottom sticky — above mobile nav */}
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-40 px-3 md:bottom-4 md:max-w-sm md:translate-x-0 md:left-auto md:right-4">
        <div className="pointer-events-auto shadow-xl">
          <AdUnit ad={PROMO_ADS[(index + 1) % PROMO_ADS.length]} />
        </div>
      </div>
    </>
  );
}

export function LitprintzAssociation() {
  const { unlocked } = useSession();

  return (
    <p className="text-[10px] text-[var(--ld-muted)]">
      In association with{" "}
      <a
        href="https://litprintz.com"
        target="_blank"
        rel="noreferrer"
        className="font-semibold text-[var(--ld-purple)] hover:underline"
      >
        LitPrintz.com
      </a>
      {unlocked && (
        <span className="ml-2 text-[var(--ld-neon-green)]">· Ad-free supporter</span>
      )}
    </p>
  );
}
