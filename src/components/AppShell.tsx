"use client";

import { MobileNav } from "@/components/MobileNav";
import { Nav } from "@/components/Nav";
import { TierBar } from "@/components/TierBar";
import { InstallPrompt } from "@/components/InstallPrompt";
import { MySetAlertsProvider } from "@/components/MySetAlertsProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <TierBar />
      <div className="mx-auto w-full max-w-6xl px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-4 md:pb-6">
        {children}
      </div>
      <MobileNav />
      <InstallPrompt />
      <MySetAlertsProvider />
    </>
  );
}
