"use client";

import { usePathname } from "next/navigation";
import { SupportModal } from "@/components/SupportModal";
import { SessionTimerPill } from "@/components/SessionTimerPill";

export function GlobalSessionUI() {
  const pathname = usePathname();
  const isAppRoute =
    pathname.startsWith("/map") ||
    pathname.startsWith("/schedule") ||
    pathname.startsWith("/walkthrough") ||
    pathname.startsWith("/arrival") ||
    pathname.startsWith("/credentials") ||
    pathname.startsWith("/know");

  return (
    <>
      <SupportModal />
      {!isAppRoute && pathname !== "/" && (
        <div className="fixed right-4 top-4 z-50">
          <SessionTimerPill />
        </div>
      )}
    </>
  );
}
