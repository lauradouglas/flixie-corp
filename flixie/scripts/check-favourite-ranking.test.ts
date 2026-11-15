import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ApiError, FlixieApi, SessionChanged } from '../src/web/api';
import { moveFavourite, rankedFavourites, rankingChanged, sameFavouriteMembership } from '../src/web/favouriteRanking';
import type { MediaKind } from '../src/web/models';

const rows = (kind: MediaKind = 'movie') => [
  {id:'favourite-record-alien',userId:'alex',rank:1,[kind]:{id:348,title:'Alien',posterPath:'/alien.jpg'},privateNote:'PRIVATE'},
  {id:'favourite-record-interstellar',userId:'alex',rank:2,[kind]:{id:157336,title:'Interstellar',posterPath:'/space.jpg'}},
];
const response = (value: unknown, status = 200) => new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json'}});
const identity = {uid:'alex-uid',token:async()=>'fixture-token'};

test('rank projection preserves favourite-record IDs separately from catalogue IDs and excludes private/removed data',()=>{
  const source=rows();const parsed=rankedFavourites([source[1],{...source[0],removed:true},source[0]],'alex','movie');
  assert.deepEqual(parsed.map(p=>p.id),['favourite-record-alien','favourite-record-interstellar']);
  assert.equal(parsed[0].film.id,348);assert.equal(parsed[0].film.posterPath,'/alien.jpg');assert(!JSON.stringify(parsed).includes('PRIVATE'));
  assert.equal(rankedFavourites(rows('show'),'alex','show')[0].film.kind,'show');
  assert.deepEqual(rankedFavourites([],'alex','movie'),[]);
  for(const value of [{},[{...source[0],id:''}],[{...source[0],userId:'robin'}],[source[0],source[0]]])assert.throws(()=>rankedFavourites(value,'alex','movie'));
});
test('moving changes only order, keeps the source immutable and ignores invalid boundaries',()=>{
  const original=rankedFavourites(rows(),'alex','movie');const moved=moveFavourite(original,1,0);
  assert.equal(original[0].film.title,'Alien');assert.equal(moved[0].film.title,'Interstellar');
  assert(rankingChanged(original,moved));assert(sameFavouriteMembership(original,moved));assert(!rankingChanged(original,original));
  assert.equal(moveFavourite(original,0,-1),original);assert.equal(moveFavourite(original,1,2),original);
  assert.equal(moveFavourite(original,0,.5),original);assert(!sameFavouriteMembership(original,[original[0],original[0]]));
});
test('film and show ranking saves preflight the current list and send ordered favourite record IDs using native payloads',async()=>{
  for(const kind of ['movie','show'] as const){
    const calls:{url:string;init?:RequestInit}[]=[],source=rows(kind),draft=moveFavourite(rankedFavourites(source,'alex',kind),1,0);
    const api=new FlixieApi('https://example.invalid',()=>identity,async(url,init)=>{
      calls.push({url:String(url),init});
      return response(init?.method==='PUT'?[{...source[1],rank:1},{...source[0],rank:2}]:source);
    });
    const saved=await api.saveFavouriteRanking('alex-uid','alex',kind,draft);
    assert.equal(saved[0].film.title,'Interstellar');assert.equal(calls.length,2);
    assert.equal(calls[0].url,`https://example.invalid/users/alex/${kind}/favorites`);
    assert.equal(calls[1].url,`https://example.invalid/users/alex/${kind}/favorites/update-rankings`);
    assert.equal(calls[1].init?.method,'PUT');assert.equal(new Headers(calls[1].init?.headers).get('Authorization'),'Bearer fixture-token');
    assert.deepEqual(JSON.parse(String(calls[1].init?.body)),{[kind==='movie'?'movies':'shows']:[{id:'favourite-record-interstellar'},{id:'favourite-record-alien'}]});
  }
});
test('a changed membership or duplicate draft cannot submit a ranking write',async()=>{
  const draft=rankedFavourites(rows(),'alex','movie');let puts=0;
  const api=new FlixieApi('https://example.invalid',()=>identity,async(_url,init)=>{if(init?.method==='PUT')puts++;return response([rows()[0]]);});
  await assert.rejects(api.saveFavouriteRanking('alex-uid','alex','movie',draft),(e:unknown)=>e instanceof ApiError&&e.code==='FAVOURITES_CHANGED');
  await assert.rejects(api.saveFavouriteRanking('alex-uid','alex','movie',[draft[0],draft[0]]));assert.equal(puts,0);
});
test('old-account drafts and account switches during preflight cannot write to the new account',async()=>{
  const draft=rankedFavourites(rows(),'alex','movie');let current=identity,requests=0;
  const api=new FlixieApi('https://example.invalid',()=>current,async()=>{requests++;current={...identity,uid:'robin-uid'};return response(rows());});
  await assert.rejects(api.saveFavouriteRanking('alex-uid','alex','movie',draft),SessionChanged);assert.equal(requests,1);
  await assert.rejects(api.saveFavouriteRanking('alex-uid','alex','movie',draft),SessionChanged);assert.equal(requests,1);
  await assert.rejects(api.favouriteRanking('alex-uid','alex','show'),SessionChanged);assert.equal(requests,1);
});
test('interrupted writes are not retried automatically and the same draft can be explicitly saved again',async()=>{
  const source=rows(),draft=moveFavourite(rankedFavourites(source,'alex','movie'),1,0);let puts=0;
  const api=new FlixieApi('https://example.invalid',()=>identity,async(_url,init)=>{
    if(init?.method!=='PUT')return response(source);
    if(++puts===1)throw new Error('interrupted');
    return response([{...source[1],rank:1},{...source[0],rank:2}]);
  });
  await assert.rejects(api.saveFavouriteRanking('alex-uid','alex','movie',draft),ApiError);assert.equal(puts,1);assert.equal(draft[0].film.title,'Interstellar');
  await api.saveFavouriteRanking('alex-uid','alex','movie',draft);assert.equal(puts,2);assert.equal(draft[0].film.title,'Interstellar');
});
test('a malformed or mismatched save acknowledgement never reports confirmed ranking success',async()=>{
  const draft=moveFavourite(rankedFavourites(rows(),'alex','movie'),1,0);
  const api=new FlixieApi('https://example.invalid',()=>identity,async()=>response(rows()));
  await assert.rejects(api.saveFavouriteRanking('alex-uid','alex','movie',draft),/saved order could not be confirmed/);
  assert.equal(draft[0].id,'favourite-record-interstellar');
});
