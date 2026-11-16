import { createContext } from "react";
import { ChevronLeft } from 'lucide-react';
import { catalogTitles, catalogPath, type CatalogTitle } from "../catalog";
import { film } from "./models";
import { Poster } from "./components";
import { GuestTitleActions, TitleAppLink, TitleArtwork, TitleMetadata } from './TitlePresentation';
import CommunityRating from './CommunityRating';
import {ProviderOverviewLoading} from './ProviderOverviewLoading';
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
        <div className="fx-title-view">
        <nav className="fx-breadcrumb" aria-label="Breadcrumb">
          <a href="/" className="fx-title-home" aria-label="Home"><ChevronLeft size={22} aria-hidden="true"/><span>Flixie</span></a>
          <span>/</span>
          <a href="/films">Films &amp; TV</a>
          <span>/</span>
          <span>{title.title}</span>
        </nav>
        <div className="fx-film-detail">
          <TitleArtwork film={value}/>
          <Poster film={value} />
          <div className="fx-detail-body">
            <div className="fx-detail-heading">
            <h1>{title.title}</h1>
            <TitleMetadata film={value} />
            {title.tagline && <p className="fx-tagline">{title.tagline}</p>}
            </div>
            <div className="fx-detail-lower">
            <section className="fx-title-about"><h2>About {title.kind === 'movie' ? 'the film' : 'the show'}</h2><p className="fx-synopsis">{title.overview}</p></section>
            <CommunityRating film={value} compactOnMobile pending/>
            <ProviderOverviewLoading/>
            <GuestTitleActions film={value}/>
            <TitleAppLink/>
            </div>
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
