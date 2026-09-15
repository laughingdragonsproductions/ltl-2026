"use client";

import { useCallback, useState } from "react";

type ShareButtonProps = {
  title?: string;
  text?: string;
  url?: string;
  className?: string;
};

export function ShareButton({
  title = "LTL 2026 Live Map & Schedule",
  text = "Interactive festival map, set times, VIP guide — unofficial fan tool",
  url,
  className = "",
}: ShareButtonProps) {
  const [toast, setToast] = useState<string | null>(null);

  const shareUrl =
    url ??
    (typeof window !== "undefined"
      ? `${window.location.origin}/map${window.location.search}`
      : "https://ltl26.com/map");

  const onShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch {
        /* user cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setToast("Link copied!");
      setTimeout(() => setToast(null), 2500);
    } catch {
      setToast("Copy failed");
      setTimeout(() => setToast(null), 2500);
    }
  }, [shareUrl, text, title]);

  return (
    <div className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={onShare}
        className="min-h-[44px] rounded-full border border-[var(--ld-border-green)] bg-[var(--ld-surface)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--ld-neon-green)] hover:bg-[var(--ld-surface-2)]"
      >
        Share
      </button>
      {toast && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-[10px] text-white">
          {toast}
        </span>
      )}
    </div>
  );
}
