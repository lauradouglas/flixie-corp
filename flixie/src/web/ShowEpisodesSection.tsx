import { useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { useSession } from './auth';
import { Empty, ErrorState, Loading } from './components';
import { useLoad, errorMessage } from './hooks';
import { imageUrl, viewDate } from './models';
import { episodeReleased, type ShowEpisode } from './showSeasons';
import './show-seasons.css';

export default function ShowSeasons({id,revision,onChange,onSignIn}:{id:number;revision:number;onChange:()=>void;onSignIn:()=>void}) {
  const {api,user}=useSession();
  const result=useLoad(`seasons:${user?.externalId??'guest'}:${id}:${revision}`,signal=>api.seasons(id,user?{uid:user.externalId,id:user.id}:undefined,signal));
  const [selected,setSelected]=useState<number|null>(null),[reveal,setReveal]=useState(false),[busy,setBusy]=useState<number|null>(null),[error,setError]=useState(''),[status,setStatus]=useState('');
  const lock=useRef(false),owner=useRef(user?.externalId);owner.current=user?.externalId;
  async function toggle(episode:ShowEpisode){
    if(!user){onSignIn();return;}
    if(lock.current)return;
    const uid=user.externalId;lock.current=true;setBusy(episode.id);setError('');setStatus('');
    try{await api.setEpisodeProgress(uid,user.id,id,episode.id,!episode.watched);if(owner.current===uid){setStatus(`Episode ${episode.number} marked ${episode.watched?'unwatched':'watched'}.`);result.retry();onChange();}}
    catch(e){if(owner.current===uid){setError(errorMessage(e));result.retry();}}
    finally{lock.current=false;if(owner.current===uid)setBusy(null);}
  }
  const seasons=result.data??[],season=seasons.find(s=>s.number===selected)??seasons.find(s=>s.number>0)??seasons[0];
  return <section id="title-episodes" className="fx-show-seasons"><h2>Seasons &amp; episodes</h2>
    {result.loading?<Loading label="Loading seasons and episodes…"/>:result.error?<ErrorState message={result.error} retry={result.retry}/>:!season?<Empty title="Episodes aren’t available yet">Check back when season details are available.</Empty>:<>
      <div className="fx-season-controls"><label>Season<select value={season.number} onChange={e=>{setSelected(Number(e.target.value));setError('');}}>{seasons.map(s=><option key={s.id} value={s.number}>{s.number===0?'Specials':`Season ${s.number}`} · {s.episodes.length} episodes</option>)}</select></label><label className="fx-check"><input type="checkbox" checked={reveal} onChange={e=>setReveal(e.target.checked)}/>Show episode spoilers</label></div>
      <p className="fx-small fx-muted">{user?`${season.episodes.filter(e=>e.watched).length} of ${season.episodes.length} watched`:'Sign in to track what you’ve watched.'}</p>
      {error&&<p role="alert" className="fx-form-error">{error}</p>}<p className="fx-sr-only" role="status">{status}</p>
      {!season.episodes.length?<p>No episodes are listed for this season yet.</p>:<ol className="fx-episode-list">{season.episodes.map(episode=>{
        const visible=reveal||episode.watched,released=episodeReleased(episode),src=visible?imageUrl(episode.still,'w500'):undefined;
        return <li key={episode.id}><div className="fx-episode-still">{src?<img src={src} alt="" loading="lazy"/>:<span>Episode {episode.number}</span>}</div><div className="fx-episode-copy"><h3>{visible?`${episode.number}. ${episode.name}`:`Episode ${episode.number}`}</h3><p className="fx-small fx-muted">{episode.date?viewDate(episode.date):'Air date to be announced'}{episode.runtime?` · ${episode.runtime} min`:''}{!released&&episode.date?' · Upcoming':''}</p>{visible?<p>{episode.overview||'No episode description is available.'}</p>:<details><summary>Show episode details · may contain spoilers</summary><h4>{episode.name}</h4><p>{episode.overview||'No episode description is available.'}</p></details>}</div><button type="button" className={`fx-button ${episode.watched?'fx-soft':''}`} aria-pressed={episode.watched} aria-label={`Mark season ${episode.season} episode ${episode.number} ${episode.watched?'unwatched':'watched'}`} disabled={busy!==null||episode.season<1||(!episode.watched&&!released)} onClick={()=>void toggle(episode)}>{episode.watched&&<Check size={17} aria-hidden="true"/>}{busy===episode.id?'Saving…':episode.season<1?'Special · details only':episode.watched?'Watched':released?'Mark watched':'Not aired yet'}</button></li>;
      })}</ol>}
    </>}
  </section>;
}
