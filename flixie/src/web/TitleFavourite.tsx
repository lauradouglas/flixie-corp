import { useRef, useState } from 'react';
import { Heart } from 'lucide-react';
import { useSession } from './auth';
import { useLoad, errorMessage } from './hooks';
import { Link } from './components';
import type { Film } from './models';
import type { PageActions } from './pages';
import './favourite-membership.css';

export default function TitleFavourite({ film, actions, revision }: { film: Film; actions: PageActions; revision: number }) {
  const { api, user } = useSession();
  const loading = useLoad(`favourite:${user?.externalId ?? 'guest'}:${film.kind}:${film.id}:${revision}`,
    signal => user ? api.favouriteRanking(user.externalId, user.id, film.kind, signal) : Promise.resolve([]));
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const lock = useRef(false), active = useRef(user?.externalId);
  active.current = user?.externalId;
  const enabled = (loading.data ?? []).some(item => item.film.id === film.id);
  async function toggle() {
    if (!user) { actions.open({ type: 'login' }); return; }
    if (lock.current || loading.loading || loading.error) return;
    const owner = user.externalId;
    lock.current = true; setBusy(true); setError('');
    try {
      await api.setFavourite(owner, user.id, film.kind, film.id, !enabled);
      if (active.current !== owner) return;
      actions.toast(enabled ? 'Removed from your favourites' : 'Added to your favourites');
      actions.refresh(); loading.retry();
    } catch (e) { if (active.current === owner) { setError(errorMessage(e)); loading.retry(); } }
    finally { lock.current = false; if (active.current === owner) setBusy(false); }
  }
  return <>
    <button type="button" className={`fx-button fx-title-favourite ${enabled ? 'fx-soft' : 'fx-title-secondary'}`}
      aria-pressed={enabled} aria-label={enabled ? `Remove ${film.title} from favourites` : `Add ${film.title} to favourites`}
      disabled={busy || Boolean(user && (loading.loading || loading.error))} onClick={() => void toggle()}>
      <Heart size={18} fill={enabled ? 'currentColor' : 'none'} aria-hidden="true" /><span className="fx-title-desktop-label">{busy ? 'Saving…' : enabled ? 'Favourited' : 'Favourite'}</span><span className="fx-title-mobile-label">{busy ? 'Saving…' : 'Favourite'}</span>
    </button>
    {(error || (user && loading.error)) && <div className="fx-favourite-feedback"><p role="alert">{error || loading.error}</p>
      <button type="button" className="fx-text-button" onClick={() => { setError(''); loading.retry(); }} disabled={busy}>Reload favourites</button>
      <Link to="/app/profile" className="fx-text-button">Your favourites</Link>
    </div>}
  </>;
}
