/** Festival wall-clock times — America/New_York (Louisville). */
export const FESTIVAL_TIMEZONE = "America/New_York";

export function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${suffix}`;
}

/** Parse YYYY-MM-DD + HH:MM as festival local time (America/New_York). */
export function setStartDate(date: string, start: string): Date {
  const rough = new Date(`${date}T${start}:00`);
  let ms = rough.getTime();
  for (let i = 0; i < 6; i++) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: FESTIVAL_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date(ms));
    const gotDate = `${parts.find((p) => p.type === "year")?.value}-${parts.find((p) => p.type === "month")?.value}-${parts.find((p) => p.type === "day")?.value}`;
    const gotTime = `${parts.find((p) => p.type === "hour")?.value}:${parts.find((p) => p.type === "minute")?.value}`;
    if (gotDate === date && gotTime === start) return new Date(ms);
    const wantMs = Date.parse(`${date}T${start}:00`);
    const gotMs = Date.parse(`${gotDate}T${gotTime}:00`);
    ms += wantMs - gotMs;
  }
  return new Date(ms);
}

export function minutesUntil(target: Date, now = new Date()): number {
  return (target.getTime() - now.getTime()) / 60_000;
}

export function festivalTodayIso(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FESTIVAL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function currentFestivalMinutes(now = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: FESTIVAL_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return h * 60 + m;
}
