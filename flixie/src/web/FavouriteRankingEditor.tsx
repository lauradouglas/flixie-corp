import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useSession } from './auth';
import { ApiError } from './api';
import { Empty, ErrorState, Loading, Poster, Sheet } from './components';
import { errorMessage } from './hooks';
import type { MediaKind } from './models';
import { moveFavourite, rankingChanged, type RankedFavourite } from './favouriteRanking';
import './favourite-ranking.css';

export default function FavouriteRankingEditor({ kind, onClose, onSaved }: {
  kind: MediaKind; onClose: () => void; onSaved: () => void;
}) {
  const { api, user } = useSession();
  const owner = useRef({ uid: user!.externalId, id: user!.id });
  const active = useRef(true), saving = useRef(false), request = useRef(0);
  const [original, setOriginal] = useState<RankedFavourite[]>([]), [items, setItems] = useState<RankedFavourite[]>([]);
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [error, setError] = useState(''), [conflict, setConflict] = useState(false), [announcement, setAnnouncement] = useState('');
  const rows = useRef(new Map<string, HTMLLIElement>());
  const label = kind === 'movie' ? 'films' : 'shows';
  async function load(signal?: AbortSignal) {
    const ticket = ++request.current;
    setLoading(true); setError(''); setConflict(false);
    try {
      const values = await api.favouriteRanking(owner.current.uid, owner.current.id, kind, signal);
      if (active.current && ticket === request.current) { setOriginal(values); setItems(values); setAnnouncement(''); }
    } catch (e) { if (active.current && ticket === request.current && !signal?.aborted) setError(errorMessage(e)); }
    finally { if (active.current && ticket === request.current) setLoading(false); }
  }
  useEffect(() => {
    active.current = true;
    const controller = new AbortController(); void load(controller.signal);
    return () => { active.current = false; controller.abort(); };
  }, []);
  function move(from: number, to: number) {
    if (saving.current) return;
    const next = moveFavourite(items, from, to);
    if (next === items) return;
    setItems(next); setAnnouncement(`${items[from].film.title} is now number ${to + 1} of ${items.length}.`);
    const id = items[from].id, direction = to < from ? 'up' : 'down';
    requestAnimationFrame(() => {
      const row = rows.current.get(id);
      const preferred = row?.querySelector<HTMLButtonElement>(`button[data-direction="${direction}"]:not(:disabled)`);
      (preferred ?? row?.querySelector<HTMLButtonElement>('button:not(:disabled)'))?.focus();
    });
  }
  async function save() {
    if (saving.current || !rankingChanged(original, items) || conflict) return;
    saving.current = true; setBusy(true); setError('');
    try {
      await api.saveFavouriteRanking(owner.current.uid, owner.current.id, kind, items);
      if (active.current) onSaved();
    } catch (e) {
      if (active.current) { setError(errorMessage(e)); setConflict(e instanceof ApiError && e.code === 'FAVOURITES_CHANGED'); }
    } finally { saving.current = false; if (active.current) setBusy(false); }
  }
  return <Sheet title={`Rank favourite ${label}`} presentation="modal" className="fx-ranking-modal" onClose={onClose} dismissible={!busy}>
    <div className="fx-ranking-content">
      <p className="fx-ranking-intro">Your favourites, in your order. Use the arrows to move a title.</p>
      {loading ? <Loading layout="posterRows" label="Loading your favourites…" /> : error && !items.length ? <ErrorState message={error} retry={() => void load()} /> : !items.length ? <Empty title={`No favourite ${label} yet`}>Add favourites in Flixie and they’ll appear here.</Empty> : <>
        {items.length === 1 && <p className="fx-ranking-help">Add another favourite to change their order.</p>}
        <ol className="fx-ranking-list" aria-label={`Favourite ${label} ranking`}>
          {items.map((item, index) => <li key={item.id} ref={element => { if (element) rows.current.set(item.id, element); else rows.current.delete(item.id); }}>
            <span className="fx-ranking-number" aria-hidden="true">{index + 1}</span>
            <Poster film={item.film} />
            <div className="fx-ranking-title"><strong>{item.film.title}</strong>{item.film.releaseDate && <small>{item.film.releaseDate.slice(0, 4)}</small>}</div>
            <div className="fx-ranking-moves">
              <button type="button" className="fx-icon-button" data-direction="up" aria-label={`Move ${item.film.title} up`} title="Move up" disabled={busy || conflict || index === 0} onClick={() => move(index, index - 1)}><ArrowUp size={19} aria-hidden="true" /></button>
              <button type="button" className="fx-icon-button" data-direction="down" aria-label={`Move ${item.film.title} down`} title="Move down" disabled={busy || conflict || index === items.length - 1} onClick={() => move(index, index + 1)}><ArrowDown size={19} aria-hidden="true" /></button>
            </div>
          </li>)}
        </ol>
      </>}
      {error && items.length > 0 && <div className="fx-ranking-error"><p role="alert">{error}</p><button type="button" className="fx-text-button" disabled={busy} onClick={() => void load()}>Reload favourites</button></div>}
      <p className="fx-sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
    </div>
    <div className="fx-ranking-footer">
      <button type="button" className="fx-button" onClick={onClose} disabled={busy}>Cancel</button>
      <button type="button" className="fx-button fx-primary" disabled={loading || busy || conflict || items.length < 2 || !rankingChanged(original, items)} onClick={() => void save()}>{busy ? 'Saving…' : 'Save ranking'}</button>
    </div>
  </Sheet>;
}
