"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/map", label: "Map" },
  { href: "/overlay", label: "Overlay" },
  { href: "/schedule", label: "Schedule" },
  { href: "/walkthrough", label: "Walk" },
  { href: "/arrival", label: "VIP" },
  { href: "/know", label: "Know" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="hidden border-b border-[var(--ld-purple-dim)]/40 bg-[var(--ld-black)]/95 backdrop-blur md:block">
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
                pathname === link.href
                  ? "bg-[var(--ld-purple)] text-white"
                  : "text-[var(--ld-muted)] hover:bg-[var(--ld-purple-dim)]/30 hover:text-white"
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
