import Link from "next/link";
import { ArrivalGuide } from "@/components/ArrivalGuide";

export default function ArrivalPage() {
  return (
    <div>
      <h1 className="text-3xl font-black text-[var(--ld-neon-green)]">VIP & Arrival</h1>
      <p className="mt-2 text-[var(--ld-muted)]">
        Day-of arrival, parking, entrances, and wristbands. Switch pass tier above for your
        route.
      </p>
      <p className="mt-2 text-sm">
        <Link href="/credentials" className="text-[var(--ld-neon-green)] underline">
          Credentials & wristband details →
        </Link>
      </p>
      <div className="mt-6">
        <ArrivalGuide />
      </div>
    </div>
  );
}
