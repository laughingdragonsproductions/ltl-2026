import { getStageName } from "@/lib/data";
import { makeSetId, type SavedSet } from "@/lib/my-sets-types";
import { FESTIVAL_TIMEZONE } from "@/lib/schedule-time";

const VENUE = "Kentucky Expo Center, Louisville, KY";
const DOWNLOAD_FILENAME = "LTL26-My-Schedule.ics";

function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function toIcsLocal(date: string, time: string): string {
  const [y, mo, d] = date.split("-");
  const [h, mi] = time.split(":");
  return `${y}${mo}${d}T${h}${mi}00`;
}

function icsTimestampUtc(now = new Date()): string {
  return now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

const VTIMEZONE_BLOCK = `BEGIN:VTIMEZONE
TZID:America/New_York
X-LIC-LOCATION:America/New_York
BEGIN:DAYLIGHT
TZOFFSETFROM:-0500
TZOFFSETTO:-0400
TZNAME:EDT
DTSTART:19700308T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:-0400
TZOFFSETTO:-0500
TZNAME:EST
DTSTART:19701101T020000
RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
END:STANDARD
END:VTIMEZONE`;

export function buildMySetsCalendarFile(sets: SavedSet[]): string {
  const sorted = [...sets].sort((a, b) => {
    const day = a.date.localeCompare(b.date);
    return day !== 0 ? day : a.start.localeCompare(b.start);
  });

  const stamp = icsTimestampUtc();
  const events = sorted
    .map((set) => {
      const uid = `${makeSetId(set)}@ltl26.com`;
      const stage = getStageName(set.stage);
      const summary = escapeIcs(`${set.artist} @ Louder Than Life`);
      const location = escapeIcs(`${stage}, ${VENUE}`);
      const description = escapeIcs(
        `${set.label} · ${stage}\\nUnofficial fan schedule — times may change.\\nhttps://www.ltl26.com/schedule?day=${set.date}`
      );
      return [
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${stamp}`,
        `DTSTART;TZID=${FESTIVAL_TIMEZONE}:${toIcsLocal(set.date, set.start)}`,
        `DTEND;TZID=${FESTIVAL_TIMEZONE}:${toIcsLocal(set.date, set.end)}`,
        `SUMMARY:${summary}`,
        `LOCATION:${location}`,
        `DESCRIPTION:${description}`,
        "END:VEVENT",
      ].join("\r\n");
    })
    .join("\r\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LTL26//My Sets//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "NAME:LTL26 My Sets",
    "X-WR-CALNAME:LTL26 My Sets",
    VTIMEZONE_BLOCK,
    events,
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadMySetsCalendar(sets: SavedSet[]): void {
  if (typeof window === "undefined" || sets.length === 0) return;
  const body = buildMySetsCalendarFile(sets);
  const blob = new Blob([body], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = DOWNLOAD_FILENAME;
  link.click();
  URL.revokeObjectURL(url);
}
