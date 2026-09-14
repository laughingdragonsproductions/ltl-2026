"use client";

import { useEffect, useRef } from "react";
import { initSliderPuzzle } from "@/lib/games/slider-puzzle";

export function SliderPuzzleGame() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cleanup = initSliderPuzzle(el);
    return cleanup;
  }, []);

  return <div ref={ref} id="slider-puzzle-mount" />;
}
