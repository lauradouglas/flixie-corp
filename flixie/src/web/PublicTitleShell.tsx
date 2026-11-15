import { createContext } from "react";
import { catalogTitles, catalogPath, type CatalogTitle } from "../catalog";
import { film } from "./models";
import { FilmMeta, Poster } from "./components";
import PublicBrowseHeader from './PublicBrowseHeader';
import DownloadPrompt from "./DownloadPrompt";
import Footer from "../components/Footer";
export const InitialTitle = createContext<CatalogTitle | undefined>(undefined);
export function PublicTitleShell({ title }: { title: CatalogTitle }) {
  const value = film(title, title.kind);
  return (
    <>
      <PublicBrowseHeader returnTo={catalogPath(title)}/>
      <main className="fx-public-main">
        <nav className="fx-breadcrumb" aria-label="Breadcrumb">
          <a href="/">Flixie</a>
          <span>/</span>
          <a href="/films">Films &amp; TV</a>
          <span>/</span>
          <span>{title.title}</span>
        </nav>
        <div className="fx-film-detail">
          <Poster film={value} />
          <div>
            <h1>{title.title}</h1>
            <FilmMeta film={value} />
            {title.tagline && <p className="fx-tagline">{title.tagline}</p>}
            <p className="fx-synopsis">{title.overview}</p>
            <p className="fx-public-explainer">
              Save {title.title} to your watchlist, keep a personal viewing
              diary and check viewing options for your country with Flixie.
            </p>
            <div className="fx-button-row">
              <a
                href={
                  "/app/sign-in?next=" + encodeURIComponent(catalogPath(title))
                }
                className="fx-button fx-primary"
              >
                Save to your watchlist
              </a>
              <a href="/where-to-watch" className="fx-button">
                About viewing options
              </a>
            </div>
          </div>
        </div>
        <DownloadPrompt />
        <section className="fx-related">
          <h2>Keep exploring</h2>
          <div className="fx-film-shelf">
            {catalogTitles
              .filter((t) => t.id !== title.id || t.kind !== title.kind)
              .slice(0, 4)
              .map((t) => (
                <a key={catalogPath(t)} href={catalogPath(t)}>
                  <Poster film={t} />
                  <span className="fx-film-title">{t.title}</span>
                </a>
              ))}
          </div>
        </section>
        <p className="fx-small fx-muted">
          Film and TV metadata supplied by TMDB. Flixie helps you discover and
          track titles; viewing takes place through your own services.
        </p>
      </main>
      <Footer year={new Date().getFullYear()} compact />
    </>
  );
}
