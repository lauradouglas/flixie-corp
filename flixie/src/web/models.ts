export type JsonObject = Record<string, unknown>;
export const object = (value: unknown): JsonObject =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : {};
export const list = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];
export const text = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;
export const number = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value)
    ? value
    : typeof value === "string" &&
        value.trim() &&
        Number.isFinite(Number(value))
      ? Number(value)
      : null;
export type MediaKind = "movie" | "show";
export interface Person {
  id: string;
  username: string;
  firstName: string;
  avatar: JsonObject;
  profileBadges: string[];
}
export interface Account extends Person {
  externalId: string;
  country: string;
  completedSetup: boolean;
}
export interface Film {
  id: number;
  kind: MediaKind;
  title: string;
  posterPath: string;
  releaseDate: string;
  runtime: number | null;
  overview: string;
  tagline: string;
  genres: string[];
  score: number | null;
  scoreCount: number;
  scoreSource: "Flixie" | "TMDB" | null;
  raw: JsonObject;
}
export interface DiaryEntry {
  id: string;
  movie: Film;
  watchedAt: string | null;
  rating: number | null;
  notes: string;
  watchedAtCinema: boolean;
  review: { id: string; title: string; body: string; containsSpoilers: boolean } | null;
}
export interface Activity {
  id: string;
  kind: string;
  person: Person;
  film: Film | null;
  rating: number | null;
  createdAt: string;
}
export interface PublicReview {
  id: string;
  person: Person;
  title: string;
  body: string;
  containsSpoilers: boolean;
  rating: number | null;
  createdAt: string;
}
export interface ContinuedShow {
  showId: number;
  title: string;
  posterPath: string;
  watched: number;
  total: number;
  last: { season: number; episode: number; title: string } | null;
}
export interface Plan {
  id: string;
  films: Film[];
  people: (Person & { response: "joined" | "pending" | "declined" | "included" | null })[];
  date: string;
  dateOnly: boolean;
  location: string;
  placeKind: string;
  hostId: string | null;
  status: string;
  confirmed: boolean;
  changesProposed: boolean;
  selectedMovieId: number | null;
}
export interface Pick {
  film: Film;
  reasons: string[];
  offers: string[];
}

export function badges(value: unknown): string[] {
  return list(value)
    .map((item) => (typeof item === "string" ? item : text(object(item).badge)))
    .filter(Boolean);
}
export function person(value: unknown): Person {
  const row = object(value);
  return {
    id: text(row.id),
    username: text(row.username, "Flixie member"),
    firstName: text(row.firstName),
    avatar: object(row.avatar),
    profileBadges: badges(row.profileBadges),
  };
}
export function account(value: unknown, uid: string): Account {
  const row = object(value);
  if (!text(row.id) || text(row.externalId) !== uid)
    throw new Error("Your Flixie profile could not be loaded.");
  const country = object(row.country);
  return {
    ...person(row),
    externalId: uid,
    country: text(
      country.abbreviation,
      text(
        country.iso3166_1,
        text(country.iso_3166_1, text(country.code, "GB")),
      ),
    ),
    completedSetup: row.completedSetup === true,
  };
}
export function film(value: unknown, kind: MediaKind = "movie"): Film {
  const row = object(value);
  const id = number(row.id);
  if (!id || !Number.isSafeInteger(id) || id < 1)
    throw new Error("This title is unavailable.");
  const ownScore = number(kind === "show" ? row.flixieScore : row.voteAverage);
  const ownCount =
    number(kind === "show" ? row.flixieRatingCount : row.voteCount) ?? 0;
  const sourceScore = number(
    row.tmdbVoteAverage ?? row.tmdbRating ?? row.vote_average,
  );
  const sourceCount = number(row.tmdbVoteCount ?? row.vote_count) ?? 0;
  const usesFlixie =
    ownCount >= 20 && ownScore !== null && ownScore > 0 && ownScore <= 10;
  const validSource =
    sourceScore !== null && sourceScore > 0 && sourceScore <= 10
      ? sourceScore
      : null;
  return {
    id,
    kind,
    title: text(row.title, text(row.name, "Untitled")),
    posterPath: text(row.posterPath, text(row.poster_path)),
    releaseDate: text(
      row.releaseDate,
      text(row.release_date, text(row.firstAirDate, text(row.first_air_date))),
    ),
    runtime: number(row.runtime ?? row.episodeRunTime),
    overview: text(row.overview),
    tagline: text(row.tagline),
    genres: list(row.genres)
      .map((g) => (typeof g === "string" ? g : text(object(g).name)))
      .filter(Boolean),
    score: usesFlixie ? ownScore : validSource,
    scoreCount: usesFlixie ? ownCount : sourceCount,
    scoreSource: usesFlixie ? "Flixie" : validSource !== null ? "TMDB" : null,
    raw: row,
  };
}
export function watchlist(value: unknown): Film[] {
  const row = object(value);
  const movies = Array.isArray(value)
    ? value
    : list(row.movieWatchlistWithWatchedStatus ?? row.movieWatchlist);
  const shows = list(row.showWatchlistWithWatchedStatus ?? row.showWatchlist);
  return [
    ...movies
      .filter((r) => object(r).removed !== true)
      .map((r) => film(object(r).movie ?? r)),
    ...shows
      .filter((r) => object(r).removed !== true)
      .map((r) => film(object(r).show ?? r, "show")),
  ];
}
export function avatarBorder(badges: string[]): string {
  const priority = [
    "BORDER_CHRISTMAS_LIGHTS",
    "FOUNDER",
    "OG_USER",
    "VERIFIED",
    "FOUNDING_FILM_FRIEND",
    "EARLY_ADOPTER",
  ];
  const selected = badges.find((b) => b.startsWith("FRAME:"))?.slice(6);
  if (selected === "NONE") return "";
  if (selected && priority.includes(selected) && badges.includes(selected))
    return selected;
  return priority.find((b) => badges.includes(b)) ?? "";
}
export function diaryEntry(value: unknown): DiaryEntry {
  const row = object(value);
  const linkedReview = list(row.reviews).map(object).find(item =>
    text(item.watchEntryId) === text(row.id) && text(item.userId) === text(row.userId) && text(row.userId) && text(item.body).trim());
  return {
    id: text(row.id),
    movie: film(row.movie),
    watchedAt: text(row.watchedAt) || null,
    rating: number(row.rating),
    notes: text(row.notes),
    watchedAtCinema: row.watchedAtCinema === true,
    review: linkedReview ? { id: text(linkedReview.id), title: text(linkedReview.title), body: text(linkedReview.body), containsSpoilers: linkedReview.containsSpoilers === true } : null,
  };
}
export function activity(value: unknown): Activity {
  const row = object(value);
  const media = row.movie ?? row.show;
  return {
    id: text(row.id),
    kind: text(row.type),
    person: person(row.user ?? { ...row, id: row.userId }),
    film: media ? film(media, row.show ? "show" : "movie") : null,
    rating: number(row.rating),
    createdAt: text(row.createdAt),
  };
}
export function review(value: unknown): PublicReview {
  const row = object(value);
  return {
    id: text(row.id),
    person: person(row.user),
    title: text(row.title),
    body: text(row.body),
    containsSpoilers: row.containsSpoilers === true,
    rating: number(row.rating ?? object(row.watchEntry).rating),
    createdAt: text(row.createdAt),
  };
}
export function continued(value: unknown): ContinuedShow {
  const row = object(value),
    last = object(row.lastWatchedEpisode);
  return {
    showId: number(row.showId) ?? 0,
    title: text(row.name, text(row.title, "TV show")),
    posterPath: text(row.posterPath),
    watched: number(row.watchedEpisodes) ?? 0,
    total: number(row.totalEpisodes) ?? 0,
    last:
      number(last.episodeNumber) !== null
        ? {
            season: number(last.seasonNumber) ?? 1,
            episode: number(last.episodeNumber) ?? 1,
            title: text(last.title),
          }
        : null,
  };
}
export function plan(value: unknown): Plan {
  const row = object(value),
    schedule = object(row.schedule),
    where = object(row.where);
  if (!text(row.id)) throw new Error("This Watch Plan could not be loaded.");
  const people = list(row.people).map((value) => {
    const participant = object(value), user = person(participant.user);
    const response = text(participant.response);
    return { ...user, response: ["joined", "pending", "declined", "included"].includes(response) ? response as Plan["people"][number]["response"] : null };
  }).filter((user, index, all) => user.id && all.findIndex(p => p.id === user.id) === index);
  const date = text(schedule.date, text(schedule.at, text(schedule.dateTime)));
  return {
    id: text(row.id),
    films: list(row.films).map((f) => film(f)),
    people,
    date,
    dateOnly: schedule.dateOnly === true || /^\d{4}-\d{2}-\d{2}$/.test(date),
    location: text(where.venue).trim(),
    placeKind: text(where.kind),
    hostId: text(where.hostId) || null,
    status: text(row.status, text(row.phase, "Planned")),
    confirmed: row.confirmed === true,
    changesProposed: row.proposal != null,
    selectedMovieId: number(row.selectedMovieId),
  };
}
export function pick(value: unknown): Pick {
  const row = object(value);
  return {
    film: film(row),
    reasons: list(row.reasonDetails)
      .map((r) => text(object(r).text))
      .filter(Boolean),
    offers: [
      ...new Set(
        list(object(row.availability).viewers).flatMap((v) =>
          list(object(v).offers).map((o) => {
            const offer = object(o);
            return [
              text(offer.providerName),
              text(offer.region),
              text(offer.type),
            ]
              .filter(Boolean)
              .join(" · ");
          }),
        ),
      ),
    ],
  };
}
export function imageUrl(path: string, size = "w342"): string | undefined {
  if (/^\/[A-Za-z0-9_./-]+$/.test(path))
    return `https://image.tmdb.org/t/p/${size}${path}`;
  try {
    const url = new URL(path);
    if (
      url.protocol === "https:" ||
      (url.protocol === "http:" &&
        ["127.0.0.1", "localhost"].includes(url.hostname))
    )
      return url.href;
  } catch {}
  return undefined;
}
export function avatarUrl(avatar: JsonObject): string | undefined {
  const path =
    text(avatar.iconImageUrl) ||
    text(avatar.iconUrl) ||
    text(avatar.thumbnailUrl) ||
    text(avatar.imageUrl) ||
    text(avatar.originalUrl) ||
    text(avatar.url);
  return imageUrl(path, "w185");
}
export function movieMeta(value: Film): string {
  return [
    value.releaseDate.slice(0, 4),
    value.runtime
      ? `${Math.floor(value.runtime / 60)}h ${value.runtime % 60}m`
      : null,
    ...value.genres.slice(0, 2),
  ]
    .filter(Boolean)
    .join(" · ");
}
export function viewDate(value: string | null): string {
  if (!value) return "Date not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date not set"
    : new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
}
