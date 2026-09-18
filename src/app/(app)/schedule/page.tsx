import { Suspense } from "react";
import { ScheduleView } from "@/components/ScheduleView";

export default function SchedulePage() {
  return (
    <div>
      <h1 className="text-3xl font-black text-[var(--ld-neon-green)]">Schedule</h1>
      <p className="mt-2 text-[var(--ld-muted)]">
        Set times by day and stage. Star sets for free alerts (~15 minutes before + at start).{" "}
        <strong className="text-white">$5</strong> unlocks Google Calendar download for My sets.
        NOW/NEXT highlights on festival days.
      </p>
      <div className="mt-6">
        <Suspense fallback={<p className="text-[var(--ld-muted)]">Loading schedule…</p>}>
          <ScheduleView />
        </Suspense>
      </div>
    </div>
  );
}
