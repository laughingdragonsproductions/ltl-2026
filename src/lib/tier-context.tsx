"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { PassTier } from "./data";

type TierContextValue = {
  tier: PassTier;
  setTier: (tier: PassTier) => void;
};

const TierContext = createContext<TierContextValue | null>(null);

export function TierProvider({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<PassTier>("vip");

  return (
    <TierContext.Provider value={{ tier, setTier }}>
      {children}
    </TierContext.Provider>
  );
}

export function useTier() {
  const ctx = useContext(TierContext);
  if (!ctx) throw new Error("useTier must be used within TierProvider");
  return ctx;
}
