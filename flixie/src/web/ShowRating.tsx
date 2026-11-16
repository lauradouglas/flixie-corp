import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Check } from 'lucide-react';
import { useSession } from './auth';
import { ErrorState, FilmMeta, Loading, Sheet } from './components';
import { errorMessage, useLoad } from './hooks';
import type { ShowRatingValue } from './api';
import type { Film } from './models';
import './watch-log.css';

export default function ShowRating({ film, onClose, onSaved }: { film: Film; onClose: () => void; onSaved: () => void }) {
  const { api, user } = useSession();
  const result = useLoad(`show-rating:${user?.externalId}:${film.id}`, signal => user
    ? api.showRating(user.externalId, user.id, film.id, signal) : Promise.resolve(null));
  const [busy, setBusy] = useState(false);
  if (!user) return null;
  return <Sheet title={`Rate ${film.title}`} description={<FilmMeta film={film}/>} presentation="modal" mobileFullScreen dismissible={!busy} onClose={onClose}>
    {result.loading ? <Loading layout="form" label="Loading your rating…"/> : result.error ? <ErrorState message={result.error} retry={result.retry}/> :
      <RatingForm film={film} initial={result.data ?? { rating: null, recommendation: 'neutral' }} onBusy={setBusy} onClose={onClose} onSaved={onSaved}/>}
  </Sheet>;
}

function RatingForm({ film, initial, onBusy, onClose, onSaved }: {
  film: Film; initial: ShowRatingValue; onBusy: (value: boolean) => void; onClose: () => void; onSaved: () => void;
}) {
  const { api, user } = useSession();
  const [rating, setRating] = useState(initial.rating), [recommendation, setRecommendation] = useState(initial.recommendation);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const active = useRef(true), lock = useRef(false), owner = useRef(user?.externalId);
  owner.current = user?.externalId;
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!user || rating === null || lock.current) return;
    const uid = user.externalId;
    lock.current = true; setBusy(true); onBusy(true); setError('');
    try {
      await api.rateShow(uid, user.id, film.id, rating, recommendation);
      if (active.current && owner.current === uid) onSaved();
    } catch (failure) {
      if (active.current && owner.current === uid) setError(errorMessage(failure));
    } finally {
      lock.current = false;
      if (active.current && owner.current === uid) { setBusy(false); onBusy(false); }
    }
  }
  return <form className="fx-watch-form" onSubmit={submit} aria-busy={busy}>
    <div className="fx-watch-content">
      <p className="fx-watch-status">Your rating for the overall series.</p>
      <fieldset className="fx-watch-rating" disabled={busy}>
        <legend>Your rating</legend>
        <output className="fx-watch-score" aria-live="polite" aria-label={rating === null ? 'No rating' : `${rating} out of 10`}>{rating ?? '—'}<small>/10</small></output>
        <div className="fx-watch-rating-grid">{Array.from({ length: 10 }, (_, index) => index + 1).map(value => <label key={value} className="fx-watch-rating-option">
          <input type="radio" name="show-rating" value={value} checked={rating === value} onChange={() => setRating(value)} aria-label={`Rate ${value} out of 10`}/><span>{value}</span>
        </label>)}</div>
        <div className="fx-watch-scale"><span>Not for me</span><span>Loved it</span></div>
      </fieldset>
      <div className="fx-watch-recommend"><p id="fx-show-recommend-label">Would you recommend it?</p><div role="group" aria-labelledby="fx-show-recommend-label">
        {([['recommend', 'Yes'], ['neutral', 'Not sure'], ['avoid', 'No']] as const).map(([value, label]) => <button key={value} type="button" className="fx-watch-choice" aria-pressed={recommendation === value} disabled={busy} onClick={() => setRecommendation(value)}>{label}</button>)}
      </div></div>
    </div>
    {error && <p className="fx-watch-error" role="alert">{error}</p>}
    <footer className="fx-watch-footer"><button className="fx-text-button" type="button" disabled={busy} onClick={onClose}>Cancel</button><button className="fx-button fx-primary" type="submit" disabled={busy || rating === null}><Check size={17} aria-hidden="true"/>{busy ? 'Saving…' : 'Save rating'}</button></footer>
  </form>;
}
