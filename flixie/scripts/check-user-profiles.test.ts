import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FlixieApi, ApiError, SessionChanged } from '../src/web/api';
import { userProfile, profilePosts, profileFriends } from '../src/web/userProfiles';
import { avatarSources } from '../src/web/avatarImages';
import { avatarBorder } from '../src/web/models';
import { parseRoute, profilePath, safeNext } from '../src/web/routing';
import { pageFromPath } from '../src/site';
import { renderHead } from '../src/seo';
const fixture={id:'jamie',username:'Jamie',firstName:'Jamie',relationship:'friend',bio:'Movie nights.',avatar:{id:1,storagePath:'avatars/dinosaur.png',iconStoragePath:'avatar-icons/dinosaur.webp'},profileBadges:['OG_USER','FRAME:OG_USER'],sharing:false,detailsVisible:true,activityVisible:true,stats:{films:4,shows:2,watchlist:6,ratings:3,reviews:1},favouriteMovies:[{id:348,title:'Alien',posterPath:'/alien.jpg'}],favouriteShows:[{id:15621,title:'The Newsroom'}],favouritePeople:[],genres:[],email:'PRIVATE',externalId:'PRIVATE',notes:'PRIVATE'};
const response=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json'}});
test('member profile routes stay inside the signed-in noindex browser surface',()=>{
  assert.deepEqual(parseRoute('/app/profile'),{page:'profile',query:''});
  assert.deepEqual(parseRoute(profilePath('jamie')),{page:'user-profile',id:'jamie'});
  for(const path of ['/app/profiles/../elsewhere','/app/profiles/a/b','/app/profiles/%2Fprivate'])assert.notEqual(parseRoute(path).page,'user-profile');
  assert.equal(safeNext('/app/profiles/jamie'),'/app/profiles/jamie');
  assert.match(renderHead(pageFromPath('/app/profiles/jamie')),/noindex/);
});
test('friend profiles preserve avatar and chosen border while excluding private fields',()=>{
  const parsed=userProfile(fixture,'jamie');assert.equal(parsed.bio,'Movie nights.');assert.equal(parsed.stats?.films,4);assert.equal(parsed.shows[0].kind,'show');
  assert.equal(parsed.avatar.iconStoragePath,'avatar-icons/dinosaur.webp');assert.equal(avatarBorder(parsed.profileBadges),'OG_USER');assert(!JSON.stringify(parsed).includes('PRIVATE'));
  assert.throws(()=>userProfile(fixture,'robin'));assert.throws(()=>userProfile(null));
});
test('non-friend projections do not render unconsented bio, first name, favourites or private counts',()=>{
  const parsed=userProfile({...fixture,relationship:'public',detailsVisible:false},'jamie');
  assert.equal(parsed.bio,'');assert.equal(parsed.firstName,'');assert.equal(parsed.stats,null);assert.equal(parsed.activityVisible,false);assert.deepEqual(parsed.movies,[]);
});
test('profile reviews keep spoiler title/body behind explicit disclosure; malformed pages fail',()=>{
  const parsed=profilePosts({items:[{id:'review',type:'movie_review',film:{id:348,title:'Alien',kind:'movie'},title:'Spoiler title',body:'Spoiler body',containsSpoilers:true,notes:'PRIVATE'}],nextCursor:'next'});
  assert.equal(parsed.items[0].containsSpoilers,true);assert.equal(parsed.nextCursor,'next');assert(!JSON.stringify(parsed).includes('PRIVATE'));
  assert.throws(()=>profilePosts({}));assert.throws(()=>profilePosts({items:[{id:'bad',film:{}}]}));assert.equal(profilePosts({items:[]}).nextCursor,null);
});
test('friends are deduplicated and avatars prefer the compact icon, falling back to the original source',()=>{
  assert.equal(profileFriends({items:[fixture,fixture]}).length,1);assert.throws(()=>profileFriends({}));
  assert.deepEqual(avatarSources(fixture.avatar),['avatar-icons/dinosaur.webp','avatars/dinosaur.png']);
  assert.deepEqual(avatarSources(fixture.avatar,true),['avatars/dinosaur.png']);
});
test('profile and directory reads use the token, with encoded pagination and abort signals',async()=>{
  const calls:{url:string;init?:RequestInit}[]=[],controller=new AbortController();
  const api=new FlixieApi('http://127.0.0.1:3000',()=>({uid:'alex',token:async()=>'fixture-token'}),async(url,init)=>{calls.push({url:String(url),init});return response(String(url).includes('/friends')?{items:[fixture]}:String(url).includes('/reviews')?{items:[],nextCursor:null}:fixture);});
  await api.userProfile('jamie',controller.signal);await api.profileFriends(controller.signal);await api.profileSection('jamie','reviews','date|movie_review|id',controller.signal);
  assert.deepEqual(calls.map(c=>c.url),['http://127.0.0.1:3000/profiles/jamie','http://127.0.0.1:3000/profiles/me/friends','http://127.0.0.1:3000/profiles/jamie/reviews?cursor=date%7Cmovie_review%7Cid']);
  for(const call of calls){assert.equal((call.init?.headers as Record<string,string>).Authorization,'Bearer fixture-token');assert.equal(call.init?.signal,controller.signal);}
  const guest=new FlixieApi('http://127.0.0.1:3000',()=>null,async()=>{throw new Error('Must not fetch');});await assert.rejects(guest.userProfile('jamie'),ApiError);
});
test('avatar, border and text edits target only existing owner endpoints with narrow payloads',async()=>{
  const calls:{url:string;init?:RequestInit}[]=[];
  const api=new FlixieApi('http://127.0.0.1:3000',()=>({uid:'alex',token:async()=>'fixture'}),async(url,init)=>{calls.push({url:String(url),init});return response({});});
  await api.chooseAvatar('alex',2);await api.chooseAvatar('alex',null);await api.chooseBorder('alex','OG_USER');await api.editProfile('alex','alex','bio','Films with friends.');
  assert.deepEqual(calls.map(c=>[c.url.replace(api.baseUrl,''),c.init?.method,c.init?.body]),[
    ['/users/me/avatar','PATCH','{"avatarId":2}'],['/users/me/avatar','DELETE',undefined],['/users/me/avatar-border','PATCH','{"border":"OG_USER"}'],['/users/update/field/alex','PUT','{"bio":"Films with friends."}']]);
});
test('a draft opened by another account cannot change the new account’s avatar, border or profile',async()=>{
  const api=new FlixieApi('http://127.0.0.1:3000',()=>({uid:'robin',token:async()=>'new-account'}),async()=>{throw new Error('No request may be sent for the old draft');});
  await assert.rejects(api.chooseAvatar('alex',2),SessionChanged);
  await assert.rejects(api.chooseBorder('alex','NONE'),SessionChanged);
  await assert.rejects(api.editProfile('alex','old-owner','bio','Old draft'),SessionChanged);
});
test('late profile results are discarded after an account switch and forbidden profiles remain errors',async()=>{
  let current={uid:'alex',token:async()=>'fixture'};
  const api=new FlixieApi('http://127.0.0.1:3000',()=>current,async()=>{current={uid:'robin',token:async()=>'other'};return response(fixture);});
  await assert.rejects(api.userProfile('jamie'),SessionChanged);
  const unavailable=new FlixieApi('http://127.0.0.1:3000',()=>current,async()=>response({error:'This profile is unavailable.'},404));
  await assert.rejects(unavailable.userProfile('jamie'),(e:unknown)=>e instanceof ApiError&&e.status===404);
});
