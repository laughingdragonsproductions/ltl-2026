import { redirect } from "next/navigation";
import { WalkthroughLoader } from "@/components/walkthrough/WalkthroughLoader";
import { WALKTHROUGH_ENABLED } from "@/lib/walkthrough-public";

export default function WalkthroughPage() {
  if (!WALKTHROUGH_ENABLED) {
    redirect("/map");
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-[var(--ld-neon-green)]">3D Walkthrough</h1>
      <p className="mt-2 text-[var(--ld-muted)]">
        First-person 3D walk with stages — GPS follow on phone (auto-on), joystick to look around.{" "}
        <strong className="text-white">$5</strong> unlocks this walk, all festival games, and Google
        Calendar export for My sets.
      </p>
      <div className="mt-6">
        <WalkthroughLoader />
      </div>
    </div>
  );
}
