import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FlixieApi, SessionChanged } from '../src/web/api';
import { peopleSearch, friendRequests, connectionState, inboxPage } from '../src/web/social';
import { pickRequest, type PickPreferences } from '../src/web/pickForUs';
import { emptyDeck, fillDeck, passPick, undoPick } from '../src/web/pickDeck';
import { film, type Pick } from '../src/web/models';
import { parseRoute } from '../src/web/routing';
const identity={uid:'alex-uid',token:async()=>'fixture-token'};
const person=(id:string)=>({id,username:`dev_${id}`,firstName:'PRIVATE',email:'PRIVATE',avatar:{id:1,iconStoragePath:'avatar-icons/dinosaur.webp'},profileBadges:['OG_USER','FRAME:OG_USER']});
const request=(status='PENDING',from='maya',to='alex')=>({id:'request',type:'FRIEND_REQUEST',status,requester:person(from),recipient:person(to),requesterId:from,recipientId:to,message:'PRIVATE'});
const notice=(extra:object={})=>({id:'notification',userId:'alex',type:'FRIEND_REQUEST',read:false,closed:false,link:{request:request()},...extra});
const preferences:PickPreferences={viewer:{type:'solo'},mood:'any',maxMinutes:null,venue:'streaming',watching:'together',openToRent:false,request:'',allowRewatches:false,avoid:[]};
const response=(data:unknown)=>Response.json(data);
test('picker native filters preserve any length, genres, original languages and 60 exclusions',()=>{
 const result=pickRequest({...preferences,genreIds:[28,35,28],genreMatch:'all',originalLanguages:['en','fr','en'],excludeMovieIds:[348,348]});
 assert.equal(result.maxMinutes,null);assert.deepEqual(result.genreIds,[28,35]);assert.equal(result.genreMatch,'all');assert.deepEqual(result.originalLanguages,['en','fr']);assert.deepEqual(result.excludeMovieIds,[348]);assert.equal(result.includeUnknownContent,false);
 for(const invalid of [{genreIds:[28,35,18,27]},{genreIds:[999]},{originalLanguages:['english']},{excludeMovieIds:Array.from({length:61},(_,i)=>i+1)},{excludeMovieIds:[-1]}])assert.throws(()=>pickRequest({...preferences,...invalid}));
});
test('single pick deck passes, undoes and refills without repeats or losing a failed-refill result',()=>{
 const pick=(id:number):Pick=>({film:film({id,title:`Film ${id}`}),reasons:[],offers:[]});
 const first=fillDeck(emptyDeck(),[pick(348),pick(348),pick(2),pick(3)]);assert.equal(first.current?.film.id,348);assert.deepEqual(first.queue.map(p=>p.film.id),[2,3]);
 const passed=passPick(first);assert.equal(passed.current?.film.id,2);assert.equal(undoPick(passed).current?.film.id,348);assert.deepEqual(undoPick(passed).shown,[348,2,3]);
 assert.equal(fillDeck(passed,[],true),passed);assert.equal(fillDeck(passed,[pick(348)],true),passed);
 const next=fillDeck(passed,[pick(3),pick(4),pick(5)],true);assert.equal(next.current?.film.id,4);assert.equal(undoPick(next).current?.film.id,2);
 const capped=fillDeck({...first,shown:Array.from({length:59},(_,i)=>i+1)},[pick(100),pick(101)],true);assert.equal(capped.shown.length,60);
});
test('friend projections retain own borders, strip private facts and reject unrelated requests',()=>{
 const people=peopleSearch([person('alex'),person('maya'),person('maya')],'alex');assert.equal(people.length,1);assert.equal(people[0].firstName,'');assert.deepEqual(people[0].profileBadges,['OG_USER','FRAME:OG_USER']);assert(!JSON.stringify(people).includes('PRIVATE'));
 const requests=friendRequests([request()],'alex');assert.equal(connectionState('maya','alex',[],requests),'incoming');assert.equal(connectionState('maya','alex',[],friendRequests([request('PENDING','alex','maya')],'alex')),'sent');assert.equal(connectionState('maya','alex',people,requests),'friends');assert(!JSON.stringify(requests).includes('PRIVATE'));
 assert.throws(()=>friendRequests([request('PENDING','other','maya')],'alex'));assert.throws(()=>friendRequests([request('UNKNOWN')],'alex'));
});
test('request sending uses native contract and an explicit retry confirms a committed request without sending twice',async()=>{
 let rows:unknown[]=[],writes=0;
 const api=new FlixieApi('https://example.invalid',()=>identity,async(url,init)=>{
  if(String(url).endsWith('/profiles/me/friends'))return response({items:[]});
  if(String(url).endsWith('/profiles/me/friend-requests'))return response(rows);
  assert.equal(init?.method,'POST');assert.deepEqual(JSON.parse(String(init?.body)),{requesterId:'alex',recipientId:'maya',responderUsername:'dev_maya',type:'FRIEND_REQUEST',message:''});assert.equal(new Headers(init?.headers).get('Authorization'),'Bearer fixture-token');writes++;rows=[request('PENDING','alex','maya')];throw Error('connection interrupted');
 });
 await assert.rejects(api.sendFriendRequest(identity.uid,'alex',{id:'maya',username:'dev_maya'}));assert.equal(writes,1);
 await api.sendFriendRequest(identity.uid,'alex',{id:'maya',username:'dev_maya'});assert.equal(writes,1);
});
test('only an incoming pending request can be answered; actual status must be confirmed',async()=>{
 let row=request(),writes=0;
 const api=new FlixieApi('https://example.invalid',()=>identity,async(url,init)=>{if(String(url).endsWith('/profiles/me/friend-requests'))return response([row]);writes++;assert.deepEqual(JSON.parse(String(init?.body)),{id:'request',status:'ACCEPTED',response:''});row=request('ACCEPTED');return response({});});
 await api.replyToFriend(identity.uid,'alex','request','ACCEPTED');await api.replyToFriend(identity.uid,'alex','request','ACCEPTED');assert.equal(writes,1);
 row=request('PENDING','alex','maya');await assert.rejects(api.replyToFriend(identity.uid,'alex','request','DECLINED'),/incoming/);assert.equal(writes,1);
});
test('outgoing cancellation and removal confirm the resulting relationship',async()=>{
 let rows:unknown[]=[request('PENDING','alex','maya')],friends=[person('maya')],deletes=0;
 const api=new FlixieApi('https://example.invalid',()=>identity,async(url,init)=>{if(init?.method==='DELETE'){deletes++;if(String(url).endsWith('/requests')){assert.deepEqual(JSON.parse(String(init.body)),{id:'request',userId:'alex'});rows=[];}else{assert(String(url).endsWith('/friends/alex/friend/maya'));friends=[];}return response({});}return response(String(url).endsWith('/profiles/me/friends')?{items:friends}:rows);});
 await api.cancelFriendRequest(identity.uid,'alex','request');await api.cancelFriendRequest(identity.uid,'alex','request');await api.removeFriend(identity.uid,'alex','maya');await api.removeFriend(identity.uid,'alex','maya');assert.equal(deletes,2);
 rows=[request()];await assert.rejects(api.cancelFriendRequest(identity.uid,'alex','request'),/outgoing/);
});
test('inbox rejects another owner, drops closed/private payloads and ignores untrusted destinations',()=>{
 const page=inboxPage({items:[notice({data:{route:'https://evil.invalid',secret:'PRIVATE'}}),notice({id:'closed',closed:true})],unreadCount:1,nextCursor:'opaque+/='},'alex');assert.equal(page.items.length,1);assert.equal(page.nextCursor,'opaque+/=');assert.equal(page.items[0].sender?.firstName,'');assert(!JSON.stringify(page).includes('PRIVATE'));assert.equal(page.items[0].destination.href,'/app/friends');
 assert.throws(()=>inboxPage({items:[notice({userId:'other'})],unreadCount:1},'alex'));
 const plan=inboxPage({items:[notice({data:{simplePlanId:'plan-123'}})],unreadCount:1},'alex').items[0];assert.equal(plan.destination.href,'/app/plans?plan=plan-123');assert.deepEqual(parseRoute('/app/plans','?plan=plan-123'),{page:'plans',query:'',planId:'plan-123'});assert(!('planId'in parseRoute('/app/plans','?plan=//evil')));
 const native=inboxPage({items:[notice({type:'CHAT',data:{route:'https://evil.invalid'},link:null})],unreadCount:1},'alex').items[0];assert.equal(native.destination.native,true);assert.equal(native.destination.href,'/download');
});
test('inbox transport encodes cursor and read changes send only owned mutable fields',async()=>{
 const calls:any[]=[];const api=new FlixieApi('https://example.invalid',()=>identity,async(url,init)=>{calls.push({url:String(url),init});return response(init?.method==='POST'?String(url).endsWith('read-all')?{success:true}:{id:'notification',read:true}:{items:[notice()],unreadCount:1,nextCursor:null});});
 await api.inbox(identity.uid,'alex','opaque+/=');assert(calls[0].url.endsWith('?page=true&cursor=opaque%2B%2F%3D'));
 await api.setNotificationRead(identity.uid,'notification',true);assert.deepEqual(JSON.parse(calls[1].init.body),{id:'notification',read:true});await api.readAllNotifications(identity.uid);assert.deepEqual(JSON.parse(calls[2].init.body),{});
 await assert.rejects(api.inbox('other','alex'),SessionChanged);assert.equal(calls.length,3);
});
test('streaming service saves deduplicate ids and verify saved membership before continuing',async()=>{
 let saved:number[]=[8],writes=0;const api=new FlixieApi('https://example.invalid',()=>identity,async(_url,init)=>{if(init?.method==='PUT'){writes++;saved=JSON.parse(String(init.body)).watchProviderIds;return response({});}return response({watchProviders:saved.map(id=>({id,providerName:`Provider ${id}`}))});});
 assert.deepEqual((await api.saveProviders(identity.uid,'alex',[8,8,337])).map(p=>p.id),[8,337]);assert.equal(writes,1);await assert.rejects(api.saveProviders('other','alex',[8]),SessionChanged);assert.equal(writes,1);
});

test('service choices consume the native named watchProviders collection',async()=>{
 const api=new FlixieApi('https://example.invalid',()=>identity,async()=>Response.json({watchProviders:[{id:8,providerName:'Netflix'}]}));
 assert.deepEqual(await api.providerChoices(),[{id:8,name:'Netflix'}]);
});
