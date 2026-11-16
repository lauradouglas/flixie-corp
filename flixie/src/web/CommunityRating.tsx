import { Info, Star } from 'lucide-react';
import { useState } from 'react';
import { Sheet } from './components';
import type { Film } from './models';

export function ratingExplanation(film: Film) {
  if (film.scoreSource === 'Flixie') return 'This is the average from Flixie members. We show it once at least 20 people have rated this title.';
  return 'This is the wider community score supplied by TMDB. Flixie also shares ratings with TMDB, so the wider audience can include Flixie members. Once 20 people have rated this title on Flixie, we show the Flixie community average. Rating updates can take time to appear.';
}
export default function CommunityRating({ film, compactOnMobile = false, pending = false }: { film: Film; compactOnMobile?: boolean; pending?:boolean }) {
  const [info, setInfo] = useState(false);
  return <div className={`fx-rating-block${compactOnMobile ? ' fx-title-rating' : ''}`}>
    {pending ? <div className="fx-rating-pending" role="status" aria-label="Loading community rating"><span aria-hidden="true"/></div> : film.score !== null && film.scoreSource ? <>
      <div className="fx-rating-main">
        <div className="fx-rating-number"><Star className="fx-title-rating-star" size={17} fill="currentColor" aria-hidden="true"/>{film.score.toFixed(1)}<small>/10</small></div>
        <div><strong>Community rating</strong>{film.scoreCount > 0 && <p className="fx-small fx-muted">{film.scoreCount.toLocaleString('en-GB')} ratings</p>}</div>
      </div>
      {compactOnMobile && <button type="button" className="fx-title-rating-info" aria-label={`About the community rating for ${film.title}`} onClick={() => setInfo(true)}><Info size={19} aria-hidden="true"/></button>}
      <details className="fx-rating-info"><summary><Info size={17} aria-hidden="true"/><span>About this rating</span></summary><p>{ratingExplanation(film)}</p></details>
    </> : <p className="fx-muted">No rating yet.</p>}
    {info && <Sheet title="About this rating" onClose={() => setInfo(false)}><p className="fx-rating-explanation">{ratingExplanation(film)}</p><p className="fx-small fx-muted">{film.scoreCount.toLocaleString('en-GB')} ratings</p></Sheet>}
  </div>;
}
