import { useEffect, useRef, useState } from 'react';
import { useSession } from './auth';
import { ErrorState } from './components';
import { errorMessage, useLoad } from './hooks';
export default function PickerServices({onState}:{onState:(state:{editing:boolean;busy:boolean})=>void}){
  const {api,user}=useSession(),owner=useRef({uid:user!.externalId,id:user!.id}),active=useRef(true),lock=useRef(false);
  const saved=useLoad(`picker-services:${owner.current.uid}`,signal=>api.savedProviders(owner.current.id,signal));
  const [editing,setEditing]=useState(false),[ids,setIds]=useState<number[]>([]),[query,setQuery]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const all=useLoad(`picker-provider-choices:${editing}`,signal=>editing?api.providerChoices(signal):Promise.resolve([]));
  useEffect(()=>{active.current=true;return()=>{active.current=false;onState({editing:false,busy:false});};},[onState]);
  useEffect(()=>{onState({editing,busy});},[editing,busy,onState]);
  async function save(){if(lock.current)return;lock.current=true;setBusy(true);setError('');try{await api.saveProviders(owner.current.uid,owner.current.id,ids);if(active.current){saved.retry();setEditing(false);}}catch(error){if(active.current)setError(errorMessage(error));}finally{lock.current=false;if(active.current)setBusy(false);}}
  return <section className="fx-pick-services"><div className="fx-section-head"><h4>Your services{user!.country?` · ${user!.country==='GB'?'UK':user!.country}`:''}</h4>{!editing&&<button className="fx-text-button" type="button" disabled={saved.loading||!!saved.error} onClick={()=>{setIds(saved.data?.map(p=>p.id)??[]);setEditing(true);setError('');}}>Change</button>}</div>
    {saved.loading?<p role="status">Loading your services…</p>:saved.error?<ErrorState message={saved.error} retry={saved.retry}/>:<p>{saved.data?.map(p=>p.name).join(' · ')||'No streaming services saved yet.'}</p>}
    {editing&&<><p className="fx-small fx-muted">Save the services you use to your Flixie account.</p><label className="fx-pick-select">Find a service<input type="search" value={query} disabled={busy} onChange={e=>setQuery(e.target.value)}/></label>{all.loading?<p role="status">Loading streaming services…</p>:all.error?<ErrorState message={all.error} retry={all.retry}/>:<div className="fx-pick-language-options">{all.data?.filter(p=>!query||p.name.toLowerCase().includes(query.toLowerCase())).map(p=><label className="fx-check" key={p.id}><input type="checkbox" disabled={busy} checked={ids.includes(p.id)} onChange={e=>setIds(e.target.checked?[...ids,p.id]:ids.filter(id=>id!==p.id))}/>{p.name}</label>)}</div>}{error&&<ErrorState message={error}/>}<div className="fx-pick-chips"><button type="button" className="fx-button" disabled={busy} onClick={()=>{setEditing(false);saved.retry();setError('');}}>Cancel changes</button><button type="button" className="fx-button fx-primary" disabled={busy||all.loading||!!all.error} onClick={()=>void save()}>{busy?'Saving…':'Save services'}</button></div></>}
  </section>;
}
