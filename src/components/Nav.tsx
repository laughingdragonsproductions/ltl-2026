"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTier } from "@/lib/tier-context";
import type { PassTier } from "@/lib/data";

const links = [
  { href: "/", label: "Home" },
  { href: "/map", label: "Map" },
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
    <header className="sticky top-0 z-50 border-b border-[var(--ld-purple-dim)]/40 bg-[var(--ld-black)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/"
          className="text-lg font-black tracking-tight text-[var(--ld-neon-green)]"
        >
          LTL26
        </Link>
        <nav className="flex flex-wrap gap-1 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded px-3 py-1.5 font-semibold ${
                pathname === link.href
                  ? "bg-[var(--ld-purple)] text-white"
                  : "text-[var(--ld-muted)] hover:bg-[var(--ld-purple-dim)]/30 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[var(--ld-muted)]">Pass:</span>
          {(["ga", "vip", "topshelf"] as PassTier[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTier(t)}
              className={`rounded px-2.5 py-1 font-semibold ${
                tier === t
                  ? t === "topshelf"
                    ? "bg-red-600 text-white"
                    : t === "vip"
                      ? "bg-[var(--ld-neon-green-dim)] text-white"
                      : "bg-zinc-600 text-white"
                  : "bg-zinc-900 text-[var(--ld-muted)]"
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
