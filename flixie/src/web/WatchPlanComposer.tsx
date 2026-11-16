import { Loading } from "./Loading";
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, CalendarPlus, Send } from 'lucide-react';
import { useSession } from './auth';
import { Avatar, ErrorState, FilmMeta, Poster, Sheet } from './components';
import { errorMessage, useLoad } from './hooks';
import type { Film, Plan } from './models';
import { createPlanInput, localCalendarDay, WatchPlanSubmission, type PickPlanContext, type PlanPlaceKind } from './watchPlanCreation';
import { WatchPlanPreview } from './WatchPlans';
import './watch-plan-composer.css';

export default function WatchPlanComposer({ film, context, onBack, onClose, onSaved, onViewPlans }: {
  film: Film; context: PickPlanContext; onBack: () => void; onClose: () => void; onSaved: () => void; onViewPlans: () => void;
}) {
  const { api, user } = useSession();
  const owner = useRef({uid:user!.externalId,id:user!.id}), active = useRef(true), attempt = useRef(new WatchPlanSubmission()), draftId = useRef(crypto.randomUUID());
  const friends = useLoad(`plan-friends:${owner.current.uid}`,signal=>api.profileFriends(signal));
  const groups = useLoad(`plan-groups:${owner.current.uid}`,signal=>api.pickerGroups(owner.current.uid,owner.current.id,signal));
  const [audience,setAudience] = useState<'solo'|'friends'|'group'>(context.viewer.type==='solo'?'solo':context.viewer.type==='friend'?'friends':'group');
  const [friendIds,setFriendIds] = useState<string[]>(context.viewer.type==='friend'?[context.viewer.id]:[]), [groupId,setGroupId] = useState(context.viewer.type==='group'?context.viewer.id:'');
  const [place,setPlace] = useState<PlanPlaceKind>(context.place),[hostId,setHostId] = useState(owner.current.id),[venue,setVenue] = useState(''),[day,setDay] = useState(''),[time,setTime] = useState('');
  const [busy,setBusy] = useState(false),[uncertain,setUncertain] = useState(false),[error,setError] = useState(''),[saved,setSaved] = useState<Plan|null>(null);
  useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
  const group = groups.data?.find(g=>g.id===groupId), invitees = audience==='group' ? group?.members.filter(p=>p.id!==owner.current.id)??[] : audience==='friends' ? (friends.data??[]).filter(p=>friendIds.includes(p.id)) : [];
  const participants = [user!,...invitees], directoryLoading = audience==='friends'?friends.loading:audience==='group'?groups.loading:false;
  const directoryError = audience==='friends'?friends.error:audience==='group'?groups.error:null;
  const unavailable = audience==='group'?!!groupId&&!group:audience==='friends'?friendIds.some(id=>!friends.data?.some(p=>p.id===id)):false;
  async function save(event: FormEvent) {
    event.preventDefault(); if(busy)return;setBusy(true);setError('');
    try {
      const result = await attempt.current.save(()=>createPlanInput({id:draftId.current,ownerId:owner.current.id,film,audience,friendIds,groupId,friends:friends.data??[],groups:groups.data??[],place,hostId,venue,day,time}), input=>api.createWatchPlan(owner.current.uid,owner.current.id,input));
      if(active.current){setSaved(result);onSaved();}
    } catch(error) {if(active.current){setError(errorMessage(error));setUncertain(attempt.current.snapshot!==null);}}
    finally {if(active.current)setBusy(false);}
  }
  if(saved)return <WatchPlanPreview plan={saved} created onClose={onClose} onViewPlans={onViewPlans}/>;
  return <Sheet title="Make it a film night" presentation="modal" className="fx-plan-compose" dismissible={!busy} onClose={onClose}>
    <div className="fx-plan-compose-body">
      <div className="fx-plan-compose-film"><Poster film={film}/><div><h3>{film.title}</h3><FilmMeta film={film}/><p>Make a plan from your pick. Add people, then choose the details together.</p></div></div>
      <form id="fx-plan-compose-form" onSubmit={e=>void save(e)}>
        <fieldset disabled={busy||uncertain}>
          <legend>Who’s coming?</legend>
          <div className="fx-plan-audience" role="group" aria-label="Plan audience">{(['solo','friends','group'] as const).map(value=><button key={value} type="button" className="fx-button" aria-pressed={audience===value} onClick={()=>{setAudience(value);setHostId(owner.current.id);}}>{({solo:'Just me',friends:'Invite friends',group:'My group'})[value]}</button>)}</div>
          {audience==='friends'&&<>
            <p className="fx-small fx-muted">Choose up to 20 friends. Only the people you select will be invited.</p>
            {!!friends.data?.length&&<ul className="fx-plan-friend-choices">{friends.data.map(person=><li key={person.id}><label><input type="checkbox" checked={friendIds.includes(person.id)} disabled={!friendIds.includes(person.id)&&friendIds.length>=20} onChange={e=>{setFriendIds(e.target.checked?[...friendIds,person.id]:friendIds.filter(id=>id!==person.id));if(!e.target.checked&&hostId===person.id)setHostId(owner.current.id);}}/><Avatar person={person}/><span><strong>{person.firstName||person.username}</strong>{person.firstName&&<small>@{person.username}</small>}</span></label></li>)}</ul>}
            {!friends.loading&&!friends.error&&!friends.data?.length&&<p>No friends to invite yet. You can save a plan just for you.</p>}
          </>}
          {audience==='group'&&<><label className="fx-plan-input">Choose your group<select value={groupId} onChange={e=>{setGroupId(e.target.value);setHostId(owner.current.id);}}><option value="">Choose a group</option>{groups.data?.map(g=><option key={g.id} value={g.id}>{g.name} · {g.members.length} people</option>)}</select></label>{!groups.loading&&!groups.error&&!groups.data?.length&&<p>No eligible groups yet. Invite individual friends instead.</p>}</>}
          {directoryLoading&&<Loading layout="rows" count={2} label="Loading your people…"/>}
          {directoryError&&<ErrorState message={directoryError} retry={audience==='friends'?friends.retry:groups.retry}/>}
          {unavailable&&!directoryLoading&&!directoryError&&<p role="alert">Your earlier selection is unavailable. Choose who to invite again.</p>}
          {(audience==='solo'||audience==='group')&&<div className="fx-pick-viewers">{participants.map(person=><span key={person.id}><Avatar person={person}/><span>{person.id===owner.current.id?'You':person.firstName||person.username}</span></span>)}</div>}
          <div className="fx-plan-compose-details">
            <h3>The plan</h3>
            <p className="fx-small fx-muted">Date, time and place can stay undecided.</p>
            <div className="fx-plan-compose-fields"><label className="fx-plan-input">Date <span className="fx-muted">Optional</span><input type="date" min={localCalendarDay()} value={day} onChange={e=>{setDay(e.target.value);if(!e.target.value)setTime('');}}/></label><label className="fx-plan-input">Time <span className="fx-muted">Optional · your local time</span><input type="time" disabled={!day} value={time} onChange={e=>setTime(e.target.value)}/></label></div>
            <label className="fx-plan-input">Where?<select value={place} onChange={e=>setPlace(e.target.value as PlanPlaceKind)}><option value="undecided">Decide together</option><option value="home">At home</option><option value="cinema">At the cinema</option><option value="separately">From different places</option></select></label>
            {place==='home'&&<label className="fx-plan-input">Who’s hosting?<select value={hostId} onChange={e=>setHostId(e.target.value)}><option value="">Decide together</option>{participants.map(person=><option key={person.id} value={person.id}>{person.id===owner.current.id?'Me':person.firstName||person.username}</option>)}</select></label>}
            {place==='cinema'&&<label className="fx-plan-input">Cinema <span className="fx-muted">Optional</span><input type="text" maxLength={150} value={venue} onChange={e=>setVenue(e.target.value)} placeholder="Choose a cinema together"/></label>}
          </div>
        </fieldset>
      </form>
      {error&&<ErrorState message={error}/>}
      {uncertain&&<p role="status">This invitation may already be saved. Retry sends the same plan, without inviting anyone twice. You can also check Watch Plans before starting another.</p>}
      {busy&&<p role="status">Creating your plan{invitees.length?' and sending invitations':''}…</p>}
    </div>
    <footer className="fx-plan-compose-footer"><p>{invitees.length?`${invitees.length} ${invitees.length===1?'friend will':'friends will'} receive an invitation. They can join or decline in Flixie.`:audience==='solo'?'This plan is just for you.':'Choose friends or a group to invite.'}</p><div>
      {uncertain?<button type="button" className="fx-button" disabled={busy} onClick={onViewPlans}>Check Watch Plans</button>:<button type="button" className="fx-button" disabled={busy} onClick={onBack}><ArrowLeft size={17} aria-hidden="true"/>Back to picks</button>}
      <button type="submit" form="fx-plan-compose-form" className="fx-button fx-primary" disabled={busy||(!uncertain&&(directoryLoading||!!directoryError||unavailable||(audience==='group'&&!group)||(audience==='friends'&&!friendIds.length)))}>{invitees.length?<Send size={17} aria-hidden="true"/>:<CalendarPlus size={17} aria-hidden="true"/>}{busy?'Creating…':uncertain?'Retry same plan':audience!=='solo'?'Create plan & invite':'Create my plan'}</button>
    </div></footer>
  </Sheet>;
}
