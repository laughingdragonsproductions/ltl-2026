"use client";

import { useEffect, useRef } from "react";
import { initBandMatcher } from "@/lib/games/band-matcher";

export function BandMatcherGame() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cleanup = initBandMatcher(el);
    return cleanup;
  }, []);

  return <div ref={ref} id="band-matcher-mount" />;
}
