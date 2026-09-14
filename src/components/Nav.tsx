"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTier } from "@/lib/tier-context";
import type { PassTier } from "@/lib/data";

const links = [
  { href: "/", label: "Home" },
  { href: "/map", label: "Map" },
  { href: "/walkthrough", label: "Walk" },
  { href: "/arrival", label: "Arrival" },
  { href: "/credentials", label: "Credentials" },
  { href: "/schedule", label: "Schedule" },
  { href: "/know", label: "Know Before You Go" },
];

const tierLabels: Record<PassTier, string> = {
  ga: "GA",
  vip: "VIP",
  topshelf: "Top Shelf",
};

export function Nav() {
  const pathname = usePathname();
  const { tier, setTier } = useTier();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-lg font-black tracking-tight text-orange-500">
          LTL 2026
        </Link>
        <nav className="flex flex-wrap gap-1 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded px-2 py-1 ${
                pathname === link.href
                  ? "bg-orange-600 text-white"
                  : "text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-400">Pass:</span>
          {(["ga", "vip", "topshelf"] as PassTier[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTier(t)}
              className={`rounded px-2 py-1 font-semibold ${
                tier === t
                  ? t === "topshelf"
                    ? "bg-red-600 text-white"
                    : t === "vip"
                      ? "bg-green-600 text-white"
                      : "bg-zinc-600 text-white"
                  : "bg-zinc-800 text-zinc-400"
              }`}
            >
              {tierLabels[t]}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
