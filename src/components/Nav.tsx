"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WALKTHROUGH_ENABLED } from "@/lib/walkthrough-public";

const baseLinks = [
  { href: "/map", label: "Map" },
  { href: "/overlay/live", label: "Overlay" },
  { href: "/schedule", label: "Schedule" },
  { href: "/arrival", label: "VIP" },
  { href: "/know", label: "Know" },
  { href: "/games", label: "Games" },
];

const walkLink = { href: "/walkthrough", label: "Walk" };

const links = WALKTHROUGH_ENABLED
  ? [...baseLinks.slice(0, 3), walkLink, ...baseLinks.slice(3)]
  : baseLinks;

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="hidden border-b border-[var(--ld-border)] bg-[var(--ld-black)]/95 backdrop-blur md:block">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/map"
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
                pathname === link.href ||
                (link.href === "/games" && pathname.startsWith("/games"))
                  ? "bg-[var(--ld-neon-green)] text-black"
                  : "text-[var(--ld-muted)] hover:bg-[var(--ld-surface-2)] hover:text-[var(--ld-neon-green)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link href="/" className="text-xs text-[var(--ld-muted)] hover:text-white">
          Home
        </Link>
      </div>
    </header>
  );
}
