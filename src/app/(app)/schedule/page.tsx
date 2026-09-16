import { Suspense } from "react";
import { ScheduleView } from "@/components/ScheduleView";

export default function SchedulePage() {
  return (
    <div>
      <h1 className="text-3xl font-black text-[var(--ld-neon-green)]">Schedule</h1>
      <p className="mt-2 text-[var(--ld-muted)]">
        Set times by day and stage. Star sets to build <strong className="text-white">My sets</strong>{" "}
        on this device — in-app alerts with sound at set start while your browser tab stays open.
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
