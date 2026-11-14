import { useContext, useEffect, useRef, useState, type FormEvent } from "react";
import {
  Bell,
  BookOpen,
  Bookmark,
  CalendarDays,
  Clapperboard,
  Home,
  LogOut,
  Search,
  Users,
} from "lucide-react";
import { AuthProvider, useSession } from "./auth";
import AuthForm from "./AuthForm";
import {
  Avatar,
  ErrorState,
  Link,
  Loading,
  Sheet,
  Wordmark,
} from "./components";
import {
  Picker,
  TermsSheet,
  WatchLog,
  WatchOptions,
  type Action,
} from "./actions";
import {
  DiaryPage,
  FriendsPage,
  HomePage,
  PlansPage,
  SearchPage,
  TitlePage,
  WatchlistPage,
  type PageActions,
} from "./pages";
import { useLoad, errorMessage } from "./hooks";
import { list, text, viewDate, type Film, type Plan } from "./models";
import { navigate, safeNext, titlePath, useRoute } from "./routing";
import { InitialTitle, PublicTitleShell } from "./PublicTitleShell";
import DownloadPrompt from "./DownloadPrompt";
import MobileAppPrompt from "./MobileAppPrompt";
import { renderHead } from "../seo";
import { pageFromPath } from "../site";
import "./web.css";
import "./production.css";
import "./title-sections.css";

export default function WebApp() {
  const initialTitle = useContext(InitialTitle);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div className="flixie-web">
      {mounted ? (
        <AuthProvider>
          <ConnectedApp />
        </AuthProvider>
      ) : initialTitle ? (
        <PublicTitleShell title={initialTitle} />
      ) : (
        <div className="fx-start">
          <a className="fx-wordmark" href="/app">
            flix<span>ie</span>
          </a>
          <h1>Your movie &amp; TV companion</h1>
          <p>Loading Flixie…</p>
          <p>
            <a href="/download">Get Flixie for iPhone or Android</a>
          </p>
          <DownloadPrompt />
        </div>
      )}
    </div>
  );
}
function ConnectedApp() {
  const session = useSession(),
    { user, identity, api } = session,
    route = useRoute();
  const [revision, setRevision] = useState(0),
    [action, setAction] = useState<Action | null>(null),
    [toast, setToast] = useState(""),
    [query, setQuery] = useState(""),
    [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const currentOwner = useRef(user?.id);
  currentOwner.current = user?.id;
  const terms = useLoad(`terms:${user?.id ?? "guest"}:${revision}`, () =>
    user ? api.terms() : Promise.resolve({ accepted: true }),
  );
  const library = useLoad(`library:${user?.id ?? "guest"}:${revision}`, () =>
    user ? api.watchlist(user.id) : Promise.resolve([]),
  );
  useEffect(() => {
    // A guest's pending save belongs to the public title and must survive sign-in.
    setAction(previous=>previous?.type==='login'?previous:null);
    setBusyIds(new Set());
    setToast("");
    setQuery("");
  }, [identity?.uid]);
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    if (user && ["sign-in", "join"].includes(route.page))
      navigate(
        safeNext(new URLSearchParams(window.location.search).get("next")),
        true,
      );
  }, [user, route.page]);
  useEffect(() => {
    const template = document.createElement("template");
    template.innerHTML = renderHead(pageFromPath(window.location.pathname));
    document.head
      .querySelectorAll(
        'title,meta[name=description],meta[name=robots],meta[name=apple-itunes-app],meta[property^="og:"],meta[name^="twitter:"],link[rel=canonical],script[type="application/ld+json"]',
      )
      .forEach((node) => node.remove());
    document.head.append(template.content);
  }, [JSON.stringify(route)]);
  const refresh = () => setRevision((n) => n + 1);
  async function save(film: Film, enabled: boolean) {
    if (!user) {
      setAction({ type: "login", save: film });
      return;
    }
    const owner = user.id,
      key = `${film.kind}:${film.id}`;
    if (busyIds.has(key)) return;
    setBusyIds((previous) => new Set(previous).add(key));
    try {
      await api.save(owner, film, enabled);
      if (currentOwner.current !== owner) return;
      refresh();
      setToast(
        enabled ? "Saved to your watchlist" : "Removed from your watchlist",
      );
    } catch (error) {
      if (currentOwner.current === owner) setToast(errorMessage(error));
    } finally {
      if (currentOwner.current === owner)
        setBusyIds((previous) => {
          const next = new Set(previous);
          next.delete(key);
          return next;
        });
    }
  }
  const actions: PageActions = {
    open: setAction,
    save,
    saved: (film) =>
      (library.data ?? []).some(
        (item) => item.id === film.id && item.kind === film.kind,
      ),
    busyIds,
    refresh,
    toast: setToast,
  };
  const guestTitle = route.page === "title" && !user;
  function search(event: FormEvent) {
    event.preventDefault();
    if (query.trim())
      navigate("/app/search?q=" + encodeURIComponent(query.trim()));
  }
  function content() {
    if (route.page === "title")
      return (
        <TitlePage
          id={route.id}
          kind={route.kind}
          actions={actions}
          revision={revision}
        />
      );
    if (route.page === "search")
      return <SearchPage query={route.query ?? ""} actions={actions} />;
    if (session.loading)
      return <Loading label="Opening your Flixie account…" />;
    if (session.error)
      return (
        <ErrorState
          message={session.error}
          retry={() =>
            void session.reloadProfile().catch((e) => setToast(errorMessage(e)))
          }
        />
      );
    if (!user)
      return (
        <AuthForm
          initialJoin={route.page === "join" || Boolean(identity)}
          onComplete={() =>
            navigate(
              route.page === "sign-in" || route.page === "join"
                ? safeNext(
                    new URLSearchParams(window.location.search).get("next"),
                  )
                : window.location.pathname,
              true,
            )
          }
        />
      );
    switch (route.page) {
      case "watchlist":
        return <WatchlistPage library={library} actions={actions} />;
      case "diary":
        return <DiaryPage user={user} revision={revision} />;
      case "friends":
        return <FriendsPage user={user} revision={revision} />;
      case "plans":
        return (
          <PlansPage owner={user.id} revision={revision} actions={actions} />
        );
      default:
        return (
          <HomePage
            user={user}
            library={library}
            actions={actions}
            revision={revision}
          />
        );
    }
  }
  const nav = [
    ["home", "/app", Home, "Home"],
    ["watchlist", "/app/watchlist", Bookmark, "Watchlist"],
    ["diary", "/app/diary", BookOpen, "Film diary"],
    ["friends", "/app/friends", Users, "Friends"],
    ["plans", "/app/plans", CalendarDays, "Watch Plans"],
  ] as const;
  return (
    <>
      <a className="fx-skip" href="#web-main">
        Skip to content
      </a>
      {session.local && (
        <div className="fx-local-banner">
          LOCAL · Development accounts and database
        </div>
      )}
      <header className="fx-top">
        <Wordmark />
        {guestTitle ? (
          <p className="fx-guest-tagline">Your movie &amp; TV companion</p>
        ) : (
          <form className="fx-search" onSubmit={search} role="search">
            <Search size={18} aria-hidden="true" />
            <input
              aria-label="Search films and shows"
              type="search"
              placeholder="Search films and shows"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" aria-label="Search">
              <Search size={16} />
            </button>
          </form>
        )}
        <div className="fx-top-actions">
          {user ? (
            <>
              <button
                className="fx-icon-button"
                aria-label="Sign out"
                onClick={() =>
                  void session.signOut().then(() => navigate("/app"))
                }
              >
                <LogOut size={18} />
              </button>
              <Avatar person={user} />
            </>
          ) : (
            <>
              <Link
                to={
                  "/app/sign-in?next=" +
                  encodeURIComponent(
                    window.location.pathname + window.location.search,
                  )
                }
                className="fx-text-button"
              >
                Sign in
              </Link>
              <Link
                to={
                  "/app/join?next=" +
                  encodeURIComponent(
                    window.location.pathname + window.location.search,
                  )
                }
                className="fx-button fx-primary"
              >
                Join Flixie
              </Link>
            </>
          )}
        </div>
      </header>
      <div className={user ? "fx-app-layout" : "fx-guest-layout"}>
        {user && (
          <aside className="fx-sidebar">
            <nav aria-label="Main navigation">
              {nav.map(([page, to, Icon, label]) => (
                <Link
                  key={page}
                  to={to}
                  className={`fx-nav-button ${route.page === page ? "fx-current" : ""}`}
                >
                  <Icon size={18} />
                  {label}
                  {page === "watchlist" && library.data && (
                    <span className="fx-count">{library.data.length}</span>
                  )}
                </Link>
              ))}
            </nav>
            <button
              className="fx-button fx-primary"
              onClick={() => navigate("/app/search")}
            >
              <Clapperboard size={17} />
              Log a watch
            </button>
            <div className="fx-sidebar-note">
              <img src="/web/pip-hoodie.png" alt="Pip" />
              <p>
                Your films.
                <br />
                Your people.
                <br />
                Your next good watch.
              </p>
              <a href="/films">Explore films &amp; TV</a>
              <a href="/download">Get the app</a>
              <a href="/">About Flixie</a>
            </div>
          </aside>
        )}
        <main
          id="web-main"
          className={guestTitle ? "fx-public-main" : "fx-main"}
        >
          {user && terms.data?.accepted === false && (
            <div className="fx-terms-notice">
              <p>
                Please review Flixie’s current terms to keep using your account.
              </p>
              <button
                className="fx-button"
                onClick={() =>
                  setAction({
                    type: "terms",
                    version: text(terms.data?.version),
                  })
                }
              >
                Review terms
              </button>
            </div>
          )}
          {content()}
        </main>
      </div>
      <footer className="fx-footer">
        <p>Discover, track and plan. Watch through your own services.</p>
        <div>
          <a href="/privacy">Privacy</a>
          <a href="/web/terms.html">Terms</a>
          <a href="/contact">Support</a>
          <span>Movie data: TMDB · Availability: JustWatch</span>
        </div>
      </footer>
      {action?.type === "terms" && user && (
        <TermsSheet
          version={action.version}
          onClose={() => setAction(null)}
          onAccepted={() => {
            setAction(null);
            refresh();
            setToast("Your terms acceptance has been saved");
          }}
        />
      )}
      {action?.type === "options" && (
        <WatchOptions
          key={`${action.film.kind}:${action.film.id}`}
          film={action.film}
          onClose={() => setAction(null)}
        />
      )}
      {action?.type === "log" && user && (
        <WatchLog
          key={`${user.id}:${action.film.id}`}
          film={action.film}
          onClose={() => setAction(null)}
          onSaved={() => {
            setAction(null);
            refresh();
            setToast("Your film night is in your diary");
            navigate("/app/diary");
          }}
        />
      )}
      {action?.type === "picker" && (
        <Picker
          onClose={() => setAction(null)}
          onChoose={(film) => {
            setAction(null);
            navigate(titlePath(film.id));
          }}
        />
      )}
      {action?.type === "login" && (
        <Sheet
          title={
            action.save
              ? `Save ${action.save.title} for another night`
              : "Make Flixie yours"
          }
          onClose={() => setAction(null)}
        >
          <AuthForm
            onComplete={() => {
              const pending = action.save;
              setAction(null);
              if (pending) void save(pending, true);
            }}
          />
        </Sheet>
      )}
      {action?.type === "plan" && (
        <Sheet title="Your Watch Plan" onClose={() => setAction(null)}>
          <h3>
            {list(action.plan.films)
              .map((value) => text((value as Record<string, unknown>).title))
              .join(" / ") || "Film night"}
          </h3>
          <p>{viewDate(text(action.plan.date) || null)}</p>
          <p>{text(action.plan.location)}</p>
          <div className="fx-plan-people">
            {((action.plan.people as Plan["people"]) ?? []).map((person) => (
              <Avatar key={person.id} person={person} />
            ))}
          </div>
          <p className="fx-muted">Keep the plan going in Flixie.</p>
          <a href="/download" className="fx-button">
            Open Flixie on your phone
          </a>
        </Sheet>
      )}
      <MobileAppPrompt />
      {toast && (
        <div className="fx-toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </>
  );
}
