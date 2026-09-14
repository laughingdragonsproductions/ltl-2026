"use client";

import { useEffect, useState } from "react";

const VISIT_KEY = "ltl26_visits";
const DISMISS_KEY = "ltl26_install_dismissed";

export function InstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const visits = Number(localStorage.getItem(VISIT_KEY) ?? "0") + 1;
    localStorage.setItem(VISIT_KEY, String(visits));
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (visits >= 2 && !dismissed && window.matchMedia("(display-mode: browser)").matches) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-4 right-4 z-40 rounded-xl border border-[var(--ld-purple)]/40 bg-[var(--ld-black)]/95 p-3 shadow-lg md:bottom-4 md:left-auto md:right-4 md:max-w-xs">
      <p className="text-xs font-semibold text-[var(--ld-neon-green)]">Add to Home Screen</p>
      <p className="mt-1 text-[11px] text-[var(--ld-muted)]">
        Save LTL26 for quick access in the crowd — Share → Add to Home Screen (iOS) or
        Install app (Android).
      </p>
      <button
        type="button"
        onClick={() => {
          localStorage.setItem(DISMISS_KEY, "1");
          setShow(false);
        }}
        className="mt-2 text-[10px] text-[var(--ld-muted)] underline"
      >
        Dismiss
      </button>
    </div>
  );
}
