// Refresh the user's curated public movies. Existing TV pages remain unchanged.
import { readFile, rename, writeFile } from 'node:fs/promises';
import { expandMovies } from './lib/title-catalog';
import type { CatalogTitle } from '../src/catalog';
import priorityMovies from './catalog-priority-movies.json';
import excludedMovies from './catalog-excluded-movies.json';

const base=(process.env.FLIXIE_CATALOG_API_URL??'http://127.0.0.1:3000').replace(/\/$/,'');
const origin=new URL(base);
if(origin.protocol!=='https:'&&!['127.0.0.1','localhost'].includes(origin.hostname))throw Error('Use HTTPS or the local backend.');
if(origin.username||origin.password||origin.search||origin.hash)throw Error('Use a public API origin without credentials.');
const limit=200;
const filename='src/catalog/titles.json';
const previous=JSON.parse(await readFile(filename,'utf8')) as {titles:CatalogTitle[]};
if(!Array.isArray(previous.titles))throw Error('Invalid existing catalogue.');
const movies=previous.titles.filter(t=>t.kind==='movie');
if(movies.length>limit)throw Error('Retain all published films; review capacity before expanding.');
const get=async(path:string)=>{
  const response=await fetch(base+path,{headers:{Accept:'application/json'},credentials:'omit',signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw Error(`Public catalogue request ${path}: ${response.status}`);
  return response.json() as Promise<unknown>;
};
// User curation supersedes the former full-feed guarantee. Refresh selected
// facts only: no discovery feeds or automatic replacement of the removed films.
const excludedIds=excludedMovies.map(t=>t.id);
const excluded=new Set(excludedIds);
const activePriority=priorityMovies.filter(t=>!excluded.has(t.id));
const required=activePriority.map(({id})=>({kind:'movie' as const,id}));
const titles=await expandMovies(previous.titles,[],limit,({id})=>get(`/movies/id/${id}?includeReviews=false&includeTmdbRating=false`),required,excludedIds);
// Verify editorial IDs against the returned names so a mistaken ID cannot
// silently count as coverage. The manifest is build tooling, not a ranking claim.
const nameKey=(value:string)=>value.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
for(const expected of activePriority){
  const actual=titles.find(t=>t.kind==='movie'&&t.id===expected.id);
  if(!actual||nameKey(actual.title)!==nameKey(expected.title))
    throw Error(`Priority movie mismatch: ${expected.title} (${expected.id}) returned ${actual?.title??'nothing'}; previous snapshot retained.`);
}
// Nothing changes on disk until every new movie has complete public metadata.
const coverage={mode:'curated',maximumMovies:limit,priorityIds:activePriority.map(t=>t.id),excludedIds};
await writeFile(filename+'.tmp',JSON.stringify({updatedAt:new Date().toISOString().slice(0,10),coverage,titles},null,2)+'\n');
await rename(filename+'.tmp',filename);
console.log(`Saved ${titles.filter(t=>t.kind==='movie').length} curated movies, including ${activePriority.length} active priority films; ${excludedIds.length} user exclusions retained, no discovery backfill, TV unchanged. Review and build before publishing.`);
