"use client";

/** @deprecated Use route-specific premium gates. Kept for compatibility — no-op blur. */
export function PaywallGate({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
