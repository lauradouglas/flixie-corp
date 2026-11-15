import { film, number, object, text, type Film, type MediaKind } from './models';

/** These IDs identify favourite records, not the film/show catalogue records. */
export interface RankedFavourite { id: string; rank: number | null; film: Film }
export function rankedFavourites(value: unknown, ownerId: string, kind: MediaKind): RankedFavourite[] {
  if (!Array.isArray(value)) throw new Error('Your favourites could not be loaded. Try again.');
  const ids = new Set<string>(), mediaIds = new Set<number>();
  return value.filter(value => object(value).removed !== true).map(value => {
    const row = object(value), id = text(row.id), owner = text(row.userId), media = film(row[kind], kind);
    if (!id || id.length > 100 || (owner && owner !== ownerId) || ids.has(id) || mediaIds.has(media.id))
      throw new Error('Your favourites could not be loaded. Try again.');
    ids.add(id); mediaIds.add(media.id);
    const rank = number(row.rank);
    return { id, film: media, rank: rank !== null && Number.isInteger(rank) && rank > 0 ? rank : null };
  }).sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity));
}
export function moveFavourite(items: RankedFavourite[], from: number, to: number) {
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || from >= items.length || to < 0 || to >= items.length)
    return items;
  const next = [...items], [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
export function rankingChanged(original: RankedFavourite[], draft: RankedFavourite[]) {
  return original.length !== draft.length || original.some((item, index) => item.id !== draft[index]?.id);
}
export function sameFavouriteMembership(original: RankedFavourite[], current: RankedFavourite[]) {
  const ids = new Set(original.map(item => item.id));
  return ids.size === original.length && new Set(current.map(item => item.id)).size === current.length && original.length === current.length && current.every(item => ids.has(item.id));
}
