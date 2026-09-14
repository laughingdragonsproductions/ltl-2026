import { ArrivalGuide } from "@/components/ArrivalGuide";

export default function ArrivalPage() {
  return (
    <div>
      <h1 className="text-3xl font-black">Day-of Arrival Guide</h1>
      <p className="mt-2 text-zinc-400">
        Step-by-step for first-timers: wristband registration, parking, entrance, and lockers.
        Switch your pass tier in the nav for personalized routing.
      </p>
      <div className="mt-6">
        <ArrivalGuide />
      </div>
    </div>
  );
}
