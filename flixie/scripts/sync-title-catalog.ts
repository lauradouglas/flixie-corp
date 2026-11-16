// Deliberate public-only movie refresh. Existing TV pages remain unchanged.
import { readFile, rename, writeFile } from 'node:fs/promises';
import { discoveryFilms } from '../src/web/publicDiscovery';
import { expandMovies, type TitleReference } from './lib/title-catalog';
import type { CatalogTitle } from '../src/catalog';

const base=(process.env.FLIXIE_CATALOG_API_URL??'http://127.0.0.1:3000').replace(/\/$/,'');
const origin=new URL(base);
if(origin.protocol!=='https:'&&!['127.0.0.1','localhost'].includes(origin.hostname))throw Error('Use HTTPS or the local backend.');
if(origin.username||origin.password||origin.search||origin.hash)throw Error('Use a public API origin without credentials.');
const target=100;
const filename='src/catalog/titles.json';
const previous=JSON.parse(await readFile(filename,'utf8')) as {titles:CatalogTitle[]};
if(!Array.isArray(previous.titles))throw Error('Invalid existing catalogue.');
const movies=previous.titles.filter(t=>t.kind==='movie');
if(movies.length>target)throw Error('Retain all published films; review the target before expanding.');
const get=async(path:string)=>{
  const response=await fetch(base+path,{headers:{Accept:'application/json'},credentials:'omit',signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw Error(`Public catalogue request ${path}: ${response.status}`);
  return response.json() as Promise<unknown>;
};
const sources=['/movies/popular?region=GB','/movies/top_rated?region=GB',
  '/movies/now_playing?region=GB','/movies/upcoming?region=GB',
  ...movies.slice(0,6).map(t=>`/movies/${t.id}/recommendations`)];
const feeds:TitleReference[][]=[];
for(const path of sources){
  const feed=discoveryFilms(await get(path),'movie',100);
  if(!feed.length)throw Error(`Empty public feed ${path}; previous snapshot retained.`);
  feeds.push(feed.map(({id})=>({kind:'movie',id})));
}
const titles=await expandMovies(previous.titles,feeds,target,({id})=>get(`/movies/id/${id}?includeReviews=false&includeTmdbRating=false`));
// Nothing changes on disk until every new movie has complete public metadata.
await writeFile(filename+'.tmp',JSON.stringify({updatedAt:new Date().toISOString().slice(0,10),titles},null,2)+'\n');
await rename(filename+'.tmp',filename);
console.log(`Saved ${target} public movies; existing TV pages unchanged. Review and build before publishing.`);
