"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  dismissInstallPrompt,
  recordVisitAndCheckInstallEligible,
} from "@/lib/install-prompt";
import { getPromoAdAtRotationIndex, type PromoAd } from "@/lib/promo-ads";
import { useSession } from "@/lib/session-context";
import { STRIPE_CHECKOUT_ENABLED, STRIPE_PAYMENT_LINK } from "@/lib/stripe-public";

const ACCENT: Record<PromoAd["accent"], string> = {
  green: "border-[var(--ld-neon-green)]/50 bg-[var(--ld-neon-green)]/10 text-[var(--ld-neon-green)]",
  purple: "border-[var(--ld-border-green)] bg-[var(--ld-surface)]/80 text-[var(--ld-accent)]",
  orange: "border-orange-500/50 bg-orange-950/40 text-orange-400",
};

function AdUnit({
  ad,
  compact,
  onUnlock,
  onDismissInstall,
}: {
  ad: PromoAd;
  compact?: boolean;
  onUnlock: () => void;
  onDismissInstall?: () => void;
}) {
  const isUnlock = ad.action === "unlock";
  const isInstall = ad.action === "install";
  const className = `block w-full rounded-lg border p-3 text-left transition hover:opacity-90 ${ACCENT[ad.accent]} ${compact ? "" : ""}`;

  const inner = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="rounded bg-black/40 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--ld-muted)]">
          {isUnlock ? "Upgrade" : isInstall ? "Tip" : "Ad"}
        </span>
        <span className="text-[10px] text-[var(--ld-muted)]">
          {isUnlock ? "$5 · VIP unlock" : isInstall ? "Save to phone" : "Sponsored"}
        </span>
      </div>
      <p className={`mt-2 font-black ${compact ? "text-sm" : "text-base"}`}>{ad.title}</p>
      <p className="mt-1 text-xs text-[var(--ld-text)] opacity-90">{ad.tagline}</p>
      {isInstall ? (
        <button
          type="button"
          onClick={onDismissInstall}
          className="mt-2 text-xs font-bold text-[var(--ld-muted)] underline"
        >
          {ad.cta}
        </button>
      ) : (
        <span className="mt-2 inline-block text-xs font-bold underline">{ad.cta} →</span>
      )}
    </>
  );

  if (isInstall) {
    return <div className={className}>{inner}</div>;
  }

  if (isUnlock) {
    if (STRIPE_CHECKOUT_ENABLED && STRIPE_PAYMENT_LINK) {
      return (
        <a href={STRIPE_PAYMENT_LINK} className={className}>
          {inner}
        </a>
      );
    }
    return (
      <button type="button" onClick={onUnlock} className={className}>
        {inner}
      </button>
    );
  }

  const isExternal = ad.href.startsWith("http");
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
  const { unlocked, openSupportModal } = useSession();
  const pathname = usePathname();
  const [index, setIndex] = useState(0);
  const [installEligible, setInstallEligible] = useState(false);

  const hidden = unlocked || pathname.startsWith("/support");

  useEffect(() => {
    setInstallEligible(recordVisitAndCheckInstallEligible());
  }, []);

  useEffect(() => {
    if (hidden) return;
    const id = window.setInterval(() => {
      setIndex((i) => i + 1);
    }, 8000);
    return () => clearInterval(id);
  }, [hidden]);

  const handleDismissInstall = () => {
    dismissInstallPrompt();
    setInstallEligible(false);
  };

  if (hidden) return null;

  const current = getPromoAdAtRotationIndex(index, installEligible);
  const next = getPromoAdAtRotationIndex(index + 1, installEligible);

  return (
    <>
      <div className="border-b border-[var(--ld-border)] bg-black/80 px-3 py-2">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <span className="shrink-0 text-[9px] font-bold uppercase tracking-widest text-[var(--ld-muted)]">
            Promo
          </span>
          <div className="min-w-0 flex-1">
            <AdUnit
              ad={current}
              compact
              onUnlock={openSupportModal}
              onDismissInstall={handleDismissInstall}
            />
          </div>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-40 px-3 md:bottom-4 md:max-w-sm md:translate-x-0 md:left-auto md:right-4">
        <div className="pointer-events-auto shadow-xl">
          <AdUnit ad={next} onUnlock={openSupportModal} onDismissInstall={handleDismissInstall} />
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
        <span className="ml-2 text-[var(--ld-neon-green)]">· All ads removed</span>
      )}
    </p>
  );
}
