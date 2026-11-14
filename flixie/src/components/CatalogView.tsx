import { catalogTitles, catalogPath } from "../catalog";
import { Poster } from "../web/components";
import DownloadPrompt from "../web/DownloadPrompt";
import "../web/web.css";
import "../web/production.css";
export default function CatalogView() {
  return (
    <div className="flixie-web">
      <div className="fx-catalog">
        <h1>Find your next film or TV show</h1>
        <p className="fx-catalog-intro">
          Start with a title, save it for another night and check where to watch
          in your country. Your Flixie watchlist and diary stay with you across
          the web and app.
        </p>
        <div className="fx-collection">
          {catalogTitles.map((title) => (
            <article key={catalogPath(title)}>
              <a href={catalogPath(title)}>
                <Poster film={title} />
                <h2 className="fx-film-title">{title.title}</h2>
              </a>
              <p className="fx-small fx-muted">
                {title.releaseDate.slice(0, 4)} ·{" "}
                {title.kind === "movie" ? "Film" : "TV series"}
              </p>
            </article>
          ))}
        </div>
        <section className="fx-catalog-links">
          <h2>Make more of your next watch</h2>
          <a href="/movie-watchlist">Build a movie watchlist</a>
          <a href="/film-diary">Keep a film diary</a>
          <a href="/where-to-watch">Find viewing options</a>
          <a href="/tv-show-tracker">Track your TV shows</a>
        </section>
        <DownloadPrompt />
        <p className="fx-small fx-muted">
          Movie and TV metadata supplied by TMDB. Search more titles in{" "}
          <a href="/app/search" className="fx-underlined">
            Flixie on the web
          </a>
          .
        </p>
      </div>
    </div>
  );
}
