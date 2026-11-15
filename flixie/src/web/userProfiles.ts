import { film, list, number, object, person, text, type Film, type Person } from './models';
import { preferredPersonPortrait } from './personPortraits';

export interface UserProfile extends Person {
  bio: string; createdAt: string; relationship: 'self' | 'friend' | 'public';
  sharing: boolean; detailsVisible: boolean; activityVisible: boolean;
  stats: { films: number; shows: number; watchlist: number; ratings: number; reviews: number } | null;
  movies: Film[]; shows: Film[];
  people: { id: number; name: string; department: string; portrait: string }[]; genres: string[];
}
export interface ProfilePost {
  id: string; type: string; film: Film; createdAt: string; rating: number | null;
  title: string; body: string; containsSpoilers: boolean;
}
export function userProfile(value: unknown, expectedId?: string): UserProfile {
  const row = object(value), base = person(row);
  if (!base.id || (expectedId && base.id !== expectedId) || !['self','friend','public'].includes(text(row.relationship))) throw new Error('This profile could not be loaded.');
  const close = row.relationship === 'self' || row.relationship === 'friend';
  const detailsVisible = row.detailsVisible === true;
  const stats = object(row.stats);
  return { ...base, firstName: close ? base.firstName : '',
    bio: detailsVisible ? text(row.bio) : '', createdAt: text(row.createdAt), relationship: row.relationship as UserProfile['relationship'],
    sharing: row.sharing === true, detailsVisible, activityVisible: close && row.activityVisible === true,
    stats: close && row.stats ? { films: number(stats.films) ?? 0, shows: number(stats.shows) ?? 0, watchlist: number(stats.watchlist) ?? 0, ratings: number(stats.ratings) ?? 0, reviews: number(stats.reviews) ?? 0 } : null,
    movies: detailsVisible ? list(row.favouriteMovies).map(value => film(value)) : [],
    shows: detailsVisible ? list(row.favouriteShows).map(value => film(value,'show')) : [],
    people: detailsVisible ? list(row.favouritePeople).flatMap(value => {
      const p=object(value), id=number(p.id);
      return id && Number.isSafeInteger(id) && id>0 ? [{ id, name: text(p.name), department: text(p.department), portrait: preferredPersonPortrait(id,text(p.profileImgUrl)) }] : [];
    }) : [],
    genres: list(row.genres).map(value => text(object(value).name)).filter(Boolean),
  };
}
export function profilePosts(value: unknown) {
  const row=object(value);
  if (!Array.isArray(row.items)) throw new Error('This profile section could not be loaded.');
  return { items: row.items.map(value => {
    const post=object(value), media=object(post.film);
    if (!text(post.id) || !['movie','show'].includes(text(media.kind))) throw new Error('This profile section could not be loaded.');
    return { id:text(post.id), type:text(post.type), film:film(media,media.kind as 'movie'|'show'), createdAt:text(post.createdAt), rating:number(post.rating), title:text(post.title), body:text(post.body), containsSpoilers:post.containsSpoilers===true };
  }), nextCursor: text(row.nextCursor) || null };
}
export function profileFriends(value: unknown): Person[] {
  const row=object(value);
  if (!Array.isArray(row.items)) throw new Error('Your friends could not be loaded.');
  return [...new Map(row.items.map(person).filter(p=>p.id).map(p=>[p.id,p])).values()];
}
export const badgeLabels: Record<string,string> = { FOUNDER:'Founder', OG_USER:'OG member', VERIFIED:'Verified', EARLY_ADOPTER:'Early adopter', FOUNDING_FILM_FRIEND:'Founding film friend', BORDER_CHRISTMAS_LIGHTS:'Christmas lights' };
