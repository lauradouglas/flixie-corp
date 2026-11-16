import { test } from 'node:test';
import assert from 'node:assert/strict';
import { expandMovies, fetchTitles, publicTitle, titleCandidates, selectMovieReferences } from './lib/title-catalog';
import { assertHostingBudget, freeTierBudget } from './lib/hosting-budget.mjs';
import priorityMovies from './catalog-priority-movies.json';
import {catalogTitles} from '../src/catalog';
import catalogSnapshot from '../src/catalog/titles.json';
const row=(id:number)=>({id,title:`Film ${id}`,posterPath:'/poster.jpg',releaseDate:'2020-02-20',runtime:100,
  overview:'A complete public synopsis.',tagline:'A film.',genres:['Drama'],userId:'PRIVATE',reviews:['PRIVATE'],voteAverage:8});
const ref=(id:number)=>({kind:'movie' as const,id});
test('catalogue projection retains complete facts and excludes private data, ratings and availability',()=>{
  const projected=publicTitle(row(1),ref(1));
  assert.equal(projected.title,'Film 1');
  assert.deepEqual(Object.keys(projected).sort(),['id','kind','title','posterPath','releaseDate','runtime','overview','tagline','genres'].sort());
  assert(!JSON.stringify(projected).includes('PRIVATE'));
  for(const invalid of [{...row(1),id:2},{...row(1),overview:''},{...row(1),posterPath:'https://evil.invalid/x.jpg'},
    {...row(1),releaseDate:'Not a date'},{...row(1),genres:[]}])assert.throws(()=>publicTitle(invalid,ref(1)));
});
test('movie expansion preserves published films and unchanged TV without fetching any TV',async()=>{
  const movie=publicTitle(row(1),ref(1));
  const show=publicTitle(row(9),{kind:'show',id:9});
  const calls:number[]=[];
  const result=await expandMovies([movie,show],[[ref(2),ref(1)],[ref(3),ref(4)]],4,async r=>{
    assert.equal(r.kind,'movie');calls.push(r.id);return row(r.id);
  });
  assert.deepEqual(result.map(t=>t.id),[1,2,3,4,9]);
  assert.deepEqual(calls.sort(),[1,2,3,4]);assert.strictEqual(result[4],show);
  await assert.rejects(expandMovies([movie,show],[[{kind:'show',id:10}]],2,async()=>row(1)),/Movie-only/);
  assert.equal((await expandMovies([movie,show],[],2,async()=>row(1))).length,2,'Do not pad a small feed with unrelated titles');
  assert.deepEqual(titleCandidates([ref(1)],[[ref(2),ref(3)],[ref(2),ref(4)]]).map(t=>t.id),[1,2,3,4]);
});
test('major films cannot be crowded out by discovery feeds, and published URLs cannot be dropped to fit',async()=>{
  const selected=selectMovieReferences([ref(1)],[ref(99),ref(100)],[[ref(2),ref(3),ref(4)]],4);
  assert.deepEqual(selected.map(t=>t.id),[1,99,100,2]);
  assert.throws(()=>selectMovieReferences([ref(1)],[ref(99),ref(100)],[],2),/coverage needs 3/);
  assert.throws(()=>selectMovieReferences([ref(1)],[],[[{kind:'show',id:10}]],4),/cannot add TV/);
  const previous=[publicTitle(row(1),ref(1))];
  const result=await expandMovies(previous,[[ref(2),ref(3)]],3,async({id})=>row(id),[ref(99)]);
  assert.deepEqual(result.map(t=>t.id),[1,99,2]);
});
test('the published snapshot covers every editorial major movie with no duplicate priority IDs',()=>{
  assert.equal(new Set(priorityMovies.map(t=>t.id)).size,priorityMovies.length);
  for(const id of [27205,155,597,603,120,121,122,671,12445,11,19995,693134,862,808])
    assert(priorityMovies.some(t=>t.id===id),`Missing broad-film priority ${id}`);
  for(const expected of priorityMovies)
    assert(catalogTitles.some(t=>t.kind==='movie'&&t.id===expected.id),`Missing required film ${expected.title}`);
});
test('the snapshot contains every valid classic, highly-rated and regional popular movie from its refresh',()=>{
  assert.equal(catalogSnapshot.coverage.maximumMovies,200);
  assert(catalogTitles.filter(t=>t.kind==='movie').length<=200);
  assert.deepEqual(catalogSnapshot.coverage.guaranteedFeeds.map(feed=>feed.name),['classics','highlyRated','popular-GB']);
  for(const feed of catalogSnapshot.coverage.guaranteedFeeds){
    assert(feed.ids.length>0);assert.equal(new Set(feed.ids).size,feed.ids.length);
    for(const id of feed.ids)assert(catalogTitles.some(t=>t.kind==='movie'&&t.id===id),`${feed.name}: missing movie ${id}`);
  }
});
test('refresh bounds requests, retains ordering and fails rather than returning a partial catalogue',async()=>{
  let active=0,peak=0;
  const result=await fetchTitles([1,2,3,4,5,6].map(ref),async({id})=>{
    active++;peak=Math.max(peak,active);await new Promise(resolve=>setImmediate(resolve));active--;return row(id);
  });
  assert.equal(peak,3);assert.deepEqual(result.map(t=>t.id),[1,2,3,4,5,6]);
  let reads=0;
  assert.equal((await fetchTitles([ref(1)],async()=>++reads===1?{...row(1),genres:[]}:row(1)))[0].id,1);
  assert.equal(reads,2);
  await assert.rejects(fetchTitles([ref(1)],async()=>({...row(1),overview:''})),/incomplete/);
});
test('free-tier guards accept bounded output and reject routing, storage and file overflows',()=>{
  assert.doesNotThrow(()=>assertHostingBudget(freeTierBudget));
  for(const key of Object.keys(freeTierBudget))assert.throws(()=>assertHostingBudget({...freeTierBudget,[key]:freeTierBudget[key]+1}),/Azure Free budget exceeded/);
});
