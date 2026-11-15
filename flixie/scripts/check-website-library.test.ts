import {test} from 'node:test';
import assert from 'node:assert/strict';
import {FlixieApi,ApiError,SessionChanged} from '../src/web/api';
import {showSeasons,episodeReleased,showEpisodeSpoilers} from '../src/web/showSeasons';
import {pickGroups,pickRequest,pickResults,type PickPreferences} from '../src/web/pickForUs';
const identity={uid:'alex-uid',token:async()=>'fixture-token'};
const response=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status});
const favourite=(id:number,kind='movie',rank=1)=>({id:`favourite-${id}`,userId:'alex',rank,[kind]:{id,title:`Title ${id}`,posterPath:'/poster.jpg'}});
const preferences:PickPreferences={viewer:{type:'solo'},mood:'any',maxMinutes:120,venue:'streaming',watching:'together',openToRent:false,request:'',allowRewatches:false,avoid:[]};
const seasonData={id:76331,seasons:[{id:10,seasonNumber:1,name:'Season 1',episodes:[{id:101,showId:76331,seasonNumber:1,episodeNumber:1,name:'Pilot',overview:'A spoiler',airDate:'2024-01-01',runtime:45,stillPath:'/still.jpg',userState:{watched:true},privateNote:'PRIVATE'}]}],privateNotes:'PRIVATE'};

test('guest episode details default visible, hiding is reversible and choices do not transfer to another account',()=>{
 assert.equal(showEpisodeSpoilers(null),true);
 assert.equal(showEpisodeSpoilers(null,{viewer:null,show:false}),false);
 assert.equal(showEpisodeSpoilers(null,{viewer:null,show:true}),true);
 assert.equal(showEpisodeSpoilers('alex'),false);
 assert.equal(showEpisodeSpoilers('alex',{viewer:null,show:true}),false);
 assert.equal(showEpisodeSpoilers('alex',{viewer:'alex',show:true}),true);
 assert.equal(showEpisodeSpoilers('alex',{viewer:'alex',show:false}),false);
 assert.equal(showEpisodeSpoilers('robin',{viewer:'alex',show:true}),false);
 assert.equal(showEpisodeSpoilers(null,{viewer:'alex',show:false}),true);
});

test('favourite add/remove uses native idempotent import routes and preserves other titles/ranks for films and TV',async()=>{
 for(const kind of ['movie','show'] as const){let state=[favourite(1,kind,1)],calls:{url:string;init?:RequestInit}[]=[];
 const api=new FlixieApi('https://example.invalid',()=>identity,async(url,init)=>{calls.push({url:String(url),init});if(init?.method==='POST')state.push(favourite(2,kind,2));if(init?.method==='DELETE')state=state.filter(v=>v.id!=='favourite-2');return response(state);});
 let saved=await api.setFavourite('alex-uid','alex',kind,2,true);assert.deepEqual(saved.map(v=>v.film.id),[1,2]);assert.equal(saved[0].rank,1);
 const add=calls.find(v=>v.init?.method==='POST')!;assert.equal(add.url,`https://example.invalid/users/alex/${kind==='movie'?'movies':'shows'}/favorites`);assert.deepEqual(JSON.parse(String(add.init?.body)),{[kind==='movie'?'movieIds':'showIds']:[2]});assert.equal(new Headers(add.init?.headers).get('Authorization'),'Bearer fixture-token');
 await api.setFavourite('alex-uid','alex',kind,2,true);assert.equal(calls.filter(v=>v.init?.method==='POST').length,1);
 saved=await api.setFavourite('alex-uid','alex',kind,2,false);assert.deepEqual(saved.map(v=>v.film.id),[1]);assert.equal(calls.find(v=>v.init?.method==='DELETE')?.url,`https://example.invalid/users/alex/${kind}/favorite/2`);
 await api.setFavourite('alex-uid','alex',kind,2,false);assert.equal(calls.filter(v=>v.init?.method==='DELETE').length,1);
 }
});
test('full favourite lists, account changes and bad acknowledgements cannot report a successful membership change',async()=>{
 let writes=0;const full=Array.from({length:10},(_,i)=>favourite(i+1));let current=identity;
 const api=new FlixieApi('https://example.invalid',()=>current,async(_url,init)=>{if(init?.method!=='GET')writes++;return response(full);});
 await assert.rejects(api.setFavourite('alex-uid','alex','movie',11,true),(e:unknown)=>e instanceof ApiError&&e.code==='FAVOURITE_LIMIT');assert.equal(writes,0);
 current={...identity,uid:'robin'};await assert.rejects(api.setFavourite('alex-uid','alex','movie',11,true),SessionChanged);assert.equal(writes,0);
 const malformed=new FlixieApi('https://example.invalid',()=>identity,async()=>response([]));await assert.rejects(malformed.setFavourite('alex-uid','alex','movie',11,true),/could not be confirmed/);
});
test('interrupted favourite writes are not automatically retried and an explicit retry preserves an already committed order',async()=>{
 let state=[favourite(1)],posts=0;const api=new FlixieApi('https://example.invalid',()=>identity,async(_u,init)=>{if(init?.method==='POST'){posts++;state.push(favourite(2,'movie',2));throw new Error('offline');}return response(state);});
 await assert.rejects(api.setFavourite('alex-uid','alex','movie',2,true),ApiError);assert.equal(posts,1);const saved=await api.setFavourite('alex-uid','alex','movie',2,true);assert.equal(posts,1);assert.deepEqual(saved.map(v=>v.film.id),[1,2]);
});
test('season projection keeps actual episode order/progress, drops unrelated data and rejects another show or duplicate episodes',()=>{
 const parsed=showSeasons(seasonData,76331);assert.equal(parsed[0].episodes[0].name,'Pilot');assert.equal(parsed[0].episodes[0].watched,true);assert.equal(parsed[0].episodes[0].still,'/still.jpg');assert(!JSON.stringify(parsed).includes('PRIVATE'));
 assert.throws(()=>showSeasons(seasonData,999));assert.throws(()=>showSeasons({...seasonData,seasons:[{...seasonData.seasons[0],episodes:[...seasonData.seasons[0].episodes,...seasonData.seasons[0].episodes]}]},76331));assert.deepEqual(showSeasons({id:76331,seasons:[]},76331),[]);
 assert(episodeReleased(parsed[0].episodes[0],new Date('2026-11-14')));assert(!episodeReleased({...parsed[0].episodes[0],date:'2030-01-01'},new Date('2026-11-14')));assert(!episodeReleased({...parsed[0].episodes[0],date:''}));
});
test('public seasons send no identity; private episode state and reversible undated progress stay bound to the opening account',async()=>{
 let current=identity;const calls:{url:string;init?:RequestInit}[]=[];const api=new FlixieApi('https://example.invalid',()=>current,async(url,init)=>{calls.push({url:String(url),init});return response(init?.method==='PATCH'?{progress:{userId:'alex',showId:76331,episodeId:101,watched:JSON.parse(String(init.body)).watched}}:seasonData);});
 await api.seasons(76331);assert.equal(new Headers(calls[0].init?.headers).has('Authorization'),false);assert(!calls[0].url.includes('userId'));
 await api.seasons(76331,{uid:'alex-uid',id:'alex'});assert(calls[1].url.includes('userId=alex'));assert.equal(new Headers(calls[1].init?.headers).get('Authorization'),'Bearer fixture-token');
 for(const watched of [false,true]){await api.setEpisodeProgress('alex-uid','alex',76331,101,watched);assert.deepEqual(JSON.parse(String(calls.at(-1)?.init?.body)),{watched,recordWatchDate:false});}
 current={...identity,uid:'robin'};await assert.rejects(api.setEpisodeProgress('alex-uid','alex',76331,101,true),SessionChanged);assert.equal(calls.length,4);
});
test('incorrect episode acknowledgements cannot report a confirmed progress update',async()=>{const api=new FlixieApi('https://example.invalid',()=>identity,async()=>response({progress:{userId:'robin',showId:76331,episodeId:101,watched:true}}));await assert.rejects(api.setEpisodeProgress('alex-uid','alex',76331,101,true),/could not be confirmed/);});
test('Pick for Us sends exactly one selected viewer scope and enforces supported viewing constraints',()=>{
 assert(!('friendId' in pickRequest(preferences)));const friend=pickRequest({...preferences,viewer:{type:'friend',id:'jamie'}}),group=pickRequest({...preferences,viewer:{type:'group',id:'film-friends'}});assert('friendId' in friend&&friend.friendId==='jamie');assert('groupId' in group&&group.groupId==='film-friends');
 for(const p of [{...preferences,maxMinutes:100},{...preferences,watching:'separately'},{...preferences,venue:'cinema',openToRent:true},{...preferences,request:'a'.repeat(301)},{...preferences,avoid:['invented']}])assert.throws(()=>pickRequest(p as PickPreferences));
});
test('picker groups keep only eligible accepted membership and each person’s own badges, without private fields',()=>{
 const member=(id:string,inviteStatus='ACCEPTED')=>({inviteStatus,user:{id,username:id,profileBadges:['OG_USER'],email:'PRIVATE'}});
 const groups=pickGroups([{id:'ours',name:'Film friends',password:'PRIVATE',members:[member('alex'),member('jamie'),member('pending','PENDING')]},{id:'theirs',members:[member('robin'),member('jamie')]}],'alex');
 assert.equal(groups.length,1);assert.deepEqual(groups[0].members.map(p=>p.id),['alex','jamie']);assert.deepEqual(groups[0].members[1].profileBadges,['OG_USER']);assert(!JSON.stringify(groups).includes('PRIVATE'));
});
test('picker transport is token-owned and returns sourced reasons and honest viewing checks',async()=>{
 let current=identity;let calls=0;const api=new FlixieApi('https://example.invalid',()=>current,async(_url,init)=>{calls++;assert.equal(JSON.parse(String(init?.body)).friendId,'jamie');assert.equal(new Headers(init?.headers).get('Authorization'),'Bearer fixture-token');return response({choices:[{id:348,title:'Alien',runtime:117,reasonDetails:[{text:'On both watchlists'}],availability:{viewers:[{check:'unavailable',region:'GB',offers:[{providerName:'Must not claim',type:'subscription'}]},{check:'checked',offers:[{providerName:'Apple TV',region:'GB',type:'rent'}]}]}}],search:{issues:['availability_check_failed']}});});
 const result=await api.pickForUs('alex-uid',{...preferences,viewer:{type:'friend',id:'jamie'}});assert.equal(result.choices[0].film.id,348);assert.deepEqual(result.choices[0].reasons,['On both watchlists']);assert(result.incomplete);assert(result.choices[0].offers.includes('Apple TV · GB · Rental fee applies'));assert(!JSON.stringify(result).includes('Must not claim'));
 current={...identity,uid:'robin'};await assert.rejects(api.pickForUs('alex-uid',preferences),SessionChanged);assert.equal(calls,1);assert.throws(()=>pickResults({choices:null}));
});
