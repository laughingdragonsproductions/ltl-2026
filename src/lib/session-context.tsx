"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  loadFreeGameChoice,
  saveFreeGameChoice,
  type PickableGameId,
} from "@/lib/games/free-game-choice";
import {
  isDevUnlockEnabled,
  isUnlocked,
  loadSession,
  type SessionState,
  UNLOCK_DEADLINE,
} from "./unlock-state";

type SessionContextValue = {
  unlocked: boolean;
  freeGameId: PickableGameId | null;
  freeGameHydrated: boolean;
  chooseFreeGame: (gameId: PickableGameId) => void;
  showSupportModal: boolean;
  openSupportModal: () => void;
  dismissSupportModal: () => void;
  refreshSession: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(() => loadSession());
  const [freeGameId, setFreeGameId] = useState<PickableGameId | null>(null);
  const [freeGameHydrated, setFreeGameHydrated] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const refreshSession = useCallback(() => {
    setState(loadSession());
  }, []);

  const chooseFreeGame = useCallback((gameId: PickableGameId) => {
    saveFreeGameChoice(gameId);
    setFreeGameId(gameId);
  }, []);

  useEffect(() => {
    setFreeGameId(loadFreeGameChoice());
    setFreeGameHydrated(true);
  }, []);

  const unlocked = isDevUnlockEnabled() || isUnlocked(state);

  const value = useMemo<SessionContextValue>(
    () => ({
      unlocked,
      freeGameId,
      freeGameHydrated,
      chooseFreeGame,
      showSupportModal,
      openSupportModal: () => setShowSupportModal(true),
      dismissSupportModal: () => setShowSupportModal(false),
      refreshSession,
    }),
    [unlocked, freeGameId, freeGameHydrated, chooseFreeGame, showSupportModal, refreshSession]
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
