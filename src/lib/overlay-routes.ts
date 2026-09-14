/** Routes where the 10-minute overlay trial timer runs */
export const OVERLAY_TIMER_PATHS = ["/overlay", "/walkthrough"];

export function isOverlayTimerPath(pathname: string): boolean {
  return OVERLAY_TIMER_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}
