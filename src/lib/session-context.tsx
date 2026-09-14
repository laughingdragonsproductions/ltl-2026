"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { isOverlayTimerPath } from "./overlay-routes";
import {
  addUsedMs,
  formatRemaining,
  getRemainingMs,
  isUnlocked,
  loadSession,
  type SessionState,
  UNLOCK_DEADLINE,
} from "./session-timer";

type SessionContextValue = {
  remainingMs: number;
  remainingLabel: string;
  unlocked: boolean;
  expired: boolean;
  overlayTrialActive: boolean;
  showSupportModal: boolean;
  openSupportModal: () => void;
  dismissSupportModal: () => void;
  refreshSession: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const skipTimer = pathname.startsWith("/support");
  const overlayTrialActive = isOverlayTimerPath(pathname);
  const lastTickRef = useRef<number | null>(null);
  const [state, setState] = useState<SessionState>(() => loadSession());
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [modalDismissed, setModalDismissed] = useState(false);

  const refreshSession = useCallback(() => {
    setState(loadSession());
  }, []);

  useEffect(() => {
    setModalDismissed(false);
  }, [pathname]);

  useEffect(() => {
    if (skipTimer) return;
    refreshSession();
  }, [skipTimer, refreshSession, pathname]);

  useEffect(() => {
    if (skipTimer || !overlayTrialActive) {
      lastTickRef.current = null;
      return;
    }

    const tick = () => {
      const now = Date.now();
      if (document.visibilityState === "visible" && lastTickRef.current !== null) {
        const delta = now - lastTickRef.current;
        if (delta > 0 && delta < 5000) {
          setState(addUsedMs(delta));
        }
      }
      lastTickRef.current =
        document.visibilityState === "visible" ? now : null;
    };

    lastTickRef.current = Date.now();
    const id = window.setInterval(tick, 1000);
    const onVis = () => {
      if (document.visibilityState === "hidden") {
        lastTickRef.current = null;
      } else {
        lastTickRef.current = Date.now();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
      lastTickRef.current = null;
    };
  }, [skipTimer, overlayTrialActive]);

  const unlocked = isUnlocked(state);
  const remainingMs = unlocked ? Infinity : getRemainingMs(state);
  const expired = !unlocked && remainingMs <= 0;

  useEffect(() => {
    if (expired && !modalDismissed && !skipTimer && overlayTrialActive) {
      setShowSupportModal(true);
    }
  }, [expired, modalDismissed, skipTimer, overlayTrialActive]);

  const value = useMemo<SessionContextValue>(
    () => ({
      remainingMs: remainingMs === Infinity ? 0 : remainingMs,
      remainingLabel:
        unlocked && state.unlockedUntil
          ? "Overlay unlocked through Sunday"
          : overlayTrialActive
            ? `Overlay trial: ${formatRemaining(remainingMs === Infinity ? 0 : remainingMs)}`
            : `10 free min on Virtual Overlay`,
      unlocked,
      expired,
      overlayTrialActive,
      showSupportModal,
      openSupportModal: () => setShowSupportModal(true),
      dismissSupportModal: () => {
        setShowSupportModal(false);
        setModalDismissed(true);
      },
      refreshSession,
    }),
    [
      remainingMs,
      unlocked,
      expired,
      overlayTrialActive,
      showSupportModal,
      refreshSession,
      state.unlockedUntil,
    ]
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
