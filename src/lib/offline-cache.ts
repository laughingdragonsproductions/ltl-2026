import { FESTIVAL_MAP_SRC } from "./festival-map";

/** Static assets worth caching before/at the fest — ~2 MB total, no game bundles. */
export const OFFLINE_CACHE_NAME = "ltl26-fest-v2";

export const CRITICAL_OFFLINE_ASSETS = [
  FESTIVAL_MAP_SRC,
  "/manifest.json",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
  "/sounds/set-alert.wav",
] as const;

export function registerServiceWorker(): void {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "production") return;
  if (!("serviceWorker" in navigator)) return;

  void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
    /* SW optional — site still works */
  });
}

/** Warm the cache after first paint (map + schedule work offline on repeat visits). */
export function prefetchCriticalAssets(): void {
  if (typeof window === "undefined") return;

  const run = () => {
    if ("caches" in window) {
      void caches.open(OFFLINE_CACHE_NAME).then((cache) => {
        void Promise.allSettled(CRITICAL_OFFLINE_ASSETS.map((url) => cache.add(url)));
      });
      return;
    }
    for (const href of CRITICAL_OFFLINE_ASSETS) {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = href;
      document.head.appendChild(link);
    }
  };

  if ("requestIdleCallback" in window) {
    requestIdleCallback(run, { timeout: 4000 });
  } else {
    setTimeout(run, 1500);
  }
}
