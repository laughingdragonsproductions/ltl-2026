export const INSTALL_VISIT_KEY = "ltl26_visits";
export const INSTALL_DISMISS_KEY = "ltl26_install_dismissed";

export function recordVisitAndCheckInstallEligible(): boolean {
  if (typeof window === "undefined") return false;
  const visits = Number(localStorage.getItem(INSTALL_VISIT_KEY) ?? "0") + 1;
  localStorage.setItem(INSTALL_VISIT_KEY, String(visits));
  const dismissed = localStorage.getItem(INSTALL_DISMISS_KEY);
  return (
    visits >= 2 &&
    !dismissed &&
    window.matchMedia("(display-mode: browser)").matches
  );
}

export function dismissInstallPrompt(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(INSTALL_DISMISS_KEY, "1");
}

export function isInstallPromptEligible(): boolean {
  if (typeof window === "undefined") return false;
  const visits = Number(localStorage.getItem(INSTALL_VISIT_KEY) ?? "0");
  const dismissed = localStorage.getItem(INSTALL_DISMISS_KEY);
  return (
    visits >= 2 &&
    !dismissed &&
    window.matchMedia("(display-mode: browser)").matches
  );
}
