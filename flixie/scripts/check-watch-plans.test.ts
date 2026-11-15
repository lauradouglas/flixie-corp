import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FlixieApi } from '../src/web/api';
import { plan } from '../src/web/models';
import { participantReply, planFilm, planPlace, planSchedule, planStatus, planTitle } from '../src/web/watchPlanPresentation';

const fixture = { id:'plan-alien', films:[{id:348,title:'Alien',posterPath:'/alien.jpg'}], people:[
  {id:'alex',response:'joined',user:{id:'alex',username:'Alex',profileBadges:['FOUNDING_FILM_FRIEND','FRAME:FOUNDING_FILM_FRIEND'],avatar:{iconStoragePath:'avatar-icons/astronaut.webp'}}},
  {id:'jamie',response:'pending',user:{id:'jamie',username:'Jamie',profileBadges:['OG_USER','FRAME:OG_USER']}}],
  schedule:{at:'2026-11-15T19:30:00Z',dateOnly:false},where:{kind:'home',venue:'Jamie’s place'},selectedMovieId:348,confirmed:true,status:'active',proposal:null,notes:'PRIVATE',ownerEmail:'PRIVATE' };

test('Watch Plans retain real arrangement, poster, participant responses and each member border',()=>{
  const value=plan(fixture);
  assert.equal(planTitle(value),'Alien');assert.equal(planFilm(value)?.posterPath,'/alien.jpg');
  assert.deepEqual(planStatus(value),{label:'Confirmed',tone:'confirmed'});assert.equal(planPlace(value),'Jamie’s place');
  assert.equal(value.people[0].avatar.iconStoragePath,'avatar-icons/astronaut.webp');assert.deepEqual(value.people[1].profileBadges,['OG_USER','FRAME:OG_USER']);
  assert.equal(participantReply(value.people[1].response),'Invited');assert.equal(participantReply(value.people[0].response),'Joining');
  assert(!JSON.stringify(value).includes('PRIVATE'));
});
test('date-only plans preserve their UTC calendar day and never invent a clock time',()=>{
  const day=plan({...fixture,schedule:{at:'2026-11-15T12:00:00Z',dateOnly:true}});
  for(const zone of ['Pacific/Honolulu','Pacific/Kiritimati']){
    const when=planSchedule(day,zone);assert.equal(when.date,'Sunday, 15 Nov 2026');assert.equal(when.time,'Time to be decided');assert.equal(when.dateTime,'2026-11-15');
  }
  assert.equal(planSchedule(plan(fixture),'Europe/London').time,'19:30');
  assert.equal(planSchedule(plan({...fixture,schedule:{at:'invalid'}})).date,'Date to be decided');
});
test('pending changes, cancellations, shortlists and missing details stay distinct',()=>{
  assert.equal(planStatus(plan({...fixture,proposal:{id:'new'}})).label,'Changes proposed');
  assert.equal(planStatus(plan({...fixture,status:'cancelled',proposal:{}})).label,'Cancelled');
  const pending=plan({...fixture,confirmed:false,selectedMovieId:null,films:[...fixture.films,{id:157336,title:'Interstellar'}],schedule:null,where:{kind:'undecided'}});
  assert.equal(planFilm(pending),null);assert.equal(planTitle(pending),'Choosing a film');assert.equal(planStatus(pending).label,'Planning');
  assert.equal(planPlace(pending),'Place to be decided');assert.equal(planSchedule(pending).time,'Time to be decided');
  const unselectedSingle = plan({...fixture,selectedMovieId:null,confirmed:false});
  assert.equal(planFilm(unselectedSingle),null);assert.equal(planTitle(unselectedSingle),'Choosing a film');
  assert.equal(planTitle(plan({...fixture,films:[]})),'Your next film night');
  assert.equal(participantReply(null),'Reply not available');assert.equal(participantReply('declined'),'Declined');
  assert.throws(()=>plan({}));
});
test('plan reads remain authenticated and retain presentation fields without a new mutation',async()=>{
  const requests:{url:string;method:string;authorization:string|null}[]=[];
  const api=new FlixieApi('https://example.invalid',()=>({uid:'alex',token:async()=>'fixture-token'}),async(input,init)=>{
    requests.push({url:String(input),method:init?.method??'GET',authorization:new Headers(init?.headers).get('Authorization')});
    return new Response(JSON.stringify({plans:[fixture]}),{headers:{'Content-Type':'application/json'}});
  });
  const [value]=await api.plans();assert.equal(planSchedule(value,'Europe/London').time,'19:30');assert.equal(value.people[1].response,'pending');
  assert.deepEqual(requests,[{url:'https://example.invalid/watch-plans',method:'GET',authorization:'Bearer fixture-token'}]);
});
