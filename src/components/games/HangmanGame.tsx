"use client";

import { useEffect, useRef } from "react";
import { initHangman } from "@/lib/games/hangman";

export function HangmanGame() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cleanup = initHangman(el);
    return cleanup;
  }, []);

  return <div ref={ref} id="hangman-lite-root" />;
}
