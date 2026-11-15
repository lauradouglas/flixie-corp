import { imageUrl, number, object, text, type MediaKind } from "./models";
import { preferredPersonPortrait } from "./personPortraits";

export interface TalentPhoto { id: string; path: string }
export interface Talent {
  id: number; name: string; biography: string; portrait: string; department: string;
  birthDate: string; deathDate: string; birthplace: string; imdbId: string;
  photos: TalentPhoto[];
}
export interface TalentCredit {
  id: number; kind: MediaKind; title: string; posterPath: string; releaseDate: string;
  roles: string[]; jobs: { job: string; department: string }[]; acting: boolean;
  popularity: number;
}
export interface TalentCredits { all: TalentCredit[]; knownFor: TalentCredit[] }
export type CreditRole = "all" | "acting" | "directing" | "writing" | "production";
export type CreditSort = "newest" | "oldest" | "popular";
export const validPersonId = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value > 0 && value <= 2147483647;
export function personDate(value: unknown): string {
  const raw = text(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) &&
    Number.isFinite(Date.parse(raw)) && new Date(raw).toISOString().slice(0, 10) === raw ? raw : "";
}
export function displayPersonDate(value: string): string {
  return personDate(value) ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(value)) : "";
}
export function talentPhotos(value: unknown, id: number): TalentPhoto[] {
  if (!Array.isArray(value)) throw new Error("Person photos could not be loaded. Please try again.");
  const seen = new Set<string>();
  return value.flatMap(item => {
    const row = object(item), path = text(row.imageUrl);
    if ((row.personId !== undefined && number(row.personId) !== id) || !imageUrl(path) || seen.has(path)) return [];
    seen.add(path); return [{ id: path, path }];
  });
}
export function talent(value: unknown, expectedId: number): Talent {
  const row = object(value), id = number(row.id), name = text(row.name).trim();
  if (!validPersonId(id) || id !== expectedId || !name)
    throw new Error("This person's information could not be loaded. Please try again.");
  const photos = row.images == null ? [] : talentPhotos(row.images, id);
  const availablePaths = new Set(photos.map(photo => photo.path));
  // The existing endpoint lists profile photos before tagged film artwork.
  // Only use a validated portrait-shaped photo as the missing primary's fallback.
  const fallback = Array.isArray(row.images) ? row.images.map(object).find(image => {
    const ratio = number(image.aspectRatio) ?? ((number(image.width) && number(image.height)) ? number(image.width)! / number(image.height)! : null);
    return availablePaths.has(text(image.imageUrl)) && ["", "profile"].includes(text(image.imageType).toLowerCase()) && ratio !== null && ratio >= .5 && ratio <= .85;
  }) : undefined;
  const primary = text(row.profileImgUrl);
  const portrait = preferredPersonPortrait(id, imageUrl(primary) ? primary : text(fallback?.imageUrl));
  return { id, name, biography: text(row.biography).trim(), portrait: imageUrl(portrait) ? portrait : "",
    department: text(row.department), birthDate: personDate(row.dateOfBirth), deathDate: personDate(row.dateOfDeath),
    birthplace: text(row.placeOfBirth), imdbId: /^nm\d+$/.test(text(row.imdbId)) ? text(row.imdbId) : "",
    photos };
}
export function directorPeople(value: unknown): { id: number; name: string }[] {
  const raw = object(value), rows = raw.crewMembers ?? raw.crew;
  const seen = new Set<number>();
  return (Array.isArray(rows) ? rows : []).flatMap(value => {
    const row = object(value), id = number(row.id), name = text(row.name).trim();
    if (text(row.job) !== "Director" || !validPersonId(id) || !name || seen.has(id)) return [];
    seen.add(id); return [{ id, name }];
  });
}
function credit(value: unknown, acting: boolean): TalentCredit | null {
  const row = object(value), id = number(row.id), kind = row.type === "movie" ? "movie" : row.type === "tv" ? "show" : null;
  const title = text(row.title).trim();
  if (!validPersonId(id) || !kind || !title || row.adult === true) return null;
  const poster = text(row.posterPath), job = text(row.job).trim();
  return { id, kind, title, posterPath: imageUrl(poster) ? poster : "", releaseDate: personDate(row.releaseDate),
    roles: Array.isArray(row.characters) ? [...new Set(row.characters.filter((v): v is string => typeof v === "string" && Boolean(v.trim())).map(v => v.trim()))] : [],
    jobs: !acting && job ? [{ job, department: text(row.department) }] : [], acting,
    popularity: number(row.popularity) ?? 0 };
}
const key = (item: TalentCredit) => `${item.kind}:${item.id}`;
export function talentCredits(value: unknown): TalentCredits {
  const raw = object(value);
  if (!["allCredits", "crewCredits", "knownForCredits"].every(k => Array.isArray(raw[k])))
    throw new Error("Credits could not be loaded. Please try again.");
  const merged = new Map<string, TalentCredit>();
  for (const [rows, acting] of [[raw.allCredits, true], [raw.crewCredits, false]] as const) {
    for (const value of rows as unknown[]) {
      const item = credit(value, acting); if (!item) continue;
      const existing = merged.get(key(item));
      if (!existing) { merged.set(key(item), item); continue; }
      existing.acting ||= item.acting;
      existing.roles = [...new Set([...existing.roles, ...item.roles])];
      for (const job of item.jobs) if (!existing.jobs.some(j => j.job === job.job && j.department === job.department)) existing.jobs.push(job);
    }
  }
  const known = new Map<string, TalentCredit>();
  for (const value of raw.knownForCredits as unknown[]) {
    const item = credit(value, false); if (item && !known.has(key(item))) known.set(key(item), merged.get(key(item)) ?? item);
  }
  return { all: [...merged.values()], knownFor: [...known.values()] };
}
export function creditHasRole(item: TalentCredit, role: CreditRole): boolean {
  if (role === "all") return true;
  if (role === "acting") return item.acting;
  return item.jobs.some(({ job, department }) => role === "directing" ? job.toLowerCase() === "director" :
    role === "writing" ? department.toLowerCase() === "writing" || /^(writer|screenplay|story|teleplay)$/.test(job.toLowerCase()) :
      /producer/i.test(job));
}
export function selectTalentCredits(items: TalentCredit[], filters: {
  role: CreditRole; media: "all" | MediaKind; sort: CreditSort; query: string; year: string;
}, today = new Date().toISOString().slice(0, 10)): TalentCredit[] {
  const query = filters.query.trim().toLowerCase();
  return items.filter(item => creditHasRole(item, filters.role) && (filters.media === "all" || item.kind === filters.media) &&
    (!filters.year || item.releaseDate.startsWith(filters.year)) && (!query || [item.title, ...item.roles, ...item.jobs.map(j => j.job)].some(v => v.toLowerCase().includes(query))))
    .sort((a, b) => {
      let comparison = 0;
      if (filters.sort === "popular") comparison = b.popularity - a.popularity;
      else if (!a.releaseDate || !b.releaseDate) comparison = Number(!a.releaseDate) - Number(!b.releaseDate);
      else if (filters.sort === "oldest") comparison = a.releaseDate.localeCompare(b.releaseDate);
      else comparison = Number(a.releaseDate > today) - Number(b.releaseDate > today) || b.releaseDate.localeCompare(a.releaseDate);
      return comparison || a.title.localeCompare(b.title) || key(a).localeCompare(key(b));
    });
}
