import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ApiError, FlixieApi, SessionChanged } from '../src/web/api';
import { film, plan, type Person } from '../src/web/models';
import { planStatus, planPlace } from '../src/web/watchPlanPresentation';
import { createPlanInput, createPlanSchedule, pickerPlanContext, WatchPlanSubmission } from '../src/web/watchPlanCreation';
const alex:Person={id:'alex',username:'Alex',firstName:'',avatar:{},profileBadges:['FRAME:FOUNDING_FILM_FRIEND']};
const jamie:Person={...alex,id:'jamie',username:'Jamie',profileBadges:['FRAME:OG_USER']};
const robin:Person={...alex,id:'robin',username:'Robin'};
const id='7ea11114-2026-4000-a000-000000000099';
const draft={id,ownerId:'alex',film:film({id:348,title:'Alien'}),audience:'friends' as const,friendIds:['jamie'],groupId:'',friends:[jamie,robin],groups:[{id:'group',name:'Film friends',members:[alex,jamie,robin]}],place:'home' as const,hostId:'alex',venue:'',day:'2026-11-15',time:'',};
const now=new Date('2026-11-14T12:00:00Z');
const input=createPlanInput(draft,now);
const receipt={id,ownerId:'alex',groupId:null,selectedMovieId:348,films:[{id:348,title:'Alien'}],people:[{user:alex,response:'joined'},{user:jamie,response:'pending'}],where:input.where,schedule:input.schedule,confirmed:false,proposal:{id:'proposal'},status:'active'};

test('picker film, friend/group and venue carry into an invitation without auto-accepting',()=>{
  const common={mood:'any',maxMinutes:120,venue:'streaming',watching:'separately',openToRent:false,request:'',allowRewatches:false,avoid:[]} as const;
  assert.deepEqual(pickerPlanContext({...common,avoid:[],viewer:{type:'friend',id:'jamie'}}),{viewer:{type:'friend',id:'jamie'},place:'separately'});
  assert.deepEqual(pickerPlanContext({...common,avoid:[],venue:'cinema',watching:'together',viewer:{type:'group',id:'group'}}),{viewer:{type:'group',id:'group'},place:'cinema'});
  assert.equal(input.arranged,false);assert.deepEqual(input.friendIds,['jamie']);assert.deepEqual(input.movies,[348]);assert.equal(input.groupId,null);
  const group=createPlanInput({...draft,audience:'group',groupId:'group',hostId:'robin'},now);assert.deepEqual(group.friendIds,[]);assert.equal(group.groupId,'group');assert.equal(group.where.hostId,'robin');
  assert.throws(()=>createPlanInput({...draft,friendIds:[]},now),/current friends/);
  assert.throws(()=>createPlanInput({...draft,friendIds:['stranger']},now),/current friends/);
  assert.throws(()=>createPlanInput({...draft,audience:'group',groupId:'missing'},now),/available group/);
  assert.throws(()=>createPlanInput({...draft,hostId:'stranger'},now),/host/);
  const solo=createPlanInput({...draft,audience:'solo',hostId:'alex'},now);assert.deepEqual(solo.friendIds,[]);assert.equal(solo.groupId,null);
  assert.throws(()=>createPlanInput({...draft,film:{...draft.film,kind:'show'}},now),/film/);
});
test('optional schedule preserves calendar day, local time and rejects past/invalid dates',()=>{
  assert.equal(createPlanSchedule('','',now),null);
  assert.deepEqual(createPlanSchedule('2026-11-15','',now),{at:'2026-11-15T12:00:00.000Z',dateOnly:true});
  assert.equal(createPlanSchedule('2026-11-15','19:30',now)?.at,new Date(2026,10,15,19,30).toISOString());
  for(const [day,time] of [['','12:30'],['2026-11-13',''],['2026-02-31',''],['2026-11-15','26:00']])assert.throws(()=>createPlanSchedule(day,time,now));
  assert.throws(()=>createPlanSchedule('2026-11-14','00:00',new Date(2026,10,14,12)),/future/);
});
test('creation uses token-owned API, projects real pending response and member border',async()=>{
  let sent:any;const api=new FlixieApi('https://example.invalid',()=>({uid:'firebase-alex',token:async()=>'fixture-token'}),async(url,options)=>{sent={url:String(url),body:JSON.parse(String(options?.body)),method:options?.method,auth:new Headers(options?.headers).get('Authorization')};return Response.json({...receipt,ownerEmail:'PRIVATE'});});
  const result=await api.createWatchPlan('firebase-alex','alex',input);
  assert.deepEqual(sent,{url:'https://example.invalid/watch-plans',body:input,method:'POST',auth:'Bearer fixture-token'});
  assert.equal(planStatus(result).label,'Awaiting replies');assert.equal(planPlace(result),'At Alex’s place');
  assert.equal(result.people[1].response,'pending');assert.deepEqual(result.people[1].profileBadges,['FRAME:OG_USER']);assert(!JSON.stringify(result).includes('PRIVATE'));
});
test('malformed/wrong-actor/film/audience acknowledgements do not claim success',async()=>{
  for(const body of [{},{...receipt,id:'other'},{...receipt,ownerId:'other'},{...receipt,selectedMovieId:99},{...receipt,people:[{user:alex,response:'joined'}]},{...receipt,groupId:'other'}]){
    const api=new FlixieApi('https://example.invalid',()=>({uid:'firebase-alex',token:async()=>'token'}),async()=>Response.json(body));
    await assert.rejects(api.createWatchPlan('firebase-alex','alex',input),/could not be confirmed/);
  }
});
test('identity change before transport or after save drops the result',async()=>{
  let uid='firebase-alex',calls=0;
  const api=new FlixieApi('https://example.invalid',()=>({uid,token:async()=>{uid='other';return 'token';}}),async()=>{calls++;return Response.json(receipt);});
  await assert.rejects(api.createWatchPlan('firebase-alex','alex',input),SessionChanged);assert.equal(calls,0);
  uid='firebase-alex';const second=new FlixieApi('https://example.invalid',()=>({uid,token:async()=>'token'}),async()=>{uid='other';return Response.json(receipt);});
  await assert.rejects(second.createWatchPlan('firebase-alex','alex',input),SessionChanged);
});
test('double-submit shares one write; uncertain retries keep the same id, film and invitations',async()=>{
  const attempt=new WatchPlanSubmission();let requests:any[]=[];let reject!:(reason:unknown)=>void;
  const send=(body:unknown)=>{requests.push(body);return new Promise<ReturnType<typeof plan>>((_,fail)=>{reject=fail;});};
  const first=attempt.save(()=>input,send),duplicate=attempt.save(()=>{throw Error('must not rebuild');},send);assert.equal(first,duplicate);
  await Promise.resolve();reject(new ApiError('Connection lost'));await assert.rejects(first);assert.deepEqual(attempt.snapshot,input);assert.equal(requests.length,1);
  const saved=await attempt.save(()=>{throw Error('must not rebuild');},async body=>{requests.push(body);return plan(receipt);});
  assert.equal(saved.id,id);assert.deepEqual(requests,[input,input]);
  await attempt.save(()=>input,async()=>{throw Error('must not resubmit saved plan');});
});
test('a definitive rejected audience allows correction without auto-retrying the write',async()=>{
  const attempt=new WatchPlanSubmission();let calls=0;
  await assert.rejects(attempt.save(()=>input,async()=>{calls++;throw new ApiError('Choose current friends',403);}));assert.equal(attempt.snapshot,null);assert.equal(calls,1);
  const corrected={...input,friendIds:['robin']};
  await attempt.save(()=>corrected,async body=>{assert.deepEqual(body.friendIds,['robin']);calls++;return plan(receipt);});assert.equal(calls,2);
});

test('a later rejection cannot unlock an earlier uncertain invitation',async()=>{
  const attempt=new WatchPlanSubmission();
  await assert.rejects(attempt.save(()=>input,async()=>{throw new ApiError('Connection lost');}));
  await assert.rejects(attempt.save(()=>{throw Error('must not rebuild');},async()=>{throw new ApiError('The proposed time has passed',400);}));
  assert.deepEqual(attempt.snapshot,input);
});
