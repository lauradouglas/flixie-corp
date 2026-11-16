import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPublicMovieReader, parseCatalogSnapshot, refreshPopularCatalog, type CatalogSnapshot } from './lib/weekly-catalog';
import { publicTitle } from './lib/title-catalog';

const row=(id:number)=>({id,title:`Film ${id}`,posterPath:'/poster.jpg',releaseDate:'2020-02-20',runtime:100,
  overview:'A complete public synopsis.',tagline:'A film.',genres:['Drama'],reviews:['PRIVATE'],userId:'PRIVATE'});
const title=(id:number,kind:'movie'|'show'='movie')=>publicTitle(row(id),{id,kind});
const snapshot=(movies=[1,2]):CatalogSnapshot=>({updatedAt:'2026-11-01',coverage:{mode:'curated',maximumMovies:200,priorityIds:[1],excludedIds:[9]},titles:[...movies.map(id=>title(id)),title(88,'show')]});
const feed=(...ids:number[])=>ids.map(id=>({id,title:`Film ${id}`,poster:'/poster.jpg'}));
const options=(loadMovie:typeof baseLoad,maximumMovies=200)=>({maximumMovies,priorityMovies:[{id:1,title:'Film 1'}],excludedIds:[9],today:'2026-11-16',loadMovie});
const baseLoad=async({id}:{id:number})=>row(id);

test('weekly refresh appends only new eligible popular movies, preserving published facts, TV and exclusions',async()=>{
  const before=snapshot(),unchanged=JSON.stringify(before),calls:number[]=[];
  const result=await refreshPopularCatalog(before,feed(2,3,9,4,3),options(async({id})=>{calls.push(id);return row(id);}));
  assert.deepEqual(result.snapshot.titles.filter(t=>t.kind==='movie').map(t=>t.id),[1,2,3,4]);
  assert.deepEqual(calls.sort(),[3,4]);assert.deepEqual(result.report.addedIds,[3,4]);assert.deepEqual(result.report.excludedFeedIds,[9]);
  assert.deepEqual(result.snapshot.titles.find(t=>t.kind==='show'),before.titles.find(t=>t.kind==='show'));
  assert.equal(JSON.stringify(before),unchanged);assert.equal(result.snapshot.updatedAt,'2026-11-16');
  assert(!JSON.stringify(result.snapshot).includes('PRIVATE'));
});
test('full capacity retains every existing film, skips additions and makes no detail requests',async()=>{
  let calls=0;
  const result=await refreshPopularCatalog(snapshot(),feed(3,9,4),options(async()=>{calls++;throw Error('No capacity');},2));
  assert.deepEqual(result.snapshot.titles.filter(t=>t.kind==='movie').map(t=>t.id),[1,2]);
  assert.deepEqual(result.report.capacitySkippedIds,[3,4]);assert.equal(calls,0);
});
test('one remaining slot respects source order without rotating existing pages',async()=>{
  const result=await refreshPopularCatalog(snapshot(),feed(9,4,3),options(baseLoad,3));
  assert.deepEqual(result.snapshot.titles.filter(t=>t.kind==='movie').map(t=>t.id),[1,2,4]);
  assert.deepEqual(result.report.capacitySkippedIds,[3]);
});
test('refresh is idempotent with an unchanged feed and keeps the previous publication date',async()=>{
  const first=await refreshPopularCatalog(snapshot(),feed(2,3),options(baseLoad));
  const again=await refreshPopularCatalog(first.snapshot,feed(3,2),{...options(async()=>{throw Error('No new movie');}),today:'2026-11-23'});
  assert.equal(again.changed,false);assert.deepEqual(again.snapshot,first.snapshot);
});
test('a newly excluded saved/priority/feed movie is removed and never requested again',async()=>{
  const result=await refreshPopularCatalog(snapshot([1,2,9]),feed(9,3),{...options(baseLoad),priorityMovies:[{id:1,title:'Film 1'},{id:9,title:'Film 9'}]});
  assert.deepEqual(result.snapshot.titles.filter(t=>t.kind==='movie').map(t=>t.id),[1,2,3]);
  assert(!result.snapshot.coverage.priorityIds.includes(9));
});
test('bad feeds, metadata failures and required-title mismatches cannot return a partial snapshot',async()=>{
  const before=snapshot(),saved=JSON.stringify(before);
  for(const invalid of [[],{},null,[{id:-1,title:'Broken'}]])await assert.rejects(refreshPopularCatalog(before,invalid,options(baseLoad)));
  await assert.rejects(refreshPopularCatalog(before,feed(3),options(async()=>{throw Error('API unavailable');})),/API unavailable/);
  await assert.rejects(refreshPopularCatalog(before,feed(3),options(async()=>({...row(3),overview:''}))),/incomplete/);
  await assert.rejects(refreshPopularCatalog(before,feed(2),{...options(baseLoad),priorityMovies:[{id:1,title:'Wrong title'}]}),/Required movie mismatch/);
  assert.equal(JSON.stringify(before),saved);
});
test('saved snapshot validation rejects duplicate or malformed input and drops nonpublic properties',()=>{
  const before=snapshot();assert.deepEqual(parseCatalogSnapshot(before),before);
  assert.throws(()=>parseCatalogSnapshot({...before,titles:[title(1),title(1)]}),/Duplicate/);
  assert.throws(()=>parseCatalogSnapshot({...before,coverage:{...before.coverage,excludedIds:['9']}}),/Invalid/);
  assert.throws(()=>parseCatalogSnapshot({...before,titles:[{...row(1),kind:'person'}]}),/Invalid/);
  const parsed=parseCatalogSnapshot({...before,titles:[{...title(1),privateNotes:'PRIVATE'}]});
  assert(!JSON.stringify(parsed).includes('PRIVATE'));
});
test('weekly transport uses only anonymous public movie reads, with no bearer or cookies',async()=>{
  const calls:{url:string;init?:RequestInit}[]=[];
  const read=createPublicMovieReader('https://example.invalid',async(url,init)=>{calls.push({url:String(url),init});return new Response('[]');});
  await read('/movies/popular?region=GB');await read('/movies/id/123?includeReviews=false&includeTmdbRating=false');
  for(const call of calls){assert.equal(call.init?.credentials,'omit');assert.deepEqual(call.init?.headers,{Accept:'application/json'});}
  await assert.rejects(read('/users/1/watchlist'),/Only public/);assert.equal(calls.length,2);
  for(const base of ['http://example.invalid','https://name:secret@example.invalid','https://example.invalid?token=x'])assert.throws(()=>createPublicMovieReader(base));
});
