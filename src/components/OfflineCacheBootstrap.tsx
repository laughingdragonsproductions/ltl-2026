"use client";

import { useEffect } from "react";
import { prefetchCriticalAssets, registerServiceWorker } from "@/lib/offline-cache";

/** Registers SW + prefetches fest map after first paint (production only). */
export function OfflineCacheBootstrap() {
  useEffect(() => {
    registerServiceWorker();
    prefetchCriticalAssets();
  }, []);

  return null;
}
