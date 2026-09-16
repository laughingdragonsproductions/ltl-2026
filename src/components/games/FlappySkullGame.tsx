"use client";

import { useEffect, useRef } from "react";
import { initFlappySkull } from "@/lib/games/flappy-skull";
import { useSession } from "@/lib/session-context";

export function FlappySkullGame() {
  const ref = useRef<HTMLDivElement>(null);
  const { refreshSession } = useSession();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cleanup: (() => void) | undefined;
    initFlappySkull(el, { onPremiumUnlock: refreshSession }).then((fn) => {
      cleanup = fn;
    });
    return () => cleanup?.();
  }, [refreshSession]);

  return <div ref={ref} />;
}
