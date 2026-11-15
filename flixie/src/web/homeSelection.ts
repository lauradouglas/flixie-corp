import type { Film } from "./models";

/** Preview actual saved films, with explicit Watch soon selections first. */
export function homeSavedFilms(
  soon: readonly Film[] = [],
  library: readonly Film[] = [],
) {
  const seen = new Set<number>();
  return [
    ...soon.map((film) => ({ film, watchSoon: true })),
    ...library.map((film) => ({ film, watchSoon: false })),
  ]
    .filter(({ film }) => {
      if (film.kind !== "movie" || seen.has(film.id)) return false;
      seen.add(film.id);
      return true;
    })
    .slice(0, 3);
}
