import { WalkthroughLoader } from "@/components/walkthrough/WalkthroughLoader";

export default function WalkthroughPage() {
  return (
    <div>
      <h1 className="text-3xl font-black text-[var(--ld-neon-green)]">3D Walkthrough</h1>
      <p className="mt-2 text-[var(--ld-muted)]">
        First-person preview of the grounds (desktop). On phone, use the 2D map instead.
      </p>
      <div className="mt-6">
        <WalkthroughLoader />
      </div>
    </div>
  );
}
