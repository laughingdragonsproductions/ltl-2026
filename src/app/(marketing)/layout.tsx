import Link from "next/link";
import { SessionTimerPillClient } from "@/components/SessionTimerPillClient";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b border-[var(--ld-purple-dim)]/30 px-4 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link
            href="/"
            className="text-sm font-black tracking-widest text-[var(--ld-neon-green)] hover:opacity-90"
          >
            LTL26
          </Link>
          <SessionTimerPillClient />
        </div>
      </header>
      {children}
    </>
  );
}
