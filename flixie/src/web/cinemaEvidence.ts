import { object, text } from "./models";
export const cinemaFreshnessMs = 6 * 60 * 60 * 1000;
export function currentCinemaStatus(
  raw: unknown,
  region: string,
  now = Date.now(),
) {
  const row = object(raw),
    checkedAt = text(row.checkedAt),
    checked = Date.parse(checkedAt);
  return row.region === region &&
    row.inCinemas === true &&
    row.source === "TMDB now playing" &&
    Number.isFinite(checked) &&
    checked <= now &&
    checked + cinemaFreshnessMs > now
    ? { checkedAt }
    : null;
}
