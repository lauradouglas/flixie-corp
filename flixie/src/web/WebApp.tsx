import { StartupLoading } from "./Loading";
import { useContext, useEffect, useRef, useState, type FormEvent } from "react";
import {
  Clapperboard,
  LogOut,
  Search,
} from "lucide-react";
import { AuthProvider, useSession } from "./auth";
import AuthForm from "./AuthForm";
import ShowRating from './ShowRating';
import AccountGate from "./AccountGate";
import "./mobile-task.css";
import Footer from "../components/Footer";
import {
  Avatar,
  ErrorState,
  Link,
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
import { text, type Film } from "./models";
import { WatchPlanPreview } from './WatchPlans';
import { navigate, safeNext, titlePath, useRoute } from "./routing";
import { InitialTitle, PublicTitleShell } from "./PublicTitleShell";
import PersonPage, { PublicPersonShell } from "./PersonPage";
import UserProfilePage from './UserProfilePage';
import { InitialPerson } from "./personContext";
import MobileAppPrompt from "./MobileAppPrompt";
import { renderHead } from "../seo";
import { pageFromPath } from "../site";
import "./web.css";
import "./production.css";
import "./loading.css";
import "./home-layout.css";
import "./diary.css";
import "./title-sections.css";
import NotificationsPage, { NotificationBell } from './Notifications';
import MobileNavigation, { appNavigation, activeNavigation } from "./MobileNavigation";
import "./mobile-navigation.css";
import PublicBrowseHeader from './PublicBrowseHeader';
import './public-browse-header.css';
import './app-footer.css';
import './public-home.css';
import './mobile-title.css';
import PublicHomePage,{PublicHomeShell} from './PublicHome';
import WebsiteAnalyticsChoice from '../components/WebsiteAnalyticsChoice';

export default function WebApp({publicHome=false}:{publicHome?:boolean}) {
  const initialTitle = useContext(InitialTitle);
  const initialPerson = useContext(InitialPerson);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div className="flixie-web">
      {mounted ? (
        <AuthProvider>
          <ConnectedApp />
        </AuthProvider>
      ) : publicHome ? <PublicHomeShell/> : initialPerson ? (
        <PublicPersonShell snapshot={initialPerson} />
      ) : initialTitle ? (
        <PublicTitleShell title={initialTitle} />
      ) : (
        <><PublicBrowseHeader/><main id="web-main"><StartupLoading/></main><Footer year={new Date().getFullYear()} compact /></>
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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchField = useRef<HTMLInputElement>(null), searchToggle = useRef<HTMLButtonElement>(null);
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
    // Navigation ends the previous route's preview or authentication dialog.
    setAction(previous => previous?.type === 'plan' || previous?.type === 'login' ? null : previous);
  }, [JSON.stringify(route)]);
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
  useEffect(()=>{
    if(user&&window.location.pathname==='/')navigate('/app',true);
  },[user?.id]);
  useEffect(()=>{
    const intent=new URLSearchParams(window.location.search).get('pick');
    if(user&&route.page==='home'&&terms.data?.accepted&&['tonight','laugh','hooked'].includes(intent??'')){
      setAction({type:'picker',...(intent==='laugh'||intent==='hooked'?{mood:intent}:{})});
      navigate('/app',true);
    }
  },[user?.id,route.page,terms.data?.accepted]);
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
  useEffect(() => { setMobileSearchOpen(false); }, [JSON.stringify(route), identity?.uid]);
  useEffect(() => { if (mobileSearchOpen) searchField.current?.focus(); }, [mobileSearchOpen]);
  async function signOut() {
    try { await session.signOut(); navigate('/app'); }
    catch(error) { setToast(errorMessage(error)); }
  }
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
  const authPage = !user && (route.page === 'join' || route.page === 'sign-in');
  const guestTitle = !user && (route.page === 'title' || route.page === 'person');
  const continuation = authPage ? safeNext(new URLSearchParams(window.location.search).get('next')) : window.location.pathname + window.location.search;
  function search(event: FormEvent) {
    event.preventDefault();
    if (query.trim())
      navigate("/app/search?q=" + encodeURIComponent(query.trim()));
  }
  function content() {
    if(route.page==='explore'&&(!identity||user)||route.page==='home'&&!user&&!identity)return <PublicHomePage actions={actions}/>;
    if (route.page === "person") return <PersonPage key={route.id} id={route.id} />;
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
    return <AccountGate key={route.page} authDialogOpen={action?.type === "login"}
      initialJoin={route.page === "join"}
      onComplete={() => navigate(route.page === "sign-in" || route.page === "join"
        ? safeNext(new URLSearchParams(window.location.search).get("next")) : window.location.pathname, true)}>
      {user ? memberContent() : null}
    </AccountGate>;
  }
  function memberContent() {
    switch (route.page) {
      case "watchlist":
        return <WatchlistPage library={library} actions={actions} />;
      case "diary":
        return <DiaryPage user={user} revision={revision} />;
      case "friends":
        return <FriendsPage user={user} revision={revision} onChanged={refresh}/>;
      case "profile":
        return <UserProfilePage key={`${user.id}:me`} revision={revision}/>;
      case "user-profile":
        return <UserProfilePage key={`${user.id}:${route.id}`} id={route.id} revision={revision}/>;
      case "notifications":
        return <NotificationsPage key={user.id} revision={revision} onChanged={refresh}/>;
      case "plans":
        return (
          <PlansPage owner={user.id} revision={revision} actions={actions} planId={route.page === "plans" ? route.planId : undefined} />
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
  const activePage = activeNavigation(route, user?.id ?? '');
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
      {!user ? <PublicBrowseHeader returnTo={continuation} query={query} onQueryChange={setQuery} onSearch={search} authPage={authPage?route.page as 'join'|'sign-in':undefined}/> : <header className="fx-top" data-auth-page={authPage}>
        <Wordmark />
          <form id="fx-header-search" className="fx-search" data-mobile-open={mobileSearchOpen} onSubmit={search} role="search" onKeyDown={event => { if(event.key === 'Escape') { setMobileSearchOpen(false); searchToggle.current?.focus(); } }}>
            <Search size={18} aria-hidden="true" />
            <input
              ref={searchField}
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
        <div className="fx-top-actions">
          {!authPage && <button ref={searchToggle} type="button" className="fx-icon-button fx-mobile-search-toggle" aria-label={mobileSearchOpen ? 'Close search' : 'Search films and shows'} aria-expanded={mobileSearchOpen} aria-controls="fx-header-search" onClick={() => setMobileSearchOpen(open => !open)}><Search size={21} aria-hidden="true"/></button>}
          {user ? (
            <>
              <button
                className="fx-icon-button fx-header-sign-out"
                aria-label="Sign out"
                onClick={() => void signOut()}
              >
                <LogOut size={18} />
              </button>
              <NotificationBell key={user.id} revision={revision} current={route.page === "notifications"}/>
              <Link to="/app/profile" className="fx-header-profile" aria-label="Your profile" aria-current={activePage === "profile" ? "page" : undefined}><Avatar person={user}/></Link>
            </>
          ) : (
            <>
              <Link
                to={
                  "/app/sign-in?next=" +
                  encodeURIComponent(continuation)
                }
                className="fx-text-button fx-guest-sign-in"
                aria-current={route.page === 'sign-in' ? 'page' : undefined}
              >
                Sign in
              </Link>
              <Link
                to={
                  "/app/join?next=" +
                  encodeURIComponent(continuation)
                }
                className="fx-button fx-primary fx-guest-join"
                aria-current={route.page === 'join' ? 'page' : undefined}
              >
                Join Flixie
              </Link>
            </>
          )}
        </div>
      </header>}
      <div className={user ? "fx-app-layout" : "fx-guest-layout"}>
        {user && (
          <aside className="fx-sidebar">
            <nav aria-label="Main navigation">
              {appNavigation.map(({page, href:to, Icon, label}) => (
                <Link
                  key={page}
                  to={to}
                  className={`fx-nav-button ${activePage === page ? "fx-current" : ""}`}
                  aria-current={activePage === page ? "page" : undefined}
                >
                  <Icon size={18} />
                  <span className="fx-nav-label">{label}</span>
                  {page === "watchlist" && library.data && (
                    <span className="fx-count">{new Intl.NumberFormat('en-GB').format(library.data.length)}</span>
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
              <Link to="/app/explore">Explore films &amp; TV</Link>
              <a href="/download">Get the app</a>
              <a href="/about">About Flixie</a>
            </div>
          </aside>
        )}
        <main
          id="web-main"
          tabIndex={-1}
          className={guestTitle ? "fx-public-main" : `fx-main${route.page==='explore'||route.page==='home'&&!user&&!identity?' fx-discovery-main':''}`}
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
          {user && activePage === 'profile' && <div className="fx-mobile-account-tools"><button type="button" className="fx-button" onClick={() => void signOut()}><LogOut size={18} aria-hidden="true"/>Sign out</button></div>}
        </main>
      </div>
      <Footer year={new Date().getFullYear()} compact />
      {!user&&!identity&&route.page==='home'&&<WebsiteAnalyticsChoice page="home" inline/>}
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
          onSaved={(includedReview) => {
            setAction(null);
            refresh();
            setToast(includedReview ? "Your watch and review have been saved" : "Your film night is in your diary");
            navigate("/app/diary");
          }}
        />
      )}
      {action?.type === 'rate-show' && user && <ShowRating key={`${user.id}:${action.film.id}`} film={action.film} onClose={() => setAction(null)} onSaved={() => { action.onSaved?.(); setAction(null); refresh(); setToast('Your show rating has been saved'); }}/>}
      {action?.type === "picker" && user && (
        <Picker
          key={user.id}
          initialMood={action.mood}
          onPlanSaved={refresh}
          onViewPlans={() => { setAction(null); navigate('/app/plans'); }}
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
        <WatchPlanPreview plan={action.plan} onClose={() => setAction(null)} />
      )}
      {user && <MobileNavigation active={activePage}/>}
      {user && <MobileAppPrompt />}
      {toast && (
        <div className="fx-toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </>
  );
}
