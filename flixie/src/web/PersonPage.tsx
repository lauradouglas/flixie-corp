import Footer from "../components/Footer";
import { useContext, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Users } from "lucide-react";
import { useSession } from "./auth";
import { Empty, ErrorState, Link, Loading, Poster, Sheet } from "./components";
import PublicBrowseHeader from './PublicBrowseHeader';
import { useLoad } from "./hooks";
import { imageUrl, type MediaKind } from "./models";
import { titlePath } from "./routing";
import { InitialPerson } from "./personContext";
import { creditHasRole, displayPersonDate, selectTalentCredits, type CreditRole, type CreditSort, type Talent, type TalentCredit, type TalentCredits } from "./personDetails";
import type { PersonSnapshot } from "../peopleCatalog";
import DownloadPrompt from "./DownloadPrompt";
import "./person-page.css";

export function PersonImage({ path, alt, large = false }: { path: string; alt: string; large?: boolean }) {
  const [failed, setFailed] = useState(false), [loaded, setLoaded] = useState(false);
  const src = imageUrl(path, large ? "original" : "w500");
  return src && !failed ? <>
    {large && !loaded && <p className="fx-photo-loading" role="status">Loading image…</p>}
    <img src={src} alt={alt} data-loading={!loaded} decoding="async" loading={large ? "eager" : "lazy"} onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />
  </> : <div className="fx-person-no-photo" role="img" aria-label={`Photo unavailable for ${alt}`}><Users aria-hidden="true" /><span>Photo unavailable</span></div>;
}
function Biography({ person }: { person: Talent }) {
  const boundary = person.biography.length > 600 ? person.biography.lastIndexOf(" ", 500) : -1;
  return <div className="fx-person-biography">
    <h2>Biography</h2>
    {person.biography ? <>
      <p>{boundary > 0 ? person.biography.slice(0, boundary) : person.biography}</p>
      {boundary > 0 && <details><summary>Read full biography</summary><p>{person.biography.slice(boundary).trim()}</p></details>}
    </> : <p className="fx-muted">A biography is not available yet.</p>}
  </div>;
}
function CreditCard({ credit }: { credit: TalentCredit }) {
  const roles = [...new Set([...credit.roles, ...credit.jobs.map(j => j.job)])];
  return <Link to={titlePath(credit.id, credit.kind)} className="fx-person-credit">
    <Poster film={credit} />
    <strong>{credit.title}</strong>
    <span>{credit.kind === "movie" ? "Film" : "TV"}{credit.releaseDate ? ` · ${credit.releaseDate.slice(0, 4)}` : " · Date unavailable"}</span>
    {roles.length > 0 && <small>{roles.join(" · ")}</small>}
  </Link>;
}
function Filmography({ credits }: { credits: TalentCredits }) {
  const [role, setRole] = useState<CreditRole>("all"), [media, setMedia] = useState<"all" | MediaKind>("all");
  const [sort, setSort] = useState<CreditSort>("newest"), [query, setQuery] = useState(""), [year, setYear] = useState("");
  const [limit, setLimit] = useState(24);
  const filters = { role, media, sort, query, year }, selected = selectTalentCredits(credits.all, filters);
  const years = [...new Set(credits.all.map(c => c.releaseDate.slice(0, 4)).filter(Boolean))].sort().reverse();
  const roles = [["all", "All roles"], ["acting", "Acting"], ["directing", "Directing"], ["writing", "Writing"], ["production", "Production"]] as const;
  function reset() { setRole("all"); setMedia("all"); setQuery(""); setYear(""); setLimit(24); }
  return <section className="fx-person-section" id="person-credits" aria-labelledby="person-credits-heading">
    <div className="fx-section-head"><h2 id="person-credits-heading">Filmography</h2><span className="fx-muted">{credits.all.length} titles</span></div>
    {credits.knownFor.length > 0 && <section className="fx-person-known-for" aria-labelledby="person-known-for-heading"><h3 id="person-known-for-heading">Known for</h3><div className="fx-person-known-grid">{credits.knownFor.map(c => <CreditCard credit={c} key={`${c.kind}:${c.id}`} />)}</div></section>}
    <h3>All credits</h3>
    <div className="fx-person-role-filters" aria-label="Credit role">
      {roles.filter(([key]) => key === "all" || credits.all.some(c => creditHasRole(c, key))).map(([key, label]) =>
        <button key={key} type="button" aria-pressed={role === key} onClick={() => { setRole(key); setLimit(24); }}>{label}<span>{credits.all.filter(c => creditHasRole(c, key)).length}</span></button>)}
    </div>
    <div className="fx-person-credit-filters">
      <label>Search credits<input type="search" value={query} onChange={e => { setQuery(e.target.value); setLimit(24); }} placeholder="Title, character or job" /></label>
      <label>Type<select value={media} onChange={e => { setMedia(e.target.value as "all" | MediaKind); setLimit(24); }}><option value="all">Films &amp; TV</option><option value="movie">Films</option><option value="show">TV</option></select></label>
      <label>Year<select value={year} onChange={e => { setYear(e.target.value); setLimit(24); }}><option value="">All years</option>{years.map(y => <option key={y}>{y}</option>)}</select></label>
      <label>Sort<select value={sort} onChange={e => { setSort(e.target.value as CreditSort); setLimit(24); }}><option value="newest">Newest released</option><option value="oldest">Oldest first</option><option value="popular">Most popular</option></select></label>
    </div>
    <p className="fx-person-result-count" role="status">{selected.length} {selected.length === 1 ? "title" : "titles"}{selected.length > limit ? ` · showing ${limit}` : ""}</p>
    {selected.length ? <div className="fx-person-credit-grid">{selected.slice(0, limit).map(c => <CreditCard credit={c} key={`${c.kind}:${c.id}`} />)}</div> :
      <Empty title={credits.all.length ? "No matching credits" : "No credits available yet"}>{credits.all.length ? <>Try another role, title or year. <button className="fx-text-button" onClick={reset}>Clear filters</button></> : "Film and TV work will appear here when available."}</Empty>}
    {selected.length > limit && <button className="fx-button fx-person-more" onClick={() => setLimit(n => n + 24)}>Show more credits<ArrowRight size={17} aria-hidden="true" /></button>}
  </section>;
}
function Photos({ person }: { person: Talent }) {
  const [selected, setSelected] = useState<number | null>(null), [limit, setLimit] = useState(8);
  const current = selected === null ? null : person.photos[selected];
  function move(direction: number) { setSelected(index => index === null ? null : (index + direction + person.photos.length) % person.photos.length); }
  if (!person.photos.length) return null;
  return <section className="fx-person-section" id="person-photos" aria-labelledby="person-photos-heading">
    <div className="fx-section-head"><h2 id="person-photos-heading">Photos</h2><span className="fx-muted">{person.photos.length} images</span></div>
    <div className="fx-person-photo-rail">{person.photos.slice(0, limit).map((photo, index) => <button type="button" key={photo.id} onClick={() => setSelected(index)} aria-label={`Enlarge ${person.name} photo ${index + 1}`}><PersonImage key={photo.path} path={photo.path} alt={`${person.name} photo ${index + 1}`} /></button>)}</div>
    {person.photos.length > limit && <button className="fx-text-button" onClick={() => setLimit(n => n + 16)}>Show more photos<ArrowRight size={16} aria-hidden="true" /></button>}
    {current && <Sheet presentation="lightbox" title={person.name} description={`Photo ${selected! + 1} of ${person.photos.length}`} onClose={() => setSelected(null)} onKeyDown={e => { if (["ArrowLeft", "ArrowRight"].includes(e.key)) { e.preventDefault(); move(e.key === "ArrowRight" ? 1 : -1); } }}>
      <div className="fx-photo-viewer"><PersonImage key={current.path} path={current.path} alt={`${person.name} photo ${selected! + 1}`} large /></div>
      <div className="fx-photo-navigation"><button className="fx-lightbox-button" onClick={() => move(-1)} disabled={person.photos.length < 2}><ArrowLeft size={18} aria-hidden="true" />Previous</button><p aria-live="polite" aria-atomic="true">{selected! + 1} / {person.photos.length}</p><button className="fx-lightbox-button" onClick={() => move(1)} disabled={person.photos.length < 2}>Next<ArrowRight size={18} aria-hidden="true" /></button></div>
    </Sheet>}
  </section>;
}
export function PersonContent({ person, credits, creditState }: { person: Talent; credits?: TalentCredits; creditState?: { loading: boolean; error: string; retry: () => void } }) {
  return <>
    <nav className="fx-breadcrumb" aria-label="Breadcrumb"><a href="/films">Films &amp; TV</a><ArrowRight size={13} aria-hidden="true" /><span>{person.name}</span></nav>
    <section className="fx-person-hero">
      <div className="fx-person-portrait"><PersonImage key={person.portrait} path={person.portrait} alt={person.name} /></div>
      <div className="fx-person-summary"><h1>{person.name}</h1>{person.department && <p className="fx-person-department">{person.department}</p>}
        <dl className="fx-person-facts">
          {person.birthDate && <div><dt>Born</dt><dd>{displayPersonDate(person.birthDate)}</dd></div>}
          {person.deathDate && <div><dt>Died</dt><dd>{displayPersonDate(person.deathDate)}</dd></div>}
          {person.birthplace && <div><dt>Birthplace</dt><dd>{person.birthplace}</dd></div>}
        </dl>
        {person.imdbId && <a className="fx-text-button" href={`https://www.imdb.com/name/${person.imdbId}/`} target="_blank" rel="noopener noreferrer">IMDb<ExternalLink size={14} aria-hidden="true" /></a>}
      </div>
      <Biography person={person} />
    </section>
    <nav className="fx-title-section-links" aria-label="On this person"><a href="#person-credits">Filmography</a>{person.photos.length > 0 && <a href="#person-photos">Photos</a>}</nav>
    {creditState?.loading ? <div id="person-credits"><Loading layout="collection" label="Loading credits…" /></div> : creditState?.error ? <div id="person-credits"><ErrorState message={creditState.error} retry={creditState.retry} /></div> : credits ? <Filmography credits={credits} /> : null}
    <Photos person={person} />
    <DownloadPrompt />
    <p className="fx-small fx-muted">Person information, photos and credits supplied by TMDB.</p>
  </>;
}
export function PublicPersonShell({ snapshot }: { snapshot: PersonSnapshot }) {
  return <><PublicBrowseHeader returnTo={`/people/${snapshot.person.id}`}/><main className="fx-public-main fx-person-page"><PersonContent person={snapshot.person} credits={snapshot.credits} /></main><Footer year={new Date().getFullYear()} compact /></>;
}
export default function PersonPage({ id }: { id: number }) {
  const { api } = useSession();
  const detail = useLoad(`person:${id}`, signal => api.person(id, signal));
  const credits = useLoad(`person-credits:${id}`, signal => api.personCredits(id, signal));
  const initial = useContext(InitialPerson);
  useEffect(() => {
    if (!detail.data) return;
    const title = `${detail.data.name}: Biography, Films & TV Credits | Flixie`;
    const description = `Explore ${detail.data.name}'s biography, photos and film and TV credits on Flixie. ${detail.data.biography}`.slice(0,157).trim();
    document.title = title;
    for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) document.querySelector(selector)?.setAttribute("content", title);
    for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) document.querySelector(selector)?.setAttribute("content", description);
    // Unknown people retain the noindex route policy until their public snapshot is reviewed.
  }, [detail.data]);
  const person = detail.data ?? (initial?.person.id === id && detail.loading ? initial.person : undefined);
  if (!person) return detail.error ? <ErrorState message={detail.error} retry={detail.retry} /> : <Loading layout="person" label="Loading person…" />;
  return <div className="fx-person-page"><PersonContent key={id} person={person} credits={credits.data ?? (initial?.person.id === id ? initial.credits : undefined)} creditState={{...credits,loading:credits.loading && !(initial?.person.id === id && initial.credits)}} /></div>;
}
