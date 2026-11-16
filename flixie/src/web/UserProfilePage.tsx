import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpDown, Check, Image, LockKeyhole, Pencil, Plus, ShieldCheck, Trash2, Users } from 'lucide-react';
import { useSession } from './auth';
import { Avatar, Empty, ErrorState, Link, Loading, Poster, Sheet } from './components';
import { errorMessage, useLoad } from './hooks';
import { viewDate, type Film, type MediaKind } from './models';
import { PersonImage } from './PersonPage';
import { personPath, profilePath, titlePath } from './routing';
import { AvatarEditor, ProfileEditor } from './ProfileEditors';
import FavouriteRankingEditor from './FavouriteRankingEditor';
import FavouriteSearch from './FavouriteSearch';
import './favourite-membership.css';
import { badgeLabels, type ProfilePost, type UserProfile } from './userProfiles';
import './user-profile.css';

function FavouriteRail({ title, kind, items, onRank, onAdd, onRemove, removing }: {title:string;kind:MediaKind;items:Film[];onRank?:()=>void;onAdd?:()=>void;onRemove?:(film:Film)=>void;removing:string|null}) {
  if(!items.length&&!onAdd)return null;
  return <section className="fx-profile-section"><div className="fx-profile-favourite-heading"><h2>{title}</h2><div className="fx-profile-favourite-tools">{onRank&&items.length>1&&<button type="button" className="fx-button" disabled={removing!==null} onClick={onRank} aria-label={`Rank favourite ${kind==='movie'?'films':'shows'}`}><ArrowUpDown size={16} aria-hidden="true"/>Edit ranking</button>}{onAdd&&<button type="button" className="fx-button" onClick={onAdd} disabled={removing!==null}><Plus size={17} aria-hidden="true"/>Add {kind==='movie'?'films':'shows'}</button>}</div></div>
    {items.length?<div className="fx-profile-posters">{items.map((film,index)=><div className="fx-profile-favourite-item" key={`${film.kind}:${film.id}`}><Link to={titlePath(film.id,film.kind)} className="fx-profile-film"><Poster film={film}/><strong>{index+1}. {film.title}</strong><small>{film.releaseDate.slice(0,4)}</small></Link>{onRemove&&<button type="button" className="fx-text-button fx-profile-remove-favourite" aria-label={`Remove ${film.title} from favourites`} disabled={removing!==null} onClick={()=>onRemove(film)}><Trash2 size={15} aria-hidden="true"/>{removing===`${film.kind}:${film.id}`?'Removing…':'Remove'}</button>}</div>)}</div>:<p className="fx-muted">No favourite {kind==='movie'?'films':'shows'} yet. Add a few to make this profile yours.</p>}
  </section>;
}
function ProfileLibrary({profile,onRank,onAdd,onRemove,removing}:{profile:UserProfile;onRank?:(kind:MediaKind)=>void;onAdd?:(kind:MediaKind)=>void;onRemove?:(film:Film)=>void;removing:string|null}) {
  return <>
    {!profile.detailsVisible?<Empty title="Profile details aren’t shared here">This member shares their reviews. Their bio and favourites are private.</Empty>:<>
      <FavouriteRail title="Favourite films" kind="movie" items={profile.movies} onRank={onRank?()=>onRank('movie'):undefined} onAdd={onAdd?()=>onAdd('movie'):undefined} onRemove={onRemove} removing={removing}/>
      <FavouriteRail title="Favourite TV" kind="show" items={profile.shows} onRank={onRank?()=>onRank('show'):undefined} onAdd={onAdd?()=>onAdd('show'):undefined} onRemove={onRemove} removing={removing}/>
      {profile.people.length>0&&<section className="fx-profile-section"><h2>Favourite people</h2><div className="fx-profile-people">{profile.people.map(person=><Link key={person.id} to={personPath(person.id)}><div className="fx-profile-person-art"><PersonImage key={person.portrait} path={person.portrait} alt={person.name}/></div><strong>{person.name}</strong><small>{person.department}</small></Link>)}</div></section>}
      {!onAdd&&!profile.movies.length&&!profile.shows.length&&!profile.people.length&&<Empty title="No favourites shared yet">Their favourite films, TV and people will appear here when added.</Empty>}
    </>}
    {profile.genres.length>0&&<section className="fx-profile-section"><h2>Favourite genres</h2><div className="fx-profile-badges">{profile.genres.map(genre=><span key={genre}>{genre}</span>)}</div></section>}
    {profile.relationship==='self'&&<div className="fx-profile-library-links"><Link className="fx-button" to="/app/diary">Your film diary<ArrowRight size={16}/></Link><Link className="fx-button" to="/app/watchlist">Your watchlist<ArrowRight size={16}/></Link></div>}
  </>;
}
const verbs:Record<string,string>={watched_movie:'Watched',watched_show:'Watched',movie_rating:'Rated',show_rating:'Rated',movie_review:'Reviewed',show_review:'Reviewed',watchlist_movie:'Added to watchlist',watchlist_show:'Added to watchlist',favorite_movie:'Favourited',favorite_show:'Favourited'};
function ProfilePostRow({post,reviews}:{post:ProfilePost;reviews:boolean}) {
  const reviewBody=<>{post.title&&<h3>{post.title}</h3>}<p>{post.body}</p></>;
  return <article className="fx-profile-post">
    <Link to={titlePath(post.film.id,post.film.kind)} className="fx-profile-post-art" aria-label={`View ${post.film.title}`}><Poster film={post.film}/></Link>
    <div className="fx-profile-post-copy"><div className="fx-profile-post-title"><h2><Link to={titlePath(post.film.id,post.film.kind)}>{post.film.title}</Link></h2>{post.rating!==null&&<span className="fx-score">{post.rating}<small>/10</small></span>}</div>
      <p className="fx-small fx-muted">{reviews?'Reviewed':verbs[post.type]||'Updated'} · {post.film.kind==='movie'?'Film':'TV'} · <time dateTime={post.createdAt}>{viewDate(post.createdAt)}</time></p>
      {reviews&&(post.containsSpoilers?<details className="fx-profile-spoiler"><summary>Contains spoilers · Show review</summary>{reviewBody}</details>:<div className="fx-profile-review-body">{reviewBody}</div>)}
    </div>
  </article>;
}
function ProfileFeed({id,reviews}:{id:string;reviews:boolean}) {
  const {api}=useSession(), active=useRef(true);
  const first=useLoad(`profile-feed:${id}:${reviews}`,signal=>api.profileSection(id,reviews?'reviews':'activity',null,signal));
  const [extra,setExtra]=useState<ProfilePost[]>([]),[next,setNext]=useState<string|null|undefined>(),[busy,setBusy]=useState(false),[error,setError]=useState('');
  useEffect(()=>{active.current=true;return ()=>{active.current=false;};},[]);
  const cursor=next===undefined?first.data?.nextCursor:next;
  async function more(){if(!cursor||busy)return;setBusy(true);setError('');try{
    const page=await api.profileSection(id,reviews?'reviews':'activity',cursor);
    if(!active.current)return;
    if(page.nextCursor===cursor)throw new Error('More entries could not be loaded. Try again.');
    setExtra(items=>[...items,...page.items]);setNext(page.nextCursor);
  }catch(e){if(active.current)setError(errorMessage(e));}finally{if(active.current)setBusy(false);}}
  if(first.loading)return <Loading layout="posterRows" label={reviews?'Loading reviews…':'Loading activity…'}/>;
  if(first.error)return <ErrorState message={first.error} retry={first.retry}/>;
  const items=[...new Map([...(first.data?.items??[]),...extra].map(post=>[`${post.type}:${post.id}`,post])).values()];
  return <section className="fx-profile-section" aria-label={reviews?'Reviews':'Activity'}>{items.length?items.map(post=><ProfilePostRow key={`${post.type}:${post.id}`} post={post} reviews={reviews}/>):<Empty title={reviews?'No reviews yet':'No activity yet'}>{reviews?'Written film and TV reviews will appear here.':'Films and TV added, watched and rated will appear here.'}</Empty>}{error&&<p role="alert" className="fx-form-error">{error}</p>}{cursor&&<button className="fx-button" disabled={busy} onClick={()=>void more()}>{busy?'Loading…':error?'Try loading more again':reviews?'More reviews':'More activity'}<ArrowRight size={16}/></button>}</section>;
}
export default function UserProfilePage({id='me',revision}:{id?:string;revision:number}) {
  const {api,user}=useSession();
  const result=useLoad(`user-profile:${user!.id}:${id}:${revision}`,signal=>api.userProfile(id,signal));
  const [tab,setTab]=useState<'library'|'activity'|'reviews'>('library'),[editor,setEditor]=useState<'profile'|'avatar'|'border'|null>(null),[badge,setBadge]=useState('');
  const [ranking,setRanking]=useState<MediaKind|null>(null),[rankingSaved,setRankingSaved]=useState('');
  const [adding,setAdding]=useState<MediaKind|null>(null),[removing,setRemoving]=useState<string|null>(null),[favouriteError,setFavouriteError]=useState('');
  const removingLock=useRef(false);
  async function removeFavourite(film:Film){
    if(removingLock.current||!user)return;
    removingLock.current=true;setRemoving(`${film.kind}:${film.id}`);setFavouriteError('');setRankingSaved('');
    try{await api.setFavourite(user.externalId,user.id,film.kind,film.id,false);setRankingSaved(`${film.title} removed from favourites.`);result.retry();}
    catch(e){setFavouriteError(errorMessage(e));}
    finally{removingLock.current=false;setRemoving(null);}
  }
  if(result.loading)return <Loading layout="profile" label="Loading profile…"/>;
  if(result.error||!result.data)return <><Link className="fx-text-button" to="/app/friends"><ArrowLeft size={16}/>Your friends</Link><ErrorState message={result.error||'This profile is unavailable.'} retry={result.retry}/></>;
  const profile=result.data, self=profile.relationship==='self';
  function closeEditor(){setEditor(null);result.retry();}
  return <div className="fx-user-profile">
    {!self&&<Link className="fx-text-button fx-profile-back" to="/app/friends"><ArrowLeft size={16}/>Your friends</Link>}
    <header className="fx-profile-header"><div className="fx-profile-identity"><Avatar large person={profile}/><div><h1>{profile.firstName||profile.username}</h1><p className="fx-muted">@{profile.username}</p><p className="fx-small fx-muted">{profile.createdAt?`Member since ${new Date(profile.createdAt).toLocaleDateString('en-GB',{month:'short',year:'numeric'})}`:''}</p></div></div>
      {self?<div className="fx-profile-actions"><button className="fx-button" onClick={()=>setEditor('profile')}><Pencil size={16}/>Edit profile</button><button className="fx-button" onClick={()=>setEditor('avatar')}><Image size={16}/>Change avatar</button><button className="fx-text-button" onClick={()=>setEditor('border')}><ShieldCheck size={16}/>Avatar border</button></div>:<p className="fx-profile-relationship">{profile.relationship==='friend'?<><Check size={16}/>Friends</>:<><Users size={16}/>Community member</>}</p>}
    </header>
    <div className="fx-profile-badges">{profile.profileBadges.filter(key=>badgeLabels[key]&&key!=='BORDER_CHRISTMAS_LIGHTS').map(key=><button type="button" key={key} onClick={()=>setBadge(key)}>{badgeLabels[key]}</button>)}</div>
    {profile.bio&&<p className="fx-profile-bio">{profile.bio}</p>}
    {self&&<p className="fx-profile-privacy"><LockKeyhole size={15}/>{profile.sharing?'Your reviews are shared with the community.':'Your activity and reviews are shared with friends.'} Sharing settings are managed in the app.</p>}
    {profile.stats&&<dl className="fx-profile-totals">{[[profile.stats.films,'Films watched'],[profile.stats.shows,'TV watched'],[profile.stats.watchlist,'On watchlist'],[profile.stats.ratings,'Ratings'],[profile.stats.reviews,'Reviews']].map(([count,label])=><div key={label}><dt>{label}</dt><dd>{count}</dd></div>)}</dl>}
    <nav className="fx-profile-tabs" aria-label="Profile sections">{([['library','Favourites'],...(profile.activityVisible?[['activity','Activity']]:[]),['reviews','Reviews']] as [typeof tab,string][]).map(([key,label])=><button type="button" key={key} aria-pressed={tab===key} onClick={()=>setTab(key)}>{label}</button>)}</nav>
    {rankingSaved&&<p role="status" className="fx-ranking-saved">{rankingSaved}</p>}
    {favouriteError&&<p role="alert" className="fx-form-error">{favouriteError}</p>}
    {tab==='library'?<ProfileLibrary profile={profile} onRank={self?kind=>{setRankingSaved('');setRanking(kind);}:undefined} onAdd={self?setAdding:undefined} onRemove={self?film=>void removeFavourite(film):undefined} removing={removing}/>:<ProfileFeed key={`${profile.id}:${tab}`} id={profile.id} reviews={tab==='reviews'}/>}
    {adding&&self&&<FavouriteSearch key={`${profile.id}:${adding}`} kind={adding} onClose={()=>setAdding(null)} onAdded={()=>{setAdding(null);setRankingSaved('Added to your favourites.');result.retry();}}/>}
    {ranking&&self&&<FavouriteRankingEditor key={`${profile.id}:${ranking}`} kind={ranking} onClose={()=>setRanking(null)} onSaved={()=>{setRankingSaved(`Favourite ${ranking==='movie'?'film':'show'} order saved.`);setRanking(null);result.retry();}}/>}
    {editor==='profile'&&self&&<ProfileEditor profile={profile} onClose={closeEditor}/>}
    {(editor==='avatar'||editor==='border')&&self&&<AvatarEditor profile={profile} borders={editor==='border'} onClose={closeEditor}/>}
    {badge&&<Sheet title={badgeLabels[badge]} onClose={()=>setBadge('')}><p>This badge belongs to {self?'your account':`@${profile.username}`}. Avatar borders use that member’s own earned badges and chosen border.</p>{self&&<button className="fx-button" onClick={()=>{setBadge('');setEditor('border');}}>Choose your border</button>}</Sheet>}
  </div>;
}
