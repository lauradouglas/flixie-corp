import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Heart, Search } from 'lucide-react';
import { useSession } from './auth';
import { Empty, ErrorState, Loading, Poster, Sheet } from './components';
import { useLoad, errorMessage } from './hooks';
import type { Film, MediaKind } from './models';
import './favourite-membership.css';

export default function FavouriteSearch({ kind, onClose, onAdded }: { kind: MediaKind; onClose: () => void; onAdded: () => void }) {
  const { api, user } = useSession();
  const owner = useRef({ uid: user!.externalId, id: user!.id }), active = useRef(true), lock = useRef(false);
  const [input, setInput] = useState(''), [query, setQuery] = useState(''), [busy, setBusy] = useState<number | null>(null), [error, setError] = useState('');
  const favourites = useLoad(`add-favourite:${owner.current.uid}:${kind}`, signal => api.favouriteRanking(owner.current.uid, owner.current.id, kind, signal));
  const results = useLoad(`favourite-search:${kind}:${query}`, async signal => query ? (await api.search(query, signal)).filter(item => item.kind === kind) : []);
  function submit(event: FormEvent) { event.preventDefault(); setQuery(input.trim()); }
  async function add(film: Film) {
    if (lock.current) return;
    lock.current = true; setBusy(film.id); setError('');
    try { await api.setFavourite(owner.current.uid, owner.current.id, kind, film.id, true); if (active.current) onAdded(); }
    catch (e) { if (active.current) { setError(errorMessage(e)); favourites.retry(); } }
    finally { lock.current = false; if (active.current) setBusy(null); }
  }
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  const label = kind === 'movie' ? 'films' : 'shows';
  return <Sheet title={`Add favourite ${label}`} presentation="modal" className="fx-favourite-search-modal" dismissible={busy === null} onClose={onClose}>
    <div className="fx-favourite-search-content">
      <p className="fx-muted">Choose up to 10 favourite {label}. New favourites go at the end of your ranking.</p>
      <form onSubmit={submit} className="fx-favourite-search-form"><label htmlFor="fx-favourite-search">Search {label}</label><div><input id="fx-favourite-search" type="search" value={input} onChange={e => setInput(e.target.value)} placeholder={kind === 'movie' ? 'Try Alien or Interstellar' : 'Try Breaking Bad or The Newsroom'} disabled={busy !== null}/><button className="fx-button" type="submit" disabled={!input.trim() || busy !== null}><Search size={18} aria-hidden="true"/>Search</button></div></form>
      {error && <p role="alert" className="fx-form-error">{error}</p>}
      {favourites.error ? <ErrorState message={favourites.error} retry={favourites.retry}/> : results.loading && query ? <Loading layout="posterRows" label="Searching…"/> : results.error ? <ErrorState message={results.error} retry={results.retry}/> : query && !results.data?.length ? <Empty title={`No ${label} found`}>Try another title or check the spelling.</Empty> : <ul className="fx-favourite-search-results">{results.data?.map(film => {
        const saved = favourites.data?.some(item => item.film.id === film.id);
        return <li key={film.id}><Poster film={film}/><div><strong>{film.title}</strong><small>{film.releaseDate.slice(0,4)}</small></div><button type="button" className={`fx-button ${saved ? 'fx-soft' : ''}`} disabled={favourites.loading || busy !== null || saved} aria-label={`Add ${film.title} to favourites`} onClick={() => void add(film)}><Heart size={17} aria-hidden="true"/>{busy === film.id ? 'Saving…' : saved ? 'Favourited' : 'Add'}</button></li>;
      })}</ul>}
    </div>
    <div className="fx-ranking-footer"><button type="button" className="fx-button" onClick={onClose} disabled={busy !== null}>Done</button></div>
  </Sheet>;
}
