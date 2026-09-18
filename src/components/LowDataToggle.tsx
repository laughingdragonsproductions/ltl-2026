"use client";

import { useEffect, useState } from "react";
import { getLowDataOverride, isLowDataPreferred, setLowDataOverride } from "@/lib/low-data-mode";

export function LowDataToggle() {
  const [active, setActive] = useState(false);
  const [override, setOverride] = useState<"on" | "off" | "auto">("auto");

  useEffect(() => {
    setActive(isLowDataPreferred());
    setOverride(getLowDataOverride());

    const onStorage = () => {
      setActive(isLowDataPreferred());
      setOverride(getLowDataOverride());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const cycle = () => {
    const next = override === "auto" ? "on" : override === "on" ? "off" : "auto";
    setLowDataOverride(next);
    setOverride(next);
    setActive(isLowDataPreferred());
    window.dispatchEvent(new Event("ltl26-low-data-change"));
  };

  const label =
    override === "auto"
      ? active
        ? "Save data · auto"
        : "Save data · auto (off)"
      : override === "on"
        ? "Save data · on"
        : "Save data · off";

  return (
    <button
      type="button"
      onClick={cycle}
      className={`mt-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ${
        active
          ? "bg-[var(--ld-neon-green)]/15 text-[var(--ld-neon-green)] ring-[var(--ld-neon-green)]/40"
          : "bg-zinc-900 text-[var(--ld-muted)] ring-zinc-700"
      }`}
      title="Tap to cycle: auto (saves data on slow/mobile networks) → on → off"
    >
      {label}
    </button>
  );
}
