import {useEffect,useState} from 'react';
import {ArrowRight,ArrowUpRight,BookmarkPlus,Clapperboard,Flame,Globe,Smile} from 'lucide-react';
import Footer from '../components/Footer';
import WebsiteAnalyticsChoice from '../components/WebsiteAnalyticsChoice';
import {useSession} from './auth';
import {Link,Poster,Loading} from './components';
import {useLoad} from './hooks';
import {useBrowseCountry} from './browseCountry';
import {discoveryCountries,discoveryCountry,discoverySnapshot,discoveryYear} from './publicDiscovery';
import PublicBrowseHeader from './PublicBrowseHeader';
import type {Film} from './models';
import type {PageActions} from './pages';
import {titlePath} from './routing';

type Feed={data?:Film[];loading:boolean;error:string;retry:()=>void};
const pickHref=(mood='tonight',member=false)=>member?'/app?pick='+mood:'/app/sign-in?next='+encodeURIComponent('/app?pick='+mood);
const browseSnapshotDate=new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(discoverySnapshot.updatedAt+'T12:00:00Z'));

function DiscoveryCard({film,onSave}:{film:Film;onSave?:(film:Film)=>void}) {
  return <article className="fx-discovery-film"><div className="fx-discovery-art">
    <Link to={titlePath(film.id,film.kind)} aria-label={`View ${film.title}`}><Poster film={film}/></Link>
    {onSave?<button type="button" className="fx-discovery-save" aria-label={`Save ${film.title} to watchlist`} onClick={()=>onSave(film)}><BookmarkPlus size={18} aria-hidden="true"/></button>:
      <a href={`/app/sign-in?next=${encodeURIComponent(titlePath(film.id,film.kind))}`} className="fx-discovery-save" aria-label={`Sign in to save ${film.title}`}><BookmarkPlus size={18} aria-hidden="true"/></a>}
    </div><h3><Link to={titlePath(film.id,film.kind)}>{film.title}</Link></h3>
    <p>{[discoveryYear(film.releaseDate),film.kind==='movie'?'Film':'TV'].filter(Boolean).join(' · ')}</p>
  </article>;
}
function RefreshNote({feed,label,showSaved=true}:{feed?:Feed;label:string;showSaved?:boolean}) {
  return feed?.error?<div className="fx-discovery-refresh" role="status"><span>{label} could not be {showSaved?`refreshed. Showing saved selections from ${browseSnapshotDate}.`:"loaded."}</span><button type="button" className="fx-text-button" onClick={feed.retry}>Try again</button></div>:null;
}
export function PublicHomeContent({movies=discoverySnapshot.movies,shows=discoverySnapshot.shows,movieFeed,showFeed,cinema,region='GB',countryHint='',member=false,onRegion,onSave}: {
  movies?:Film[];shows?:Film[];movieFeed?:Feed;showFeed?:Feed;cinema?:Feed;region?:string;countryHint?:string;member?:boolean;onRegion?:(region:string)=>void;onSave?:(film:Film)=>void;
}) {
  const [expanded,setExpanded]=useState(false),[allFilms,setAllFilms]=useState(false),[allShows,setAllShows]=useState(false);
  useEffect(()=>setExpanded(false),[region]);
  const countryName=discoveryCountries.find(([id])=>id===region)?.[1]??'United Kingdom';
  return <>
    <nav className="fx-discovery-nav" aria-label="Explore Flixie"><a href="/" aria-current="page">Home</a><a href="#public-films">Films</a><a href="#public-shows">TV shows</a><a href="#public-cinema">In cinemas</a><span/><a href="/features">Features</a><a href="/about">About Flixie</a></nav>
    <div className="fx-discovery-intro"><div><h1>Your next good watch.</h1><p>Explore films and TV. Keep a watchlist, remember what you loved and make film nights happen.</p><label className="fx-discovery-country"><Globe size={18} aria-hidden="true"/><span>Country</span><select aria-label="Browsing country" value={region} onChange={e=>onRegion?.(e.target.value)}>{discoveryCountries.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>{countryHint&&<p className="fx-discovery-note" role="status">{countryHint}</p>}</div><div className="fx-discovery-join"><Link to={member?'/app':'/app/join?next=%2Fapp'} className="fx-button fx-primary">{member?'Your home':'Join Flixie'} <ArrowRight size={18} aria-hidden="true"/></Link><a href="/features" className="fx-text-button">See how it works</a></div></div>
    <section id="public-films" className="fx-discovery-section" aria-labelledby="public-films-heading"><div className="fx-discovery-heading"><h2 id="public-films-heading">Popular films</h2>{movies.length>6&&<button type="button" className="fx-text-button" aria-expanded={allFilms} onClick={()=>setAllFilms(value=>!value)}>{allFilms?'Show fewer films':'Explore films'} <ArrowRight size={17} aria-hidden="true"/></button>}</div>
      <p className="fx-discovery-note fx-discovery-region">Popular films for {countryName}</p><RefreshNote feed={movieFeed} label={`Popular films for ${countryName}`} showSaved={region===discoverySnapshot.region}/>
      {movies.length?<div className="fx-discovery-grid">{movies.slice(0,allFilms?12:6).map(f=><DiscoveryCard key={f.id} film={f} onSave={onSave}/>)}</div>:movieFeed?.loading?<Loading layout="discovery" label={`Loading popular films for ${countryName}…`}/>:!movieFeed?.error&&<p>No films are available right now.</p>}
    </section>
    <section id="public-cinema" className="fx-discovery-section" aria-labelledby="public-cinema-heading"><div className="fx-discovery-heading"><h2 id="public-cinema-heading">In cinemas</h2><span className="fx-discovery-note">{countryName}</span></div>
      {!cinema||cinema.loading?<Loading layout="cinema" label={`Checking cinema releases for ${countryName}…`}/>:cinema.error?<div className="fx-discovery-refresh" role="status"><span>Cinema releases could not be checked for {countryName}.</span><button type="button" className="fx-button" onClick={cinema.retry}>Try again</button></div>:!cinema.data?.length?<p className="fx-discovery-note">No current cinema releases are listed for {countryName}. Try another country.</p>:<>
        <div className="fx-discovery-cinema-list">{cinema.data.slice(0,expanded?12:3).map(f=><Link key={f.id} to={titlePath(f.id)} className="fx-discovery-cinema-card"><Poster film={f}/><span className="fx-discovery-cinema-copy"><strong>{f.title}</strong><span>{[discoveryYear(f.releaseDate),countryName].filter(Boolean).join(' · ')}</span><span className="fx-discovery-view">View film <ArrowUpRight size={16} aria-hidden="true"/></span></span></Link>)}</div>
        {cinema.data.length>3&&<button type="button" className="fx-text-button fx-discovery-more" aria-expanded={expanded} onClick={()=>setExpanded(value=>!value)}>{expanded?'Show fewer films':`See all ${cinema.data.length} cinema releases`} <ArrowRight size={17} aria-hidden="true"/></button>}
      </>}
      <p className="fx-discovery-note">Country listings from TMDB. Check local cinema showtimes.</p>
    </section>
    <section id="public-shows" className="fx-discovery-section" aria-labelledby="public-shows-heading"><div className="fx-discovery-heading"><h2 id="public-shows-heading">Find your next series</h2>{shows.length>4&&<button type="button" className="fx-text-button" aria-expanded={allShows} onClick={()=>setAllShows(value=>!value)}>{allShows?'Show fewer shows':'Explore TV'} <ArrowRight size={17} aria-hidden="true"/></button>}</div><RefreshNote feed={showFeed} label="Popular shows"/>
      <div className="fx-discovery-tv-layout"><div className="fx-discovery-shows-slot">{!shows.length&&showFeed?.loading?<Loading layout="shows" label="Loading popular shows…"/>:<div className="fx-discovery-grid fx-discovery-shows">{shows.slice(0,allShows?12:4).map(f=><DiscoveryCard key={f.id} film={f} onSave={onSave}/>)}{!shows.length&&<p>No shows are available right now.</p>}</div>}</div>
        <aside className="fx-discovery-pick"><div className="fx-discovery-pick-header"><h3>Can’t choose?<br/>We can.</h3><img src="/web/pip-hoodie.png" alt="Pip, Flixie’s mascot" width={68} height={90} loading="lazy"/></div><p>A film for your mood, your time and your people.</p><div className="fx-discovery-moods"><Link to={pickHref('laugh',member)}><Smile size={18} aria-hidden="true"/>Make me laugh</Link><Link to={pickHref('hooked',member)}><Flame size={18} aria-hidden="true"/>Get hooked</Link></div><Link to={pickHref('tonight',member)} className="fx-text-button"><Clapperboard size={18} aria-hidden="true"/>Pick for us tonight <ArrowRight size={18} aria-hidden="true"/></Link></aside>
      </div>
    </section>
  </>;
}
export function PublicHomeShell() {
  return <><PublicBrowseHeader returnTo="/"/><div className="fx-guest-layout"><main id="web-main" className="fx-main fx-discovery-main"><PublicHomeContent/></main></div><Footer year={new Date().getFullYear()} compact/><WebsiteAnalyticsChoice page="home" inline/></>;
}
export default function PublicHomePage({actions}:{actions:PageActions}) {
  const {api,user}=useSession();
  const {country:region,source,ready,chooseCountry}=useBrowseCountry();
  const movieFeed=useLoad(`public-popular-movies:${region}:${ready}`,signal=>ready?api.discovery('movie',signal,region):Promise.resolve(undefined));
  const showFeed=useLoad('public-popular-shows',signal=>api.discovery('show',signal));
  const cinema=useLoad(`public-cinema:${region}:${ready}`,signal=>ready?api.cinemaDiscovery(region,signal):Promise.resolve(undefined));
  const movies=movieFeed.data??(ready&&region===discoverySnapshot.region?discoverySnapshot.movies:[]);
  const hint=source==='loading'?'Choosing your country…':source==='account'?'Using your saved country.':source==='account-fallback'?'Your saved country is unavailable. Choose your country above.':source==='detected'?'Country estimated from your connection. You can change it.':source==='fallback'?'Country detection is unavailable. Choose your country above.':'';
  return <PublicHomeContent movies={movies} shows={showFeed.data??discoverySnapshot.shows} movieFeed={{...movieFeed,loading:!ready||movieFeed.loading}} showFeed={showFeed} cinema={{...cinema,loading:!ready||cinema.loading}} region={region} countryHint={hint} member={Boolean(user)} onRegion={chooseCountry} onSave={f=>void actions.save(f,true)}/>;
}
