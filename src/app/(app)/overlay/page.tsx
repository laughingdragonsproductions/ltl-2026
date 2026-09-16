import { SimpleOverlayGui } from "@/components/SimpleOverlayGui";
import { ShareButton } from "@/components/ShareButton";
import { isOverlayAdminEnabled } from "@/lib/overlay-georef";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function OverlayPage() {
  if (!isOverlayAdminEnabled()) {
    redirect("/overlay/live");
  }
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--ld-purple)]">
            Virtual overlay
          </p>
          <h1 className="mt-1 text-3xl font-black text-[var(--ld-neon-green)]">
            Align overlay
          </h1>
          <p className="mt-2 text-sm text-[var(--ld-muted)]">
            Admin tool — drag <strong className="text-white">✥</strong> or use arrows, then{" "}
            <strong className="text-white">Copy georef JSON</strong> into{" "}
            <code className="text-[var(--ld-text)]">data/georef.json</code> and deploy.{" "}
            <Link href="/overlay/live" className="text-[var(--ld-neon-green)] underline">
              GPS live mode
            </Link>{" "}
            uses that fixed alignment; users adjust opacity only.
          </p>
        </div>
        <ShareButton url="https://ltl26.com/overlay" />
      </div>
      <div className="mt-6">
        <SimpleOverlayGui />
      </div>
    </div>
  );
}
