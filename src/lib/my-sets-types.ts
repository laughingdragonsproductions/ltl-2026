export type ScheduleSetInput = {
  date: string;
  label: string;
  stage: string;
  artist: string;
  start: string;
  end: string;
  headliner?: boolean;
};

export type SavedSet = ScheduleSetInput & {
  savedAt: string;
};

export function makeSetId(set: Pick<ScheduleSetInput, "date" | "stage" | "artist" | "start">): string {
  return `${set.date}|${set.stage}|${set.artist}|${set.start}`;
}
