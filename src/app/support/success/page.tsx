"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { PurchaseCelebration } from "@/components/PurchaseCelebration";
import { useSession } from "@/lib/session-context";
import { setUnlockedUntil, UNLOCK_DEADLINE } from "@/lib/unlock-state";

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const { refreshSession } = useSession();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    fetch("/api/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("verify failed");
        const data = (await res.json()) as { unlockedUntil: string };
        setUnlockedUntil(data.unlockedUntil ?? UNLOCK_DEADLINE);
        refreshSession();
        setStatus("ok");
        window.history.replaceState({}, "", "/support/success");
      })
      .catch(() => {
        if (process.env.NODE_ENV === "development" && sessionId.startsWith("dev_")) {
          setUnlockedUntil(UNLOCK_DEADLINE);
          refreshSession();
          setStatus("ok");
          window.history.replaceState({}, "", "/support/success");
          return;
        }
        setStatus("error");
      });
  }, [sessionId, refreshSession]);

  return (
    <>
      <PurchaseCelebration active={status === "ok"} />
      <div className="relative z-10 mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      {status === "loading" && (
        <p className="text-[var(--ld-muted)]">Confirming your support…</p>
      )}
      {status === "ok" && (
        <>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--ld-neon-green)]">
            Thank you
          </p>
          <h1 className="mt-2 text-2xl font-black text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
            Full unlock active
          </h1>
          <p className="mt-3 text-sm text-[var(--ld-muted)]">
            All games, Google Calendar export for My sets, and ad-free browsing are unlocked.
            Thank you — your $5 helps keep this unofficial companion online.
          </p>
          <Link
            href="/games"
            className="mt-8 rounded-full bg-[var(--ld-neon-green)] px-8 py-3 text-sm font-black text-black"
          >
            Play all games
          </Link>
          <Link
            href="/schedule"
            className="mt-3 block text-sm text-[var(--ld-neon-green)] underline"
          >
            Export My sets to calendar
          </Link>
          <Link href="/map" className="mt-2 block text-sm text-[var(--ld-muted)] underline">
            Back to map
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <h1 className="text-xl font-bold text-red-300">Couldn&apos;t verify payment</h1>
          <p className="mt-2 text-sm text-[var(--ld-muted)]">
            If you were charged, contact support — we&apos;ll unlock manually.
          </p>
          <Link href="/map" className="mt-6 text-[var(--ld-neon-green)] underline">
            Return to map
          </Link>
        </>
      )}
      </div>
    </>
  );
}

export default function SupportSuccessPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-[var(--ld-muted)]">Loading…</p>}>
      <SuccessContent />
    </Suspense>
  );
}
