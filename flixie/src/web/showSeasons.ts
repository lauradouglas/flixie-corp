import { list, number, object, text } from './models';
export interface ShowEpisode { id: number; season: number; number: number; name: string; overview: string; still: string; date: string; runtime: number | null; watched: boolean }
export interface ShowSeason { id: number; number: number; name: string; episodes: ShowEpisode[] }
export interface EpisodeSpoilerChoice { viewer: string | null; show: boolean }
/** Guests can browse public episode details; member choices stay with their viewer. */
export function showEpisodeSpoilers(viewer: string | null, choice?: EpisodeSpoilerChoice): boolean {
  return choice?.viewer === viewer ? choice.show : viewer === null;
}
export function showSeasons(value: unknown, showId: number): ShowSeason[] {
  const raw = object(value);
  if (raw.id !== showId || !Array.isArray(raw.seasons)) throw new Error('Episode details could not be loaded. Please try again.');
  const seen = new Set<number>(), episodes = new Set<number>();
  return raw.seasons.map(value => {
    const s = object(value), id = number(s.id), n = number(s.seasonNumber);
    if (!id || id<1 || !Number.isSafeInteger(id) || n === null || !Number.isSafeInteger(n) || n < 0 || seen.has(n) || !Array.isArray(s.episodes)) throw new Error('Season details could not be loaded. Please try again.');
    seen.add(n);
    return { id, number:n, name:text(s.name, n === 0 ? 'Specials' : `Season ${n}`), episodes:list(s.episodes).map(value => {
      const e=object(value), eid=number(e.id), en=number(e.episodeNumber);
      if (!eid || eid<1 || !Number.isSafeInteger(eid) || en === null || !Number.isSafeInteger(en) || en < 1 || episodes.has(eid) || (e.showId !== undefined && e.showId !== showId) || (e.seasonNumber !== undefined && e.seasonNumber !== n)) throw new Error('Episode details could not be loaded. Please try again.');
      episodes.add(eid);
      const date=text(e.airDate).slice(0,10);
      return { id:eid,season:n,number:en,name:text(e.name,`Episode ${en}`),overview:text(e.overview),still:text(e.stillPath),date:/^\d{4}-\d{2}-\d{2}$/.test(date)?date:'',runtime:number(e.runtime),watched:object(e.userState).watched===true };
    }).sort((a,b)=>a.number-b.number) };
  }).sort((a,b)=>a.number-b.number);
}
export function episodeReleased(episode:ShowEpisode,now=new Date()) { return Boolean(episode.date && episode.date <= now.toISOString().slice(0,10)); }
