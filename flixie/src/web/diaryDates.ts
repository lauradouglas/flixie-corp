import type { DiaryEntry } from "./models";
/** Watched dates are calendar dates. Do not shift them into the viewer's timezone. */
export function diaryDateKey(value: string | null): string | null {
  const key = value
    ?.match(/^(\d{4})-(\d{2})-(\d{2})(?:T|$)/)?.[0]
    ?.slice(0, 10);
  if (!key) return null;
  const date = new Date(`${key}T12:00:00Z`);
  return Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === key
    ? key
    : null;
}
export function diaryMonthEntries(
  entries: readonly DiaryEntry[],
  month: string,
) {
  return entries.filter((entry) =>
    diaryDateKey(entry.watchedAt)?.startsWith(month),
  );
}
export function diaryCalendarDays(month: string): (string | null)[] {
  const [year, m] = month.split("-").map(Number);
  const offset = (new Date(Date.UTC(year, m - 1, 1)).getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(year, m, 0)).getUTCDate();
  return Array.from({ length: Math.ceil((offset + count) / 7) * 7 }, (_, i) =>
    i < offset || i >= offset + count
      ? null
      : `${month}-${String(i - offset + 1).padStart(2, "0")}`,
  );
}
export function shiftDiaryMonth(month: string, by: number) {
  const [year, m] = month.split("-").map(Number);
  return new Date(Date.UTC(year, m - 1 + by, 1)).toISOString().slice(0, 7);
}
export function diaryDateLabel(
  key: string,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  },
) {
  return new Date(
    `${key.length === 7 ? key + "-01" : key}T12:00:00Z`,
  ).toLocaleDateString("en-GB", { ...options, timeZone: "UTC" });
}
