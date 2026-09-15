import { WalkthroughLoader } from "@/components/walkthrough/WalkthroughLoader";

export default function WalkthroughPage() {
  return (
    <div>
      <h1 className="text-3xl font-black text-[var(--ld-neon-green)]">3D Walkthrough</h1>
      <p className="mt-2 text-[var(--ld-muted)]">
        Premium first-person walk of the grounds (desktop). Free map and GPS overlay on phone.{" "}
        <strong className="text-white">$5</strong> unlocks this 3D walk and all festival games.
      </p>
      <div className="mt-6">
        <WalkthroughLoader />
      </div>
    </div>
  );
}
