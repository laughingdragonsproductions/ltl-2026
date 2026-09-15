"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  isUnlocked,
  loadSession,
  type SessionState,
  UNLOCK_DEADLINE,
} from "./unlock-state";

type SessionContextValue = {
  unlocked: boolean;
  showSupportModal: boolean;
  openSupportModal: () => void;
  dismissSupportModal: () => void;
  refreshSession: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(() => loadSession());
  const [showSupportModal, setShowSupportModal] = useState(false);

  const refreshSession = useCallback(() => {
    setState(loadSession());
  }, []);

  const unlocked = isUnlocked(state);

  const value = useMemo<SessionContextValue>(
    () => ({
      unlocked,
      showSupportModal,
      openSupportModal: () => setShowSupportModal(true),
      dismissSupportModal: () => setShowSupportModal(false),
      refreshSession,
    }),
    [unlocked, showSupportModal, refreshSession]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}

export { UNLOCK_DEADLINE };
