import { usePublicPageMetadata } from './publicPageMetadata';
import { titleMetadata } from '../titleMetadata';
import { InitialTitle } from "./PublicTitleShell";
import { CastSection, FriendsSection, PhotosSection } from "./TitleSections";
import { ProviderOverview } from "./ProviderOverview";
import { DiaryRow, DiaryViews } from "./Diary";
import { homeSavedFilms } from "./homeSelection";
import TitleFavourite from './TitleFavourite';
import CommunityRating from './CommunityRating';
import { GuestTitleActions, TitleAppLink, TitleArtwork, TitleMetadata } from './TitlePresentation';
import './community-rating.css';
import ShowSeasons from './ShowEpisodesSection';
import { useContext, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookmarkCheck,
  BookmarkPlus,
  Check,
  ChevronLeft,
  Clapperboard,
  Share2,
  Star,
} from "lucide-react";
import { useSession } from "./auth";
import {
  AvatarLink,
  Empty,
  ErrorState,
  FilmCard,
  FilmMeta,
  Link,
  Loading,
  Poster,
  SectionHeading,
} from "./components";
import { useLoad, errorMessage } from "./hooks";
import {
  film,
  list,
  number,
  object,
  text,
  viewDate,
  type Account,
  type Activity,
  type ContinuedShow,
  type DiaryEntry,
  type Film,
  type PublicReview,
} from "./models";
import { personPath, profilePath, titlePath } from "./routing";
import FriendManager from './FriendManager';
import { catalogTitles, catalogPath } from "../catalog";
import DownloadPrompt from "./DownloadPrompt";
import type { Action } from "./actions";
import { PlanCard } from "./WatchPlans";
import { sharedMediaOpenLink, sharedMediaStore } from "../mediaShare";
type Resource<T> = {
  data?: T;
  loading: boolean;
  error: string;
  retry: () => void;
};
export interface PageActions {
  open: (action: Action) => void;
  save: (film: Film, enabled: boolean) => Promise<void>;
  saved: (film: Film) => boolean;
  busyIds: Set<string>;
  refresh: () => void;
  toast: (message: string) => void;
}
export function Shelf({
  films,
  actions,
}: {
  films: Film[];
  actions: PageActions;
}) {
  return (
    <div className="fx-film-shelf">
      {films.map((f) => (
        <FilmCard
          key={`${f.kind}:${f.id}`}
          film={f}
          saved={actions.saved(f)}
          onSave={actions.save}
          busy={actions.busyIds.has(`${f.kind}:${f.id}`)}
        />
      ))}
    </div>
  );
}
function activityVerb(kind: string) {
  if (kind.includes("rating")) return "rated";
  if (kind.includes("watchlist")) return "saved";
  if (kind.includes("favorite")) return "favourited";
  if (kind.includes("review")) return "reviewed";
  if (kind.includes("watched")) return "watched";
  return "shared";
}
export function ActivityRows({ items }: { items: Activity[] }) {
  return (
    <div>
      {items
        .filter((item) => item.film)
        .map((item) => (
          <div className="fx-activity" key={`${item.kind}:${item.id}`}>
            <AvatarLink person={item.person} />
            <div>
              <p>
                <Link to={profilePath(item.person.id)} className="fx-profile-name-link"><strong>{item.person.username}</strong></Link>{" "}
                {activityVerb(item.kind)}{" "}
                <Link to={titlePath(item.film!.id, item.film!.kind)}>
                  <strong>{item.film!.title}</strong>
                </Link>
                {item.rating !== null && (
                  <span className="fx-score"> {item.rating}/10</span>
                )}
              </p>
              <time dateTime={item.createdAt}>{viewDate(item.createdAt)}</time>
            </div>
          </div>
        ))}
    </div>
  );
}
export function ContinueCard({
  show,
  actions,
  owner,
}: {
  show: ContinuedShow;
  actions: PageActions;
  owner: string;
}) {
  const { api } = useSession();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const detail = useLoad(`next:${owner}:${show.showId}:${show.watched}`, () =>
    api.showProgress(owner, show.showId),
  );
  const episodes = list(detail.data?.seasons)
    .flatMap((s) => list(object(s).episodes))
    .map(object)
    .filter((e) => (number(e.seasonNumber) ?? 0) > 0)
    .sort(
      (a, b) =>
        (number(a.seasonNumber) ?? 0) - (number(b.seasonNumber) ?? 0) ||
        (number(a.episodeNumber) ?? 0) - (number(b.episodeNumber) ?? 0),
    );
  const first = episodes.find((e) => object(e.userState).watched !== true);
  const airDate = text(first?.airDate).slice(0, 10),
    today = new Date().toLocaleDateString("en-CA");
  const next =
    first && /^\d{4}-\d{2}-\d{2}$/.test(airDate) && airDate <= today
      ? first
      : null;
  async function mark() {
    if (!next || busy) return;
    setBusy(true);
    setError("");
    try {
      await api.markEpisode(owner, show.showId, number(next.id)!);
      actions.refresh();
      actions.toast("Episode marked watched");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="fx-show-row">
        <Link className="fx-poster-button" to={titlePath(show.showId, "show")}>
          <Poster film={{ title: show.title, posterPath: show.posterPath }} />
        </Link>
        <div>
          <h3>
            <Link to={titlePath(show.showId, "show")}>{show.title}</Link>
          </h3>
          <p>
            {next
              ? `Next: S${next.seasonNumber} · E${next.episodeNumber}`
              : `${show.watched} of ${show.total} episodes watched`}
          </p>
          <progress
            value={show.watched}
            max={show.total || 1}
            aria-label={`${show.title} progress`}
          />
          {next && (
            <button className="fx-text-button" disabled={busy} onClick={mark}>
              <Check size={14} />
              {busy ? "Saving…" : "Mark watched"}
            </button>
          )}
        </div>
      </div>
      {error && <ErrorState message={error} />}
    </>
  );
}
export function HomePage({
  user,
  library,
  actions,
  revision,
}: {
  user: Account;
  library: Resource<Film[]>;
  actions: PageActions;
  revision: number;
}) {
  const { api } = useSession();
  // Each section can settle and recover without waiting for unrelated feeds.
  // Owner-scoped keys still discard responses from a previous account.
  const key = `${user.id}:${revision}`;
  const soon = useLoad(`home-soon:${key}`, () => api.watchSoon());
  const diary = useLoad(`home-diary:${key}`, () => api.diary(user.id, true));
  const shows = useLoad(`home-shows:${key}`, () => api.continued(user.id));
  const friends = useLoad(`home-friends:${key}`, () => api.friends(user.id));
  const planFeed = useLoad(`home-plans:${key}`, () => api.plans());
  const savedPreview = homeSavedFilms(soon.data, library.data),
    selected = savedPreview[0]?.film;
  const shelf = (library.data ?? []).filter(
    (f) => f.id !== selected?.id || f.kind !== selected?.kind,
  );
  const shown = (shelf.length >= 4 ? shelf : (library.data ?? [])).slice(0, 4);
  const plans = (planFeed.data ?? []).filter((p) => p.status !== "cancelled");
  return (
    <>
      <div className="fx-welcome">
        <div>
          <h1>Hello, {user.firstName || user.username}.</h1>
          <p>Your next film night starts here.</p>
          <Link to="/app/explore" className="fx-text-button">Explore films &amp; TV <ArrowRight size={17}/></Link>
        </div>
        <button
          className="fx-button fx-soft"
          onClick={() => actions.open({ type: "picker" })}
        >
          <Clapperboard size={18} />
          Pick for us tonight
        </button>
      </div>
      <div className="fx-home-columns">
        <div className="fx-primary-column">
          {(soon.loading || library.loading) && !selected ? (
            <Loading layout="saved" label="Loading your saved films…" />
          ) : selected ? (
            <section>
              <SectionHeading to="/app/watchlist" label="Your watchlist">Saved for another night</SectionHeading>
              <div className="fx-saved-preview">
                {savedPreview.map(({film: savedFilm, watchSoon}) => <article className="fx-soon" key={savedFilm.id}>
                  <Link className="fx-poster-button" to={titlePath(savedFilm.id)}><Poster film={savedFilm} /></Link>
                  <div className="fx-soon-copy">
                    {watchSoon && <span className="fx-label"><BookmarkCheck size={14} />Watch soon</span>}
                    <h3><Link to={titlePath(savedFilm.id)}>{savedFilm.title}</Link></h3>
                    <FilmMeta film={savedFilm} />
                    <div className="fx-button-row">
                      <button className="fx-button fx-primary" onClick={() => actions.open({type:"options",film:savedFilm})}>Watch options</button>
                      <button className="fx-button" onClick={() => actions.open({type:"log",film:savedFilm})}><Check size={17} />Log watch</button>
                    </div>
                  </div>
                </article>)}
              </div>
            </section>
          ) : library.error ? (
            <ErrorState message={library.error} retry={library.retry} />
          ) : (
            <Empty title="A good film night starts with a save">
              Search for a film above and add it to your watchlist.
            </Empty>
          )}
          {shown.length > 0 && (
            <section>
              <SectionHeading to="/app/watchlist">
                Waiting in your watchlist
              </SectionHeading>
              <Shelf films={shown} actions={actions} />
            </section>
          )}
          <div className="fx-home-evening">
          {(diary.loading || diary.error || diary.data?.[0]) && (
            <section>
              <SectionHeading to="/app/diary" label="Open diary">
                A recent film night
              </SectionHeading>
              {diary.loading ? <Loading layout="diary" count={1} label="Loading your recent film night…"/> : diary.error ? <ErrorState message="Your recent film night could not be loaded." retry={diary.retry}/> : diary.data?.[0] ? <DiaryRow entry={diary.data[0]} /> : null}
            </section>
          )}
          <section className="fx-picker">
            <div>
              <h2>Pick for us tonight</h2>
              <p>A film for your mood, your time and the people watching.</p>
              <button
                className="fx-text-button"
                onClick={() => actions.open({ type: "picker" })}
              >
                Choose tonight’s film
                <ArrowRight size={17} />
              </button>
            </div>
            <img src="/web/pip-hoodie.png" alt="Pip, Flixie’s mascot" />
          </section>
          </div>
        </div>
        <aside className="fx-rail">
          <section className="fx-rail-section">
            <h2>Continue watching</h2>
            {shows.data?.[0] ? (
              <ContinueCard
                show={shows.data[0]}
                actions={actions}
                owner={user.id}
              />
            ) : shows.error ? (
              <ErrorState
                message="TV progress could not be loaded."
                retry={shows.retry}
              />
            ) : shows.loading ? (
              <Loading layout="posterRows" count={1} label="Loading your shows…"/>
            ) : (
              <p className="fx-muted fx-rail-copy">
                Your shows will appear here when you start tracking episodes.
              </p>
            )}
          </section>
          <section className="fx-rail-section">
            <SectionHeading to="/app/friends" label="View all">
              Your people
            </SectionHeading>
            {friends.data?.length ? (
              <ActivityRows items={friends.data.slice(0, 3)} />
            ) : friends.error ? (
              <ErrorState
                message="Friends’ activity could not be loaded."
                retry={friends.retry}
              />
            ) : friends.loading ? <Loading layout="activity" label="Loading friends’ activity…"/> : (
              <p className="fx-muted fx-rail-copy">
                Your friends’ recent films will appear here.
              </p>
            )}
          </section>
          <section className="fx-rail-section">
            <SectionHeading to="/app/plans" label="View all">
              Your next Watch Plan
            </SectionHeading>
            {plans[0] ? (
              <PlanCard
                plan={plans[0]}
                onOpen={() =>
                  actions.open({
                    type: "plan",
                    plan: plans[0],
                  })
                }
              />
            ) : planFeed.error ? (
              <ErrorState
                message="Watch Plans could not be loaded."
                retry={planFeed.retry}
              />
            ) : planFeed.loading ? <Loading layout="posterRows" count={1} label="Loading your next Watch Plan…"/> : (
              <p className="fx-muted fx-rail-copy">
                No film nights planned yet.
              </p>
            )}
          </section>
        </aside>
      </div>
      <DownloadPrompt />
    </>
  );
}
export function WatchlistPage({
  library,
  actions,
}: {
  library: Resource<Film[]>;
  actions: PageActions;
}) {
  return (
    <>
      <div className="fx-welcome">
        <div>
          <h1>Your watchlist</h1>
          <p>Good films, ready when you are.</p>
        </div>
        <button
          className="fx-button fx-soft"
          onClick={() => actions.open({ type: "picker" })}
        >
          Help me choose
        </button>
      </div>
      {library.loading ? (
        <Loading layout="collection" label="Loading your watchlist…" />
      ) : library.error ? (
        <ErrorState message={library.error} retry={library.retry} />
      ) : library.data?.length ? (
        <div className="fx-collection">
          {library.data.map((f) => (
            <FilmCard
              key={`${f.kind}:${f.id}`}
              film={f}
              saved
              onSave={actions.save}
              busy={actions.busyIds.has(`${f.kind}:${f.id}`)}
            />
          ))}
        </div>
      ) : (
        <Empty title="Keep your next watch close">
          Search for a film above, then save it here for another night.
        </Empty>
      )}
    </>
  );
}
export function DiaryPage({
  user,
  revision,
}: {
  user: Account;
  revision: number;
}) {
  const { api } = useSession();
  const result = useLoad(`diary:${user.id}:${revision}`, () =>
    api.diary(user.id),
  );
  return (
    <>
      <div className="fx-welcome">
        <div>
          <h1>Your film diary</h1>
          <p>The films, the dates, the little memories.</p>
        </div>
      </div>
      {result.loading ? (
        <Loading layout="diary" label="Loading your diary…" />
      ) : result.error ? (
        <ErrorState message={result.error} retry={result.retry} />
      ) : result.data?.length ? (
        <DiaryViews entries={result.data} />
      ) : (
        <Empty title="Your first film night belongs here">
          Open a film and choose Log watch to start your diary.
        </Empty>
      )}
    </>
  );
}
export function FriendsPage({
  user,
  revision,
  onChanged,
}: {
  user: Account;
  revision: number;
  onChanged: () => void;
}) {
  const { api } = useSession();
  const result = useLoad(`friends:${user.id}:${revision}`, () =>
    api.friends(user.id),
  );
  return (
    <>
      <div className="fx-welcome">
        <div>
          <h1>Your people</h1>
          <p>See what your friends have been watching.</p>
        </div>
      </div>
      <FriendManager key={user.id} revision={revision} onChanged={onChanged}/>
      <h2>Friends’ recent activity</h2>
      {result.loading ? (
        <Loading layout="activity" label="Loading friends’ activity…" />
      ) : result.error ? (
        <ErrorState message={result.error} retry={result.retry} />
      ) : result.data?.length ? (
        <ActivityRows items={result.data} />
      ) : (
        <Empty title="A film is better with someone to talk to">
          Your friends’ recent activity will appear here once you connect in
          Flixie.
        </Empty>
      )}
    </>
  );
}
export function PlansPage({
  owner,
  revision,
  actions,
  planId,
}: {
  owner: string;
  revision: number;
  actions: PageActions;
  planId?: string;
}) {
  const { api, user } = useSession();
  const result = useLoad(`plans:${owner}:${revision}`, () => api.plans());
  const linked = useLoad(`linked-plan:${owner}:${planId ?? ''}`, signal => planId ? api.watchPlan(user!.externalId, planId, signal) : Promise.resolve(null));
  const opened = useRef('');
  useEffect(() => {
    if (!planId) { opened.current = ''; return; }
    if (linked.data && opened.current !== planId) { opened.current = planId; actions.open({type:'plan',plan:linked.data}); }
  }, [planId, linked.data, actions]);
  return (
    <>
      <div className="fx-welcome">
        <div>
          <h1>Your Watch Plans</h1>
          <p>Make room for your next film night.</p>
        </div>
      </div>
      {planId && linked.loading && <Loading layout="plans" count={1} label="Opening your Watch Plan…" />}
      {linked.error && <ErrorState message={linked.error} retry={linked.retry} />}
      {result.loading ? (
        <Loading layout="plans" label="Loading your plans…" />
      ) : result.error ? (
        <ErrorState message={result.error} retry={result.retry} />
      ) : result.data?.length ? (
        <div className="fx-plans-list">
          {result.data.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onOpen={() =>
                  actions.open({
                    type: "plan",
                    plan: plan,
                  })
                }
              />
          ))}
        </div>
      ) : (
        <Empty title="A film night to look forward to">
          Plans you arrange with friends in Flixie will appear here.
        </Empty>
      )}
    </>
  );
}
export function SearchPage({
  query,
  actions,
}: {
  query: string;
  actions: PageActions;
}) {
  const { api } = useSession();
  const result = useLoad(`search:${query}`, (signal) =>
    query.trim() ? api.search(query, signal) : Promise.resolve([]),
  );
  return (
    <>
      <div className="fx-welcome">
        <div>
          <h1>Search films &amp; shows</h1>
          <p>
            {query
              ? `Results for “${query}”`
              : "Find something you want to watch."}
          </p>
        </div>
      </div>
      {result.loading ? (
        <Loading layout="collection" label="Searching…" />
      ) : result.error ? (
        <ErrorState message={result.error} retry={result.retry} />
      ) : result.data?.length ? (
        <div className="fx-collection">
          {result.data.map((f) => (
            <FilmCard
              key={`${f.kind}:${f.id}`}
              film={f}
              saved={actions.saved(f)}
              onSave={actions.save}
              busy={actions.busyIds.has(`${f.kind}:${f.id}`)}
            />
          ))}
        </div>
      ) : query ? (
        <Empty title="No titles found">
          Try another title or check the spelling.
        </Empty>
      ) : null}
    </>
  );
}
function ReviewCard({ review }: { review: PublicReview }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <article className="fx-review">
      <div className="fx-review-head">
        <AvatarLink person={review.person} />
        <div>
          <Link to={profilePath(review.person.id)} className="fx-profile-name-link"><strong>{review.person.username}</strong></Link>
          <small>
            Public review ·{" "}
            {review.containsSpoilers ? "contains spoilers" : "no spoilers"}
          </small>
        </div>
        {review.rating !== null && (
          <span className="fx-review-score">
            {review.rating}
            <small>/10</small>
          </span>
        )}
      </div>
      {review.containsSpoilers && !revealed ? (
        <button className="fx-reveal-review" onClick={() => setRevealed(true)}>
          This review contains spoilers. Show review
        </button>
      ) : (
        <>
          {review.title && <h3>{review.title}</h3>}
          <p>{review.body}</p>
        </>
      )}
      <p className="fx-small fx-muted">{viewDate(review.createdAt)}</p>
    </article>
  );
}
export function TitlePage({
  id,
  kind,
  actions,
  revision,
}: {
  id: number;
  kind: "movie" | "show";
  actions: PageActions;
  revision: number;
}) {
  const { api, user, identity } = useSession();
  const result = useLoad(`title:${kind}:${id}`, (signal) =>
    api.title(id, kind, signal),
  );
  const reviews = useLoad(
    `reviews:${identity?.uid ?? "guest"}:${kind}:${id}:${revision}`,
    (signal) => api.publicReviews(id, kind, signal),
  );
  const credits = useLoad(`credits:${kind}:${id}`, (signal) =>
    api.credits(id, kind, signal),
  );
  const appLink = sharedMediaOpenLink(titlePath(id,kind), sharedMediaStore(navigator.userAgent,navigator.platform,navigator.maxTouchPoints));
  const initial = useContext(InitialTitle);
  const snapshot = initial?.id === id && initial.kind === kind ? initial : catalogTitles.find(title=>title.id===id&&title.kind===kind);
  const title = result.data ?? (snapshot ? film(snapshot, kind) : undefined);
  const metadata = title ? titleMetadata(title) : undefined;
  usePublicPageMetadata(titlePath(id, kind), metadata?.title, metadata?.description);
  if (result.loading && !title) return <Loading layout="title" label={kind === "show" ? "Loading the show…" : "Loading the film…"} />;
  if (!title)
    return (
      <ErrorState
        message={result.error || "This title is unavailable."}
        retry={result.retry}
      />
    );
  const f = title,
    directors = credits.data?.directors ?? [],
    cast = (credits.data?.cast ?? []).slice(0, 3);
  function shareTitle() {
    const url = 'https://www.flixie.co.uk' + titlePath(id,kind);
    if (navigator.share) void navigator.share({title:f.title,url}).catch(()=>{});
    else void navigator.clipboard.writeText(url).then(()=>actions.toast('Link copied')).catch(()=>actions.toast('Use the page address to share this film.'));
  }
  return (
    <>
      {result.error && <ErrorState message="The latest title details could not be loaded. Showing saved public details." retry={result.retry}/>}
      <div className="fx-title-view">
      <div className="fx-breadcrumb">
        <Link to={user ? "/app" : "/"} className="fx-title-home" aria-label="Home"><ChevronLeft size={22} aria-hidden="true"/><span>Home</span></Link>
        <ArrowRight size={13} />
        <span>{f.title}</span>
      </div>
      <div className="fx-film-detail">
        <TitleArtwork film={f}/>
        <Poster film={f} />
        <div className="fx-detail-body">
          <div className="fx-detail-heading">
            <h1>{f.title}</h1>
            <TitleMetadata film={f} />
            {f.tagline && <p className="fx-tagline">{f.tagline}</p>}
          </div>
          <div className="fx-detail-lower">
            {f.overview && <section className="fx-title-about"><h2>About {kind === 'movie' ? 'the film' : 'the show'}</h2><p className="fx-synopsis">{f.overview}</p></section>}
            {(directors.length > 0 || cast.length > 0) && (
              <div className="fx-director">
                {directors.length > 0 && (
                  <>
                    Directed by {directors.map((person, index) => <span key={person.id}>{index > 0 && ", "}<Link to={personPath(person.id)} className="fx-person-name">{person.name}</Link></span>)}
                    <br />
                  </>
                )}
                {cast.length > 0 && (
                  <>
                    With {cast.map((person, index) => <span key={person.id}>{index > 0 && ", "}<Link to={personPath(person.id)} className="fx-person-name">{person.name}</Link></span>)}
                  </>
                )}
              </div>
            )}
            <CommunityRating film={f} compactOnMobile pending={!result.data&&result.loading}/>
            <ProviderOverview film={f} onOptions={() => actions.open({ type: "options", film: f })} onSignIn={() => actions.open({ type: "login" })} />
            {!user ? <GuestTitleActions film={f} onLogin={()=>actions.open({type:'login'})} onSave={()=>void actions.save(f,true)} onShare={shareTitle}/> : <div className={`fx-detail-actions ${kind === "movie" ? "fx-has-review" : ""}`}>
                <button
                  className="fx-button fx-primary fx-title-primary fx-title-rate"
                  onClick={() => actions.open(!user ? { type: "login" } : kind === 'movie' ? { type: 'log', film: f } : { type: 'rate-show', film: f, onSaved: result.retry })}
                >
                  <Check size={18} className="fx-title-desktop-label" aria-hidden="true"/>
                  <Star size={20} className="fx-title-mobile-label" aria-hidden="true"/>
                  {kind === "movie" ? "Rate & review" : "Rate"}
                </button>
              <div className="fx-title-secondary-actions">
              <button
                aria-pressed={actions.saved(f)}
                aria-label={actions.saved(f) ? `Remove ${f.title} from watchlist` : `Save ${f.title} to watchlist`}
                className={`fx-button fx-title-watchlist ${user || actions.saved(f) ? "fx-title-secondary" : "fx-primary fx-title-primary"}`}
                disabled={actions.busyIds.has(`${f.kind}:${f.id}`)}
                onClick={() => void actions.save(f, !actions.saved(f))}
              >
                {actions.saved(f) ? <BookmarkCheck size={18} aria-hidden="true" /> : <BookmarkPlus size={18} aria-hidden="true" />}
                <span className="fx-title-desktop-label">{actions.saved(f) ? "In watchlist" : "Save to watchlist"}</span>
                <span className="fx-title-mobile-label">Watchlist</span>
              </button>
              <TitleFavourite key={`${user?.externalId ?? 'guest'}:${kind}:${id}`} film={f} actions={actions} revision={revision} />
              <button
                className="fx-button fx-title-secondary fx-title-share"
                aria-label={`Share ${f.title}`}
                onClick={shareTitle}
              >
                <Share2 size={18} />
                Share
              </button>
              </div>
            </div>}
            <TitleAppLink href={appLink}/>
          </div>
        </div>
      </div>
      </div>
      <nav className="fx-title-section-links" aria-label="On this title">
        {kind === 'show' && <a href="#title-episodes">Episodes</a>}
        <a href="#title-friends">Friends</a>
        <a href="#title-cast">Cast</a>
        <a href="#title-photos">Photos</a>
        <a href="#title-reviews">Reviews</a>
      </nav>
      {kind === 'show' && <ShowSeasons key={`${user?.externalId ?? 'guest'}:${id}`} id={id} revision={revision} onChange={actions.refresh} onSignIn={() => actions.open({type:'login'})} />}
      <FriendsSection
        key={`friends:${user?.id ?? "guest"}:${kind}:${id}`}
        film={f}
        revision={revision}
        onSignIn={() => actions.open({ type: "login" })}
      />
      <CastSection
        key={`cast:${kind}:${id}`}
        members={credits.data?.cast ?? []}
        loading={credits.loading}
        error={credits.error}
        retry={credits.retry}
      />
      <PhotosSection key={`photos:${kind}:${id}`} film={f} />
      <div className="fx-detail-bottom" id="title-reviews">
        <section>
          <h2>Around Flixie</h2>
          {reviews.loading ? (
            <Loading layout="activity" label="Loading public reviews…"/>
          ) : reviews.error ? (
            <ErrorState message={reviews.error} retry={reviews.retry} />
          ) : reviews.data?.length ? (
            reviews.data.map((r) => <ReviewCard key={r.id} review={r} />)
          ) : (
            <p className="fx-muted fx-rail-copy">No public reviews yet.</p>
          )}
        </section>
        {!user && (
          <aside className="fx-guest-friends">
            <img src="/web/pip-hoodie.png" alt="Pip" />
            <h2>Whose taste do you trust?</h2>
            <p>
              Keep your watchlist, diary and friends’ opinions together when you
              join Flixie.
            </p>
            <div className="fx-guest-friends-actions">
              <button
                className="fx-button fx-primary"
                onClick={() => actions.open({ type: "login" })}
              >
                Find your film people
                <ArrowRight size={16} />
              </button>
              <a className="fx-button" href="/download">
                Get the iPhone or Android app
              </a>
            </div>
          </aside>
        )}
      </div>
      <DownloadPrompt />
      <section className="fx-related">
        <div className="fx-section-head">
          <h2>Keep exploring</h2>
          <a className="fx-text-button" href="/films">
            Browse films &amp; TV
            <ArrowRight size={16} />
          </a>
        </div>
        <div className="fx-film-shelf">
          {catalogTitles
            .filter((title) => title.id !== id || title.kind !== kind)
            .slice(0, 4)
            .map((title) => (
              <a key={catalogPath(title)} href={catalogPath(title)}>
                <Poster film={title} />
                <span className="fx-film-title">{title.title}</span>
              </a>
            ))}
        </div>
      </section>
    </>
  );
}
