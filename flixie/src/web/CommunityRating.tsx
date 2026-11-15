import { Info } from 'lucide-react';
import type { Film } from './models';

export function ratingExplanation(film: Film) {
  if (film.scoreSource === 'Flixie') return 'This is the average from Flixie members. We show it once at least 20 people have rated this title.';
  return 'This is the wider community score supplied by TMDB. Flixie also shares ratings with TMDB, so the wider audience can include Flixie members. Once 20 people have rated this title on Flixie, we show the Flixie community average. Rating updates can take time to appear.';
}
export default function CommunityRating({ film }: { film: Film }) {
  return <div className="fx-rating-block">
    {film.score !== null && film.scoreSource ? <>
      <div className="fx-rating-main">
        <div className="fx-rating-number">{film.score.toFixed(1)}<small>/10</small></div>
        <div><strong>Community rating</strong>{film.scoreCount > 0 && <p className="fx-small fx-muted">{film.scoreCount.toLocaleString('en-GB')} ratings</p>}</div>
      </div>
      <details className="fx-rating-info"><summary><Info size={17} aria-hidden="true"/><span>About this rating</span></summary><p>{ratingExplanation(film)}</p></details>
    </> : <p className="fx-muted">No rating yet.</p>}
  </div>;
}
