"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const tabs = [
  { href: "/map", label: "Map", icon: "🗺️" },
  { href: "/overlay/live", label: "Overlay", icon: "📍" },
  { href: "/schedule", label: "Schedule", icon: "🎸" },
  { href: "/arrival", label: "VIP", icon: "⭐" },
];

const moreLinks = [
  { href: "/games", label: "Festival Games" },
  { href: "/walkthrough", label: "3D Walk (desktop)" },
  { href: "/know", label: "Know Before You Go" },
  { href: "/credentials", label: "Credentials & Wristbands" },
  { href: "/", label: "Home" },
];

export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--ld-border)] bg-[var(--ld-black)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <ul className="flex items-stretch justify-around">
          {tabs.map((tab) => {
            const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            return (
              <li key={tab.href} className="flex-1">
                <Link
                  href={tab.href}
                  className={`flex flex-col items-center gap-0.5 px-1 py-2.5 text-[10px] font-semibold ${
                    active
                      ? "text-[var(--ld-neon-green)]"
                      : "text-[var(--ld-muted)]"
                  }`}
                >
                  <span aria-hidden className="text-base">
                    {tab.icon}
                  </span>
                  {tab.label}
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className="flex w-full flex-col items-center gap-0.5 px-1 py-2.5 text-[10px] font-semibold text-[var(--ld-muted)]"
            >
              <span aria-hidden className="text-base">
                ⋯
              </span>
              More
            </button>
          </li>
        </ul>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close menu"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl border-t border-[var(--ld-border-green)] bg-[var(--ld-black)] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--ld-purple)]">
              More
            </p>
            <ul className="space-y-1">
              {moreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMoreOpen(false)}
                    className="block rounded-lg px-3 py-3 text-sm font-semibold text-[var(--ld-text)] hover:bg-[var(--ld-surface-2)] hover:text-[var(--ld-neon-green)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
