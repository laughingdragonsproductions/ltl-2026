import { ScheduleView } from "@/components/ScheduleView";

export default function SchedulePage() {
  return (
    <div>
      <h1 className="text-3xl font-black">Schedule</h1>
      <p className="mt-2 text-zinc-400">
        Set times by day and stage. Now/Next highlights activate on festival days.
      </p>
      <div className="mt-6">
        <ScheduleView />
      </div>
    </div>
  );
}
