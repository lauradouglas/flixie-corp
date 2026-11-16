import { isDeepStrictEqual } from 'node:util';
import type { CatalogTitle } from '../../src/catalog';
import { object } from '../../src/web/models';
import { discoveryFilms } from '../../src/web/publicDiscovery';
import { fetchTitles, publicTitle, selectMovieReferences, type TitleReference } from './title-catalog';

export interface CatalogSnapshot {
  updatedAt:string;
  coverage:{mode:'curated'|'weekly-popular';maximumMovies:number;priorityIds:number[];excludedIds:number[];automaticallyAddedIds?:number[]};
  titles:CatalogTitle[];
}
const validId=(id:unknown):id is number=>typeof id==='number'&&Number.isSafeInteger(id)&&id>0&&id<=2147483647;
function ids(value:unknown,label:string):number[] {
  if(!Array.isArray(value)||!value.every(validId)||new Set(value).size!==value.length)throw Error(`Invalid ${label}`);
  return value;
}
export function parseCatalogSnapshot(value:unknown):CatalogSnapshot {
  const raw=object(value),coverage=object(raw.coverage);
  if(typeof raw.updatedAt!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(raw.updatedAt)||!Array.isArray(raw.titles)||
    !['curated','weekly-popular'].includes(String(coverage.mode))||!Number.isSafeInteger(coverage.maximumMovies)||Number(coverage.maximumMovies)<1)
    throw Error('Invalid catalogue snapshot; retain the existing site.');
  const titles=raw.titles.map(value=>{
    const row=object(value);
    if(!validId(row.id)||(row.kind!=='movie'&&row.kind!=='show'))throw Error('Invalid saved title');
    return publicTitle(value,{id:row.id,kind:row.kind});
  });
  if(new Set(titles.map(t=>`${t.kind}/${t.id}`)).size!==titles.length)throw Error('Duplicate saved titles');
  return {updatedAt:raw.updatedAt,coverage:{
    mode:coverage.mode==='curated'?'curated':'weekly-popular',maximumMovies:Number(coverage.maximumMovies),
    priorityIds:ids(coverage.priorityIds,'saved priority IDs'),excludedIds:ids(coverage.excludedIds,'saved exclusion IDs'),
    ...(coverage.automaticallyAddedIds===undefined?{}:{automaticallyAddedIds:ids(coverage.automaticallyAddedIds,'automatic movie IDs')}),
  },titles};
}

export function createPublicMovieReader(base:string,transport:typeof fetch=fetch) {
  const url=new URL(base);
  if((url.protocol!=='https:'&&!(url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname)))||url.username||url.password||url.search||url.hash)
    throw Error('Use a public HTTPS API or the local backend without credentials.');
  return async(path:string):Promise<unknown>=>{
    if(path!=='/movies/popular?region=GB'&&!/^\/movies\/id\/[1-9]\d*\?includeReviews=false&includeTmdbRating=false$/.test(path))
      throw Error('Only public movie discovery and public detail requests are allowed.');
    const response=await transport(base.replace(/\/$/,'')+path,{
      headers:{Accept:'application/json'},credentials:'omit',signal:AbortSignal.timeout(30000),
    });
    if(!response.ok)throw Error(`Public movie refresh failed: ${response.status}`);
    return response.json();
  };
}

export async function refreshPopularCatalog(previous:CatalogSnapshot,popular:unknown,options:{
  maximumMovies:number;priorityMovies:readonly {id:number;title:string}[];excludedIds:readonly number[];
  today:string;loadMovie:(reference:TitleReference)=>Promise<unknown>;
}) {
  const feed=discoveryFilms(popular,'movie',20);
  if(!feed.length)throw Error('Empty or invalid popular feed; retain the existing site.');
  const excluded=new Set(options.excludedIds);
  const priority=options.priorityMovies.filter(t=>!excluded.has(t.id));
  const existing=previous.titles.filter(t=>t.kind==='movie');
  const existingById=new Map(existing.map(t=>[t.id,t]));
  const references=feed.map(({id})=>({kind:'movie' as const,id}));
  const selected=selectMovieReferences(existing,priority.map(({id})=>({kind:'movie',id})),[references],options.maximumMovies,options.excludedIds);
  // Reuse published public facts; only new selected movie IDs cause detail reads.
  const additions=selected.filter(t=>!existingById.has(t.id));
  const loaded=await fetchTitles(additions,options.loadMovie);
  const loadedById=new Map(loaded.map(t=>[t.id,t]));
  const movies=selected.map(({id})=>{
    const title=existingById.get(id)??loadedById.get(id);
    if(!title)throw Error(`Missing selected movie ${id}`);
    return publicTitle(title,{kind:'movie',id});
  });
  const nameKey=(name:string)=>name.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
  for(const expected of priority){
    const actual=movies.find(t=>t.id===expected.id);
    if(!actual||nameKey(actual.title)!==nameKey(expected.title))throw Error(`Required movie mismatch: ${expected.title}`);
  }
  const selectedIds=new Set(movies.map(t=>t.id));
  const automaticallyAddedIds=[...new Set([...(previous.coverage.automaticallyAddedIds??[]),...additions.map(t=>t.id)])]
    .filter(id=>selectedIds.has(id));
  const coverage:CatalogSnapshot['coverage']={mode:'weekly-popular',maximumMovies:options.maximumMovies,
    priorityIds:priority.map(t=>t.id),excludedIds:[...options.excludedIds],automaticallyAddedIds};
  const titles=[...movies,...previous.titles.filter(t=>t.kind==='show')];
  const changed=!isDeepStrictEqual(previous.titles,titles)||!isDeepStrictEqual(previous.coverage,coverage);
  const snapshot:CatalogSnapshot={updatedAt:changed?options.today:previous.updatedAt,coverage,titles};
  return {snapshot,changed,report:{
    region:'GB',previousMovies:existing.length,movies:movies.length,maximumMovies:options.maximumMovies,
    addedIds:additions.map(t=>t.id),excludedFeedIds:feed.filter(t=>excluded.has(t.id)).map(t=>t.id),
    capacitySkippedIds:feed.filter(t=>!excluded.has(t.id)&&!selectedIds.has(t.id)).map(t=>t.id),
  }};
}
