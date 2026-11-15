import { useEffect, useState } from 'react';
import { imageUrl, movieMeta, text, type Film } from './models';

/** Only real landscape artwork is used; a missing backdrop leaves the app ground. */
export function TitleArtwork({ film }: { film: Film }) {
  const path = text(film.raw.backdropPath) || text(film.raw.backdropUrl) || text(film.raw.backdrop_path);
  const src = imageUrl(path, 'w1280');
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) return null;
  return <picture className="fx-title-artwork" aria-hidden="true">
    <source media="(max-width: 680px), (max-width: 960px) and (max-height: 500px) and (pointer: coarse)" srcSet={src}/>
    <img src={src} loading="lazy" alt="" width={1280} height={720} onError={() => setFailed(true)}/>
  </picture>;
}

export function TitleMetadata({ film }: { film: Film }) {
  return <div className="fx-title-metadata">
    <p className="fx-muted">{movieMeta({ ...film, genres: [] })}</p>
    {film.genres.length > 0 && <p className="fx-title-genres" aria-label="Genres">{film.genres.map(genre => <span key={genre}>{genre}</span>)}</p>}
  </div>;
}
