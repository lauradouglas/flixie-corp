import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, CalendarPlus, Check, ChevronDown, Film as FilmIcon, Heart, Home, Layers, Lightbulb, Moon, Mountain, Smile, Sofa, Sparkles, Sun, Users } from 'lucide-react';
import { useSession } from './auth';
import { Avatar, ErrorState, FilmMeta, Poster, Sheet } from './components';
import { errorMessage, useLoad } from './hooks';
import type { Film } from './models';
import { pickGenres, type PickPreferences } from './pickForUs';
import { pickLanguages } from './pickLanguages';
import { emptyDeck, fillDeck, passPick, undoPick } from './pickDeck';
import { pickerPlanContext, type PickPlanContext } from './watchPlanCreation';
import WatchPlanComposer from './WatchPlanComposer';
import PickerServices from './PickerServices';
import './pick-for-us.css';

const moods=[['laugh','Have a laugh',Smile],['hooked','Get hooked',FilmIcon],['feel_good','Feel good',Sun],['escape','Escape somewhere',Mountain],['switch_off','Switch off',Sofa],['feel_something','Feel something',Heart],['challenged','Be challenged',Lightbulb],['scared','Get scared',Moon]] as const;
const concerns=[['horror','Horror'],['violence','Graphic violence'],['bleak','Bleak tone'],['heavy','Heavy themes']];
function Choice({selected,children,onClick,icon,disabled=false,mood}:{selected:boolean;children:ReactNode;onClick:()=>void;icon?:ReactNode;disabled?:boolean;mood?:string}){
  return <button type="button" className="fx-pick-choice" data-mood={mood} aria-pressed={selected} onClick={onClick} disabled={disabled}>{icon}<span>{children}</span>{selected&&<Check size={17} aria-hidden="true"/>}</button>;
}
export default function PickForUs({onClose,onChoose,onPlanSaved,onViewPlans,initialMood}:{onClose:()=>void;onChoose:(film:Film)=>void;onPlanSaved:()=>void;onViewPlans:()=>void;initialMood?:'laugh'|'hooked'}){
  const {api,user}=useSession(),owner=useRef({uid:user!.externalId,id:user!.id}),active=useRef(true),lock=useRef(false),body=useRef<HTMLDivElement>(null),heading=useRef<HTMLHeadingElement>(null);
  const friends=useLoad(`pick-friends:${owner.current.uid}`,signal=>api.profileFriends(signal));
  const groups=useLoad(`pick-groups:${owner.current.uid}`,signal=>api.pickerGroups(owner.current.uid,owner.current.id,signal));
  const [step,setStep]=useState(0),[company,setCompany]=useState<'solo'|'friend'|'group'>('solo'),[viewer,setViewer]=useState(''),[mood,setMood]=useState(initialMood??'any'),[minutes,setMinutes]=useState<number|null>(null),[venue,setVenue]=useState<'streaming'|'cinema'>('streaming'),[watching,setWatching]=useState<'together'|'separately'>('together'),[rent,setRent]=useState(false),[request,setRequest]=useState(''),[rewatches,setRewatches]=useState(false),[avoid,setAvoid]=useState<string[]>([]),[genreIds,setGenres]=useState<number[]>([]),[genreMatch,setGenreMatch]=useState<'any'|'all'>('any'),[languages,setLanguages]=useState<string[]>([]),[languageQuery,setLanguageQuery]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const [services,setServices]=useState({editing:false,busy:false});
  const [results,setResults]=useState<Awaited<ReturnType<typeof api.pickForUs>>|null>(null),[deck,setDeck]=useState(emptyDeck),submitted=useRef<PickPreferences|null>(null);
  const [planFilm,setPlanFilm]=useState<Film|null>(null),[planContext,setPlanContext]=useState<PickPlanContext|null>(null);
  useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
  useEffect(()=>{body.current?.scrollTo({top:0});heading.current?.focus({preventScroll:true});},[step,results!==null,deck.current?.film.id]);
  const friend=company==='friend'?friends.data?.find(p=>p.id===viewer):undefined,group=company==='group'?groups.data?.find(g=>g.id===viewer):undefined,people=friend?[user!,friend]:group?.members??[user!],solo=company==='solo',valid=solo||!!friend||!!group;
  const genreLabel=genreIds.length?genreIds.map(id=>pickGenres[id]).join(genreMatch==='any'?' or ':' + '):'Any genre',moodLabel=moods.find(([id])=>id===mood)?.[1]??'Any mood',companyLabel=solo?'Just me':friend?`With ${friend.firstName||friend.username}`:group?.name??'Choose your people';
  const selected=deck.current,selectedLanguages=languages.map(code=>pickLanguages[code]??code).join(' or ')||'Any language';
  function back(){setError('');if(results){setResults(null);setStep(1);}else if(step)setStep(0);else onClose();}
  async function find(different=false){
    if(lock.current)return;if(different&&deck.shown.length>=60){setError('You’ve explored 60 films. Change your preferences to start a fresh search.');return;}
    lock.current=true;setBusy(true);setError('');
    try{
      const selection:PickPreferences['viewer']|null=solo?{type:'solo'}:friend?{type:'friend',id:friend.id}:group?{type:'group',id:group.id}:null;
      if(!selection)throw new Error('Choose who is watching before finding a film.');
      const preferences:PickPreferences=different&&submitted.current?{...submitted.current,excludeMovieIds:[...deck.shown]}:{viewer:selection,mood,maxMinutes:minutes,venue,watching:solo||venue==='cinema'?'together':watching,openToRent:rent&&venue==='streaming'&&(solo||watching==='together'),request,allowRewatches:rewatches,avoid,genreIds,genreMatch,originalLanguages:languages};
      const next=await api.pickForUs(owner.current.uid,preferences);if(!active.current)return;
      const nextDeck=fillDeck(deck,next.choices,different);
      if(different&&nextDeck===deck){setError('No different films matched this time. Your previous pick is still here. Change preferences to widen the search.');return;}
      submitted.current=preferences;setPlanContext(pickerPlanContext(preferences));setResults(next);setDeck(nextDeck);
    }catch(error){if(active.current)setError(errorMessage(error));}finally{lock.current=false;if(active.current)setBusy(false);}
  }
  if(planFilm&&planContext)return <WatchPlanComposer film={planFilm} context={planContext} onBack={()=>setPlanFilm(null)} onClose={onClose} onSaved={onPlanSaved} onViewPlans={onViewPlans}/>;
  return <Sheet title={solo?'Pick for me':'Pick for us'} presentation="modal" className="fx-pick-modal" dismissible={!busy&&!services.busy} onClose={onClose}>
    <div ref={body} className="fx-pick-body">
      {results?<>
        <button type="button" className="fx-pick-summary" onClick={back} disabled={busy}><Layers size={20} aria-hidden="true"/><span>{companyLabel} · {moodLabel} · {genreLabel} · {minutes?`Up to ${minutes} min`:'Any length'}</span><span>Edit</span></button>
        <h3 ref={heading} tabIndex={-1} className="fx-pick-heading">{selected?solo?'Tonight’s pick':'Your pick together':'No matches for these preferences'}</h3>
        {selected?<article className="fx-pick-one">
          <div className="fx-pick-film"><Poster film={selected.film}/><div><h3>{selected.film.title}</h3><FilmMeta film={selected.film}/>{selected.film.genres.length>0&&<p className="fx-small fx-muted">{selected.film.genres.join(' · ')}</p>}{selected.offers.map(offer=><p className="fx-pick-offer fx-small" key={offer}>{offer}</p>)}</div></div>
          {selected.reasons.length>0&&<section className="fx-pick-reasons"><h4>Why this fits</h4><ul>{selected.reasons.slice(0,3).map((reason,i)=><li key={i}><Check size={20} aria-hidden="true"/><span>{reason}</span></li>)}</ul></section>}
          {(selected.film.overview||selected.reasons.length>3)&&<details className="fx-pick-edit"><summary>More about this pick<ChevronDown size={18} aria-hidden="true"/></summary>{selected.film.overview&&<p>{selected.film.overview}</p>}{selected.reasons.slice(3).map((reason,i)=><p key={i}>{reason}</p>)}</details>}
          {results.incomplete&&<p className="fx-small fx-muted">Some other films couldn’t be fully checked. Check viewing details before settling in.</p>}
          {results.message&&<details className="fx-pick-edit"><summary>About this search<ChevronDown size={18} aria-hidden="true"/></summary><p>{results.message}</p></details>}
          <div className="fx-pick-result-links"><button type="button" className="fx-text-button" disabled={busy} onClick={back}>Change preferences</button><button type="button" className="fx-text-button" disabled={busy} onClick={()=>solo?setPlanFilm(selected.film):onChoose(selected.film)}>{solo?'Create a Watch Plan':'View film'}<ArrowRight size={17} aria-hidden="true"/></button></div>
        </article>:<><p>{selectedLanguages} · {genreLabel} · {minutes?`Up to ${minutes} min`:'Any length'}</p><p>{results.outcome==='availability_unavailable'?'Viewing options couldn’t be checked. Try again before changing your preferences.':'Try a different mood, genre, time or viewing preference. Your exclusions haven’t been relaxed.'}</p>{results.message&&<p className="fx-muted">{results.message}</p>}</>}
      </>:<fieldset disabled={busy||services.busy}>
        {step===0?<>
          <h3 ref={heading} tabIndex={-1} className="fx-pick-heading">What do you fancy?</h3><p className="fx-muted">Pick a mood, a genre, or leave both open.</p>
          <div className="fx-pick-mood"><Choice selected={mood==='any'} onClick={()=>setMood('any')} icon={<Sparkles size={22} aria-hidden="true"/>}><strong>Keep my options open</strong><small>Find something great based on everything below.</small></Choice><div className="fx-pick-choice-grid">{moods.map(([id,label,Icon])=><Choice key={id} mood={id} selected={mood===id} onClick={()=>setMood(id)} icon={<Icon size={22} aria-hidden="true"/>}>{label}</Choice>)}</div></div>
          <details className="fx-pick-edit"><summary><Layers size={20} aria-hidden="true"/><span>Genre<small>{genreLabel}</small></span><span>Edit</span></summary><p className="fx-small fx-muted">Choose up to three genres.</p><div className="fx-pick-chips"><Choice selected={!genreIds.length} onClick={()=>setGenres([])}>Any genre</Choice>{Object.entries(pickGenres).map(([id,label])=><Choice key={id} selected={genreIds.includes(Number(id))} disabled={genreIds.length>=3&&!genreIds.includes(Number(id))} onClick={()=>setGenres(genreIds.includes(Number(id))?genreIds.filter(v=>v!==Number(id)):[...genreIds,Number(id)])}>{label}</Choice>)}</div>{genreIds.length>1&&<div className="fx-pick-chips" role="group" aria-label="Genre matching"><Choice selected={genreMatch==='any'} onClick={()=>setGenreMatch('any')}>Match any selected genre</Choice><Choice selected={genreMatch==='all'} onClick={()=>setGenreMatch('all')}>All in the same film</Choice></div>}</details><p className="fx-small fx-muted">Mood is how it feels. Genre is the kind of story.</p>
        </>:<>
          <h3 ref={heading} tabIndex={-1} className="fx-pick-heading">Your evening</h3><p className="fx-muted">Just a few final details.</p><button type="button" className="fx-pick-summary" onClick={()=>setStep(0)}><Layers size={20} aria-hidden="true"/><span>{moodLabel} · {genreLabel}</span><span>Edit</span></button>
          <h4>Who’s watching?</h4><div className="fx-pick-chips">{(['solo','friend','group'] as const).map(value=><Choice key={value} selected={company===value} onClick={()=>{setCompany(value);setViewer('');setWatching('together');setRent(false);setError('');}}>{({solo:'Just me',friend:'Friend',group:'Group'})[value]}</Choice>)}</div>
          {!solo&&<><label className="fx-pick-select">{company==='friend'?'Choose a friend':'Choose a group'}<select value={viewer} onChange={e=>setViewer(e.target.value)}><option value="">Choose {company==='friend'?'a friend':'a group'}</option>{company==='friend'?friends.data?.map(p=><option key={p.id} value={p.id}>{p.firstName||p.username}</option>):groups.data?.map(g=><option key={g.id} value={g.id}>{g.name} · {g.members.length} people</option>)}</select></label>{(company==='friend'?friends.loading:groups.loading)&&<p role="status">Loading your people…</p>}{(company==='friend'?friends.error:groups.error)&&<ErrorState message={(company==='friend'?friends.error:groups.error)!} retry={company==='friend'?friends.retry:groups.retry}/>}</>}
          <div className="fx-pick-viewers">{people.map(p=><span key={p.id}><Avatar person={p}/><span>{p.id===user!.id?'You':p.firstName||p.username}</span></span>)}</div>
          <h4>How much time?</h4><div className="fx-pick-chips">{[90,120,180,null].map(n=><Choice key={n??'any'} selected={minutes===n} onClick={()=>setMinutes(n)}>{n===null?'Any length':n===90?'1½ hours':`${n/60} hours`}</Choice>)}</div>
          <h4>Where?</h4><div className="fx-pick-chips"><Choice selected={venue==='streaming'} onClick={()=>{setVenue('streaming');setRent(false);}} icon={<Home size={20} aria-hidden="true"/>}>At home</Choice><Choice selected={venue==='cinema'} onClick={()=>{setVenue('cinema');setWatching('together');setRent(false);}} icon={<FilmIcon size={20} aria-hidden="true"/>}>Cinema</Choice></div>
          {!solo&&venue==='streaming'&&<><h4>How are you watching?</h4><div className="fx-pick-choice-grid"><Choice selected={watching==='together'} onClick={()=>{setWatching('together');setRent(false);}}><strong>Together</strong><small>At the same place</small></Choice><Choice selected={watching==='separately'} onClick={()=>{setWatching('separately');setRent(false);}}><strong>Separately</strong><small>A service everyone has, in each viewer’s country</small></Choice></div></>}
          {venue==='cinema'?<p className="fx-small fx-muted fx-pick-viewing-note">Current releases in your saved country. Check local showtimes; allow time for adverts and trailers.</p>:<PickerServices onState={setServices}/>}
          {venue==='streaming'&&(solo||watching==='together')&&<label className="fx-check"><input type="checkbox" checked={rent} onChange={e=>setRent(e.target.checked)}/><span>Include paid rentals<small className="fx-muted">Rentals clearly labelled</small></span></label>}
          <label className="fx-check"><input type="checkbox" checked={rewatches} onChange={e=>setRewatches(e.target.checked)}/>Include films I’ve seen</label>
          <details className="fx-pick-edit"><summary><span>Original language<small>{selectedLanguages}</small></span><ChevronDown size={18} aria-hidden="true"/></summary><p className="fx-small fx-muted">Match any selected language. This is the original language, not available dubbing or subtitles.</p><label className="fx-pick-select">Find a language<input type="search" value={languageQuery} onChange={e=>setLanguageQuery(e.target.value)} placeholder="Search languages"/></label><button type="button" className="fx-text-button" onClick={()=>setLanguages([])}>Keep any language</button><div className="fx-pick-language-options">{Object.entries(pickLanguages).filter(([code,label])=>!languageQuery||code.includes(languageQuery.toLowerCase())||label.toLowerCase().includes(languageQuery.toLowerCase())).sort((a,b)=>a[1].localeCompare(b[1])).map(([code,label])=><label className="fx-check" key={code}><input type="checkbox" checked={languages.includes(code)} onChange={e=>setLanguages(e.target.checked?[...languages,code]:languages.filter(v=>v!==code))}/>{label}</label>)}</div></details>
          <details className="fx-pick-edit"><summary><span>Anything to avoid?<small>{avoid.length?`${avoid.length} selected`:'None selected'}</small></span><ChevronDown size={18} aria-hidden="true"/></summary>{concerns.map(([id,label])=><label className="fx-check" key={id}><input type="checkbox" checked={avoid.includes(id)} onChange={e=>setAvoid(e.target.checked?[...avoid,id]:avoid.filter(v=>v!==id))}/>{label}</label>)}</details>
          <details className="fx-pick-edit"><summary>Anything else in mind?<ChevronDown size={18} aria-hidden="true"/></summary><label className="fx-pick-select">Optional request<input type="text" maxLength={300} value={request} onChange={e=>setRequest(e.target.value)} placeholder="A clever mystery with a little humour"/></label></details>
        </>}
      </fieldset>}
    </div>
    <footer className="fx-pick-footer">{error&&<ErrorState message={error}/>} {busy&&<p role="status">Checking your taste, time and viewing options…</p>}
      <div className="fx-pick-footer-main"><button type="button" className="fx-button" disabled={busy||services.busy} onClick={back}>{step||results?<ArrowLeft size={17} aria-hidden="true"/>:null}{results?'Preferences':step?'Back':'Cancel'}</button>
      {!results?<button type="button" className="fx-button fx-primary" disabled={busy||services.editing||services.busy||(step===1&&!valid)} onClick={()=>step===0?setStep(1):void find()}><Sparkles size={18} aria-hidden="true"/>{step===0?'Continue':busy?'Finding your picks…':solo?'Find my film':'Find our film'}</button>:selected?<button type="button" className="fx-button fx-primary" disabled={busy} onClick={()=>solo?onChoose(selected.film):setPlanFilm(selected.film)}>{solo?'View film':'Make a Watch Plan'}{solo?<ArrowRight size={18} aria-hidden="true"/>:<CalendarPlus size={18} aria-hidden="true"/>}</button>:<button type="button" className="fx-button fx-primary" disabled={busy} onClick={()=>void find()}>Try again</button>}</div>
      {results&&selected&&<div className="fx-pick-pass"><button type="button" className="fx-button" disabled={busy} onClick={()=>deck.queue.length?setDeck(passPick(deck)):void find(true)}>{busy?'Finding different films…':'Not tonight'}</button>{deck.passed.length>0&&<button type="button" className="fx-text-button" disabled={busy} onClick={()=>setDeck(undoPick(deck))}>Undo</button>}</div>}
    </footer>
  </Sheet>;
}
