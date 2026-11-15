import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Check } from 'lucide-react';
import { useSession } from './auth';
import { Avatar, Empty, ErrorState, Loading, Sheet } from './components';
import { errorMessage, useLoad } from './hooks';
import { avatarBorder, number, type JsonObject } from './models';
import { badgeLabels, type UserProfile } from './userProfiles';

export function ProfileEditor({ profile, onClose }: { profile: UserProfile; onClose: () => void }) {
  const session=useSession(), [username,setUsername]=useState(profile.username), [bio,setBio]=useState(profile.bio);
  const saved=useRef({username:profile.username,bio:profile.bio}), active=useRef(true);
  const ownerUid=useRef(session.user!.externalId);
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  useEffect(()=>{active.current=true;return ()=>{active.current=false;};},[]);
  async function submit(event:FormEvent) {
    event.preventDefault(); if(busy)return;
    setBusy(true);setError('');
    try {
      if(username.trim()!==saved.current.username) {await session.api.editProfile(ownerUid.current,profile.id,'username',username.trim());saved.current.username=username.trim();}
      if(bio.trim()!==saved.current.bio) {await session.api.editProfile(ownerUid.current,profile.id,'bio',bio.trim());saved.current.bio=bio.trim();}
      await session.reloadProfile(); if(active.current)onClose();
    } catch(e) {if(active.current)setError(`${errorMessage(e)} Your edits are still here; retry saves only remaining changes.`);}
    finally {if(active.current)setBusy(false);}
  }
  return <Sheet title="Edit profile" onClose={onClose} dismissible={!busy}>
    <form className="fx-profile-editor" onSubmit={submit}>
      <label>Username<input value={username} onChange={e=>setUsername(e.target.value)} required minLength={3} maxLength={20} pattern="[A-Za-z0-9_.]+" autoComplete="username" disabled={busy} aria-describedby="profile-username-help" /></label>
      <p className="fx-small fx-muted" id="profile-username-help">3–20 letters, numbers, underscores or full stops.</p>
      <label>Bio<textarea value={bio} onChange={e=>setBio(e.target.value)} maxLength={1000} rows={4} disabled={busy} /></label>
      <p className="fx-small fx-muted">{bio.length}/1,000 characters</p>
      {error&&<p role="alert" className="fx-form-error">{error}</p>}
      <div className="fx-button-row"><button type="submit" className="fx-button fx-primary" disabled={busy||(username.trim()===saved.current.username&&bio.trim()===saved.current.bio)}>{busy?'Saving…':'Save changes'}</button><button type="button" className="fx-button" disabled={busy} onClick={onClose}>Cancel</button></div>
    </form>
  </Sheet>;
}

export function AvatarEditor({ profile, borders=false, onClose }: {profile:UserProfile;borders?:boolean;onClose:()=>void}) {
  const session=useSession(), active=useRef(true),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const ownerUid=useRef(session.user!.externalId);
  const currentId=number(profile.avatar.id), currentBorder=avatarBorder(profile.profileBadges)||'NONE';
  const [selected,setSelected]=useState<number|null>(currentId),[border,setBorder]=useState(currentBorder);
  const result=useLoad(`avatar-choices:${profile.id}`,signal=>borders?Promise.resolve([] as JsonObject[]):session.api.avatars(signal));
  useEffect(()=>{active.current=true;return ()=>{active.current=false;};},[]);
  const changed=borders?border!==currentBorder:selected!==currentId;
  async function save() {
    if(busy||!changed)return;setBusy(true);setError('');
    try {if(borders)await session.api.chooseBorder(ownerUid.current,border);else await session.api.chooseAvatar(ownerUid.current,selected);await session.reloadProfile();if(active.current)onClose();}
    catch(e){if(active.current)setError(errorMessage(e));}finally{if(active.current)setBusy(false);}
  }
  return <Sheet title={borders?'Choose your avatar border':'Choose your avatar'} onClose={onClose} dismissible={!busy}>
    <p className="fx-muted">{borders?'Choose from your earned borders.':'The same Flixie avatars you use in the app.'}</p>
    {borders?<div className="fx-avatar-options" aria-label="Avatar borders">
      {['NONE',...Object.keys(badgeLabels).filter(key=>profile.profileBadges.includes(key))].map(key=><button type="button" key={key} aria-pressed={border===key} onClick={()=>setBorder(key)} disabled={busy}>
        <Avatar large person={{...profile,profileBadges:[...profile.profileBadges.filter(b=>!b.startsWith('FRAME:')),`FRAME:${key}`]}} />
        <span>{key==='NONE'?'No border':badgeLabels[key]}</span>{border===key&&<Check size={16} aria-hidden="true" />}
      </button>)}
    </div>:result.loading?<Loading label="Loading avatars…"/>:result.error?<ErrorState message={result.error} retry={result.retry}/>:<div className="fx-avatar-options" aria-label="Profile avatars">
      <button type="button" aria-pressed={selected===null} onClick={()=>setSelected(null)} disabled={busy}><Avatar large person={{...profile,avatar:{}}}/><span>Use initials</span>{selected===null&&<Check size={16} aria-hidden="true"/>}</button>
      {result.data?.map(avatar=><button type="button" key={Number(avatar.id)} aria-pressed={selected===avatar.id} disabled={busy} onClick={()=>setSelected(Number(avatar.id))}>
        <Avatar large person={{...profile,avatar}}/><span>{String(avatar.displayName||'Flixie avatar')}</span>{selected===avatar.id&&<Check size={16} aria-hidden="true"/>}
      </button>)}
      {!result.data?.length&&<Empty title="No avatars available">You can use your initials and try again later.</Empty>}
    </div>}
    {error&&<p role="alert" className="fx-form-error">{error}</p>}
    <div className="fx-button-row fx-profile-editor-actions"><button className="fx-button fx-primary" disabled={busy||!changed} onClick={()=>void save()}>{busy?'Saving…':'Save choice'}</button><button className="fx-button" disabled={busy} onClick={onClose}>Cancel</button></div>
  </Sheet>;
}
