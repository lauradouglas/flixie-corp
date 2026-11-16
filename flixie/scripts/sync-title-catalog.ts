// Deliberate public-only movie refresh. Existing TV pages remain unchanged.
import { readFile, rename, writeFile } from 'node:fs/promises';
import { discoveryFilms } from '../src/web/publicDiscovery';
import { expandMovies, type TitleReference } from './lib/title-catalog';
import type { CatalogTitle } from '../src/catalog';
import priorityMovies from './catalog-priority-movies.json';
import { object } from '../src/web/models';

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
// Coverage policy: retain published URLs, guarantee the editorial major-film
// list, then use the app's broad classics/highly-rated and regional discovery.
// Related-to-six-films recommendations no longer select SEO pages.
const suggestions=object(await get('/movies/signup-suggestions'));
const feeds:TitleReference[][]=['classics','highlyRated'].map(name=>{
  const titles=discoveryFilms(suggestions[name],'movie',100);
  if(!titles.length)throw Error(`Empty public ${name} feed; previous snapshot retained.`);
  return titles.map(({id})=>({kind:'movie',id}));
});
const sources=['/movies/popular?region=GB','/movies/top_rated?region=GB',
  '/movies/now_playing?region=GB','/movies/upcoming?region=GB'];
for(const path of sources){
  const feed=discoveryFilms(await get(path),'movie',100);
  if(!feed.length)throw Error(`Empty public feed ${path}; previous snapshot retained.`);
  feeds.push(feed.map(({id})=>({kind:'movie',id})));
}
// The full valid classics, highly-rated and current GB-popular responses are
// protected too. Optional cinema/upcoming rows cannot crowd them out.
const guaranteedFeeds=[
  {name:'classics',ids:feeds[0].map(t=>t.id)},
  {name:'highlyRated',ids:feeds[1].map(t=>t.id)},
  {name:'popular-GB',ids:feeds[2].map(t=>t.id)},
];
const required=[...priorityMovies.map(({id})=>({kind:'movie' as const,id})),...feeds.slice(0,3).flat()];
const titles=await expandMovies(previous.titles,feeds,limit,({id})=>get(`/movies/id/${id}?includeReviews=false&includeTmdbRating=false`),required);
// Verify editorial IDs against the returned names so a mistaken ID cannot
// silently count as coverage. The manifest is build tooling, not a ranking claim.
const nameKey=(value:string)=>value.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
for(const expected of priorityMovies){
  const actual=titles.find(t=>t.kind==='movie'&&t.id===expected.id);
  if(!actual||nameKey(actual.title)!==nameKey(expected.title))
    throw Error(`Priority movie mismatch: ${expected.title} (${expected.id}) returned ${actual?.title??'nothing'}; previous snapshot retained.`);
}
// Nothing changes on disk until every new movie has complete public metadata.
const coverage={maximumMovies:limit,priorityIds:priorityMovies.map(t=>t.id),guaranteedFeeds};
await writeFile(filename+'.tmp',JSON.stringify({updatedAt:new Date().toISOString().slice(0,10),coverage,titles},null,2)+'\n');
await rename(filename+'.tmp',filename);
console.log(`Saved ${titles.filter(t=>t.kind==='movie').length} public movies, including all ${priorityMovies.length} editorial priority films and ${guaranteedFeeds.map(f=>f.ids.length+' '+f.name).join(', ')}; existing TV pages unchanged. Review and build before publishing.`);
