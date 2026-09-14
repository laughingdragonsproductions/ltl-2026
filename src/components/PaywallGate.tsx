"use client";

import { useSession } from "@/lib/session-context";

export function PaywallGate({ children }: { children: React.ReactNode }) {
  const { expired, unlocked } = useSession();
  const blocked = expired && !unlocked;

  return (
    <div className="relative">
      <div className={blocked ? "pointer-events-none select-none blur-sm" : undefined}>
        {children}
      </div>
      {blocked && (
        <div
          className="pointer-events-none absolute inset-0 bg-black/30"
          aria-hidden
        />
      )}
    </div>
  );
}
