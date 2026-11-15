import countryRows from '../catalog/countries.json';
import snapshot from '../catalog/discovery.json';
import {film, object, text, type Film, type MediaKind} from './models';

/** A public-only projection: no reviews, accounts, scores or owner state. */
export function discoveryFilms(value:unknown,kind:MediaKind,limit=12):Film[] {
  if(!Array.isArray(value))throw new Error('These titles could not be loaded. Please try again.');
  const seen=new Set<number>();
  const result:Film[]=[];
  for(const raw of value.slice(0,100)) {
    const row=object(raw),id=row.id,title=text(row.title,text(row.name)).trim();
    if(typeof id!=='number'||!Number.isSafeInteger(id)||id<1||id>2147483647||!title||seen.has(id))continue;
    const poster=text(row.posterPath,text(row.poster,text(row.poster_path)));
    seen.add(id);
    result.push(film({id,title:title.slice(0,500),
      posterPath:/^\/[A-Za-z0-9_-]+\.(?:jpg|jpeg|png|webp)$/i.test(poster)?poster:'',
      releaseDate:text(row.releaseDate,text(row.release_date,text(row.first_air_date))).slice(0,100)},kind));
    if(result.length>=limit)break;
  }
  return result;
}
export const discoveryYear=(date:string)=>date.match(/\b(?:18|19|20|21)\d{2}\b/)?.[0]??'';
export const discoverySnapshot={updatedAt:snapshot.updatedAt,region:"GB",
  movies:discoveryFilms(snapshot.movies,'movie'),shows:discoveryFilms(snapshot.shows,'show')};
export const discoveryCountries=countryRows as [string,string][];
export function validDiscoveryCountry(value:unknown):string|null {
  const raw=typeof value==='string'?value.trim().toUpperCase():'';
  const aliases:Record<string,string>={UK:'GB',XI:'GB',BU:'MM',TP:'TL',SU:'RU',ZR:'CD',YU:'RS',CS:'RS',XG:'DE',XC:'CZ'};
  const normalized=aliases[raw]??raw;
  return discoveryCountries.some(([id])=>id===normalized)?normalized:null;
}
export function discoveryCountry(value:unknown):string {return validDiscoveryCountry(value)??'GB';}
