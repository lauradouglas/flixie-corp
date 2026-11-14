import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookmarkCheck,
  Check,
  Clapperboard,
  Monitor,
  Share2,
} from "lucide-react";
import { useSession } from "./auth";
import {
  Avatar,
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
  type Plan,
  type PublicReview,
} from "./models";
import { titlePath } from "./routing";
import { catalogTitles, catalogPath } from "../catalog";
import DownloadPrompt from "./DownloadPrompt";
import type { Action } from "./actions";
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
function DiaryRow({ entry }: { entry: DiaryEntry }) {
  const date = entry.watchedAt ? new Date(entry.watchedAt) : null;
  return (
    <div className="fx-diary-strip">
      <div className="fx-date">
        {date && !Number.isNaN(date.getTime()) ? (
          <>
            <strong>{date.getDate()}</strong>
            {date.toLocaleDateString("en-GB", { month: "short" }).toUpperCase()}
            <span>{date.getFullYear()}</span>
          </>
        ) : (
          <>
            Date
            <br />
            not set
          </>
        )}
      </div>
      <Link to={titlePath(entry.movie.id)} className="fx-poster-button">
        <Poster film={entry.movie} />
      </Link>
      <div>
        <h3>
          <Link to={titlePath(entry.movie.id)}>{entry.movie.title}</Link>
        </h3>
        {entry.notes && <p>{entry.notes}</p>}
        {entry.watchedAtCinema && (
          <p className="fx-small fx-muted">At the cinema</p>
        )}
      </div>
      {entry.rating !== null && (
        <span className="fx-score">
          {entry.rating}
          <small> / 10</small>
        </span>
      )}
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
            <Avatar person={item.person} />
            <div>
              <p>
                <strong>{item.person.username}</strong>{" "}
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
export function PlanCard({ plan, onOpen }: { plan: Plan; onOpen: () => void }) {
  return (
    <div className="fx-plan">
      <h3>
        {plan.films.map((f) => f.title).join(" / ") || "A film night to plan"}
      </h3>
      <p>
        {plan.date ? viewDate(plan.date) : "Date to be decided"}
        {plan.location && (
          <>
            <br />
            {plan.location}
          </>
        )}
      </p>
      <div className="fx-plan-people">
        {plan.people.slice(0, 4).map((person) => (
          <Avatar key={person.id} person={person} small />
        ))}
        <span>
          {plan.people.length} {plan.people.length === 1 ? "person" : "people"}
        </span>
      </div>
      <button className="fx-text-button" onClick={onOpen}>
        View plan
        <ArrowRight size={16} />
      </button>
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
  const home = useLoad(`home:${user.id}:${revision}`, async () => {
    const result = await Promise.allSettled([
      api.watchSoon(),
      api.diary(user.id, true),
      api.continued(user.id),
      api.friends(user.id),
      api.plans(),
    ]);
    return {
      soon: result[0].status === "fulfilled" ? result[0].value : undefined,
      diary: result[1].status === "fulfilled" ? result[1].value : undefined,
      shows: result[2].status === "fulfilled" ? result[2].value : undefined,
      friends: result[3].status === "fulfilled" ? result[3].value : undefined,
      plans: result[4].status === "fulfilled" ? result[4].value : undefined,
    };
  });
  const data = home.data,
    soon = data?.soon?.[0],
    selected = soon ?? library.data?.find((f) => f.kind === "movie");
  const shelf = (library.data ?? []).filter(
    (f) => f.id !== selected?.id || f.kind !== selected?.kind,
  );
  const shown = (shelf.length >= 4 ? shelf : (library.data ?? [])).slice(0, 4);
  const plans = (data?.plans ?? []).filter((p) => p.status !== "cancelled");
  return (
    <>
      <div className="fx-welcome">
        <div>
          <h1>Hello, {user.firstName || user.username}.</h1>
          <p>Your next film night starts here.</p>
        </div>
        <button
          className="fx-button fx-soft"
          onClick={() => actions.open({ type: "picker" })}
        >
          <Clapperboard size={18} />
          Pick for me
        </button>
      </div>
      <div className="fx-home-columns">
        <div className="fx-primary-column">
          {(home.loading || library.loading) && !selected ? (
            <Loading />
          ) : selected ? (
            <section>
              <SectionHeading to="/app/watchlist" label="Your watchlist">
                {soon ? "Watch soon" : "Saved for another night"}
              </SectionHeading>
              <div className="fx-soon">
                <Link className="fx-poster-button" to={titlePath(selected.id)}>
                  <Poster film={selected} />
                </Link>
                <div className="fx-soon-copy">
                  {soon && (
                    <span className="fx-label">
                      <BookmarkCheck size={14} />
                      You wanted to watch this
                    </span>
                  )}
                  <h3>
                    <Link to={titlePath(selected.id)}>{selected.title}</Link>
                  </h3>
                  <FilmMeta film={selected} />
                  <div className="fx-button-row">
                    <button
                      className="fx-button fx-primary"
                      onClick={() =>
                        actions.open({ type: "options", film: selected })
                      }
                    >
                      Watch options
                    </button>
                    <button
                      className="fx-button"
                      onClick={() =>
                        actions.open({ type: "log", film: selected })
                      }
                    >
                      <Check size={17} />
                      Log watch
                    </button>
                  </div>
                </div>
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
          {data?.diary?.[0] && (
            <section>
              <SectionHeading to="/app/diary" label="Open diary">
                A recent film night
              </SectionHeading>
              <DiaryRow entry={data.diary[0]} />
            </section>
          )}
          <section className="fx-picker">
            <div>
              <h2>What fits your night?</h2>
              <p>A film for your mood, your time and the people watching.</p>
              <button
                className="fx-text-button"
                onClick={() => actions.open({ type: "picker" })}
              >
                Find tonight’s film
                <ArrowRight size={17} />
              </button>
            </div>
            <img src="/web/pip-hoodie.png" alt="Pip, Flixie’s mascot" />
          </section>
        </div>
        <aside className="fx-rail">
          <section className="fx-rail-section">
            <h2>Continue watching</h2>
            {data?.shows?.[0] ? (
              <ContinueCard
                show={data.shows[0]}
                actions={actions}
                owner={user.id}
              />
            ) : data?.shows === undefined && !home.loading ? (
              <ErrorState
                message="TV progress could not be loaded."
                retry={home.retry}
              />
            ) : home.loading ? (
              <p className="fx-muted">Loading your shows…</p>
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
            {data?.friends?.length ? (
              <ActivityRows items={data.friends.slice(0, 3)} />
            ) : data?.friends === undefined && !home.loading ? (
              <ErrorState
                message="Friends’ activity could not be loaded."
                retry={home.retry}
              />
            ) : (
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
                    plan: plans[0] as unknown as Record<string, unknown>,
                  })
                }
              />
            ) : data?.plans === undefined && !home.loading ? (
              <ErrorState
                message="Watch Plans could not be loaded."
                retry={home.retry}
              />
            ) : (
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
        <Loading />
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
        <Loading label="Loading your diary…" />
      ) : result.error ? (
        <ErrorState message={result.error} retry={result.retry} />
      ) : result.data?.length ? (
        result.data.map((entry) => <DiaryRow key={entry.id} entry={entry} />)
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
}: {
  user: Account;
  revision: number;
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
      {result.loading ? (
        <Loading label="Loading friends’ activity…" />
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
}: {
  owner: string;
  revision: number;
  actions: PageActions;
}) {
  const { api } = useSession();
  const result = useLoad(`plans:${owner}:${revision}`, () => api.plans());
  return (
    <>
      <div className="fx-welcome">
        <div>
          <h1>Your Watch Plans</h1>
          <p>Make room for your next film night.</p>
        </div>
      </div>
      {result.loading ? (
        <Loading label="Loading your plans…" />
      ) : result.error ? (
        <ErrorState message={result.error} retry={result.retry} />
      ) : result.data?.length ? (
        <div className="fx-plans-list">
          {result.data.map((plan) => (
            <section key={plan.id}>
              <PlanCard
                plan={plan}
                onOpen={() =>
                  actions.open({
                    type: "plan",
                    plan: plan as unknown as Record<string, unknown>,
                  })
                }
              />
            </section>
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
        <Loading label="Searching…" />
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
        <Avatar person={review.person} />
        <div>
          <strong>{review.person.username}</strong>
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
    api.request(`/${kind === "movie" ? "movies" : "shows"}/${id}/credits`, {
      public: true,
      signal,
    }),
  );
  const [appLink, setAppLink] = useState<string | null>(null);
  useEffect(
    () =>
      setAppLink(
        sharedMediaOpenLink(
          titlePath(id, kind),
          sharedMediaStore(
            navigator.userAgent,
            navigator.platform,
            navigator.maxTouchPoints,
          ),
        ),
      ),
    [id, kind],
  );
  if (result.loading) return <Loading label="Loading the film…" />;
  if (result.error || !result.data)
    return (
      <ErrorState
        message={result.error || "This title is unavailable."}
        retry={result.retry}
      />
    );
  const f = result.data,
    rawCredits = object(credits.data);
  const directors = list(rawCredits.crewMembers)
    .map(object)
    .filter((c) => text(c.job) === "Director")
    .map((c) => text(c.name));
  const cast = list(rawCredits.castMembers)
    .slice(0, 3)
    .map((c) => text(object(c).name));
  return (
    <>
      <div className="fx-breadcrumb">
        <Link to="/app">{user ? "Home" : "Flixie"}</Link>
        <ArrowRight size={13} />
        <span>{f.title}</span>
      </div>
      <div className="fx-film-detail">
        <Poster film={f} />
        <div className="fx-detail-body">
          <div className="fx-detail-heading">
            <h1>{f.title}</h1>
            <FilmMeta film={f} />
            {f.tagline && <p className="fx-tagline">{f.tagline}</p>}
          </div>
          <div className="fx-detail-lower">
            {f.overview && <p className="fx-synopsis">{f.overview}</p>}
            {(directors.length > 0 || cast.length > 0) && (
              <div className="fx-director">
                {directors.length > 0 && (
                  <>
                    Directed by <strong>{directors.join(", ")}</strong>
                    <br />
                  </>
                )}
                {cast.length > 0 && (
                  <>
                    With <strong>{cast.join(", ")}</strong>
                  </>
                )}
              </div>
            )}
            <div className="fx-rating-block">
              {f.score !== null && f.scoreSource ? (
                <>
                  <div className="fx-rating-number">
                    {f.score.toFixed(1)}
                    <small>/10</small>
                  </div>
                  <div>
                    <strong>
                      {f.scoreSource === "Flixie"
                        ? "Flixie community"
                        : "TMDB audience"}
                    </strong>
                    {f.scoreCount > 0 && (
                      <p className="fx-small fx-muted">
                        {f.scoreCount.toLocaleString("en-GB")} ratings
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <p className="fx-muted">No rating yet.</p>
              )}
            </div>
            <div className="fx-detail-actions">
              <button
                className={`fx-button ${actions.saved(f) ? "fx-soft" : "fx-primary"}`}
                disabled={actions.busyIds.has(`${f.kind}:${f.id}`)}
                onClick={() => void actions.save(f, !actions.saved(f))}
              >
                <BookmarkCheck size={18} />
                {actions.saved(f) ? "In your watchlist" : "Save to watchlist"}
              </button>
              <button
                className="fx-button"
                onClick={() => actions.open({ type: "options", film: f })}
              >
                <Monitor size={18} />
                Watch options
              </button>
              {user && kind === "movie" && (
                <button
                  className="fx-button"
                  onClick={() => actions.open({ type: "log", film: f })}
                >
                  <Check size={18} />
                  Log watch
                </button>
              )}
              <button
                className="fx-icon-button"
                aria-label={`Share ${f.title}`}
                onClick={() => {
                  const url = "https://www.flixie.co.uk" + titlePath(id, kind);
                  if (navigator.share)
                    void navigator
                      .share({ title: f.title, url })
                      .catch(() => {});
                  else
                    void navigator.clipboard
                      .writeText(url)
                      .then(() => actions.toast("Link copied"))
                      .catch(() =>
                        actions.toast(
                          "Use the page address to share this film.",
                        ),
                      );
                }}
              >
                <Share2 size={18} />
              </button>
            </div>
            {appLink && (
              <a className="fx-text-button" href={appLink}>
                Open in the Flixie app
                <ArrowRight size={15} />
              </a>
            )}
          </div>
        </div>
      </div>
      <DownloadPrompt />
      <div className="fx-detail-bottom">
        <section>
          <h2>Around Flixie</h2>
          {reviews.loading ? (
            <p className="fx-muted">Loading public reviews…</p>
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
            <button
              className="fx-button fx-soft"
              onClick={() => actions.open({ type: "login" })}
            >
              Find your film people
              <ArrowRight size={16} />
            </button>
            <a className="fx-text-button" href="/download">
              Get the iPhone or Android app
            </a>
          </aside>
        )}
      </div>
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
