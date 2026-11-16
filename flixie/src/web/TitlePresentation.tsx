import { useEffect, useState } from 'react';
import type {ReactNode} from 'react';
import {ArrowRight, BookmarkPlus, Check, Heart, Share2, Star} from 'lucide-react';
import {titlePath} from './routing';
import { imageUrl, movieMeta, text, type Film } from './models';

/** Only real landscape artwork is used; a missing backdrop leaves the app ground. */
export function TitleArtwork({ film }: { film: Film }) {
  const path = text(film.raw.backdropPath) || text(film.raw.backdropUrl) || text(film.raw.backdrop_path);
  const src = imageUrl(path, 'w1280');
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) return null;
  return <picture className="fx-title-artwork" aria-hidden="true">
    <source media="(max-width: 680px), (max-width: 960px) and (max-height: 500px) and (pointer: coarse)" srcSet={imageUrl(path,'w780')}/>
    <img src={src} loading="lazy" alt="" width={1280} height={720} onError={() => setFailed(true)}/>
  </picture>;
}

/** The first HTML and hydrated guest view use the same action geometry. */
export function GuestTitleActions({film,onLogin,onSave,onShare}:{film:Film;onLogin?:()=>void;onSave?:()=>void;onShare?:()=>void}) {
  const signIn='/app/sign-in?next='+encodeURIComponent(titlePath(film.id,film.kind));
  const control=(className:string,content:ReactNode,action?:()=>void,label?:string)=>action?
    <button type="button" className={className} onClick={action} aria-label={label}>{content}</button>:
    <a className={className} href={signIn} aria-label={label}>{content}</a>;
  return <div className="fx-detail-actions">
    {control('fx-button fx-primary fx-title-primary fx-title-rate',<><Check size={18} className="fx-title-desktop-label" aria-hidden="true"/><Star size={20} className="fx-title-mobile-label" aria-hidden="true"/>{film.kind==='movie'?'Rate & review':'Rate'}</>,onLogin)}
    <div className="fx-title-secondary-actions">
      {control('fx-button fx-title-watchlist fx-primary fx-title-primary',<><BookmarkPlus size={18} aria-hidden="true"/><span className="fx-title-desktop-label">Save to watchlist</span><span className="fx-title-mobile-label">Watchlist</span></>,onSave,`Save ${film.title} to watchlist`)}
      {control('fx-button fx-title-favourite fx-title-secondary',<><Heart size={18} aria-hidden="true"/><span>Favourite</span></>,onLogin,`Add ${film.title} to favourites`)}
      <button type="button" className="fx-button fx-title-secondary fx-title-share" aria-label={`Share ${film.title}`} disabled={!onShare} onClick={onShare}><Share2 size={18} aria-hidden="true"/>Share</button>
    </div>
  </div>;
}
export function TitleAppLink({href='/download'}:{href?:string}) {
  return <a className="fx-text-button fx-open-app" href={href}>Open in the Flixie app<ArrowRight size={15}/></a>;
}

export function TitleMetadata({ film }: { film: Film }) {
  return <div className="fx-title-metadata">
    <p className="fx-muted">{movieMeta({ ...film, genres: [] })}</p>
    {film.genres.length > 0 && <p className="fx-title-genres" aria-label="Genres">{film.genres.map(genre => <span key={genre}>{genre}</span>)}</p>}
  </div>;
}
