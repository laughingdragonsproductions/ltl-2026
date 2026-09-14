"use client";

import { useEffect, useRef } from "react";
import { initFlappySkull } from "@/lib/games/flappy-skull";

export function FlappySkullGame() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cleanup: (() => void) | undefined;
    initFlappySkull(el).then((fn) => {
      cleanup = fn;
    });
    return () => cleanup?.();
  }, []);

  return <div ref={ref} />;
}
