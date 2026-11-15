import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Expand,
  Image as ImageIcon,
  LockKeyhole,
  ThumbsUp,
  Users,
} from "lucide-react";
import { useSession } from "./auth";
import { AvatarLink, Empty, ErrorState, Link, Sheet } from "./components";
import { personPath, profilePath } from "./routing";
import { useLoad } from "./hooks";
import { imageUrl, type Film } from "./models";
import type { CastMember, TitlePhoto } from "./titleDetails";

function DetailSkeleton({ label }: { label: string }) {
  return (
    <div className="fx-detail-skeleton" role="status">
      <span />
      <span />
      <span />
      <p>{label}</p>
    </div>
  );
}
function Portrait({ member }: { member: CastMember }) {
  const [failed, setFailed] = useState(false);
  const source = imageUrl(member.portrait, "w185");
  return source && !failed ? (
    <img
      src={source}
      alt={`${member.name} portrait`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  ) : (
    <div
      className="fx-cast-placeholder"
      role="img"
      aria-label={`No portrait available for ${member.name}`}
    >
      <Users aria-hidden="true" />
    </div>
  );
}
export function CastSection({
  members,
  loading,
  error,
  retry,
}: {
  members: CastMember[];
  loading: boolean;
  error: string;
  retry: () => void;
}) {
  const [limit, setLimit] = useState(10);
  return (
    <section
      className="fx-title-section"
      id="title-cast"
      aria-labelledby="title-cast-heading"
    >
      <div className="fx-section-head">
        <h2 id="title-cast-heading">Cast</h2>
        {members.length > 0 && (
          <span className="fx-small fx-muted">
            {members.length} cast members
          </span>
        )}
      </div>
      {loading ? (
        <DetailSkeleton label="Loading the cast…" />
      ) : error ? (
        <ErrorState message={error} retry={retry} />
      ) : members.length ? (
        <>
          <div
            className="fx-cast-rail"
            tabIndex={0}
            role="region"
            aria-label="Cast portraits. Scroll to see more."
          >
            {members.slice(0, limit).map((member) => (
              <Link to={personPath(member.id)} key={member.id} aria-label={`View ${member.name}`}>
              <figure className="fx-cast-member">
                <Portrait member={member} />
                <figcaption>
                  <strong>{member.name}</strong>
                  {member.character && <span>{member.character}</span>}
                </figcaption>
              </figure>
              </Link>
            ))}
          </div>
          {members.length > limit && (
            <button
              className="fx-text-button"
              onClick={() => setLimit((value) => value + 20)}
            >
              Show more cast
              <ArrowRight size={16} />
            </button>
          )}
        </>
      ) : (
        <Empty title="Cast details are not available yet">
          Check back later for the people behind this title.
        </Empty>
      )}
    </section>
  );
}
export function FriendsSection({
  film,
  revision,
  onSignIn,
}: {
  film: Film;
  revision: number;
  onSignIn: () => void;
}) {
  const { user, api } = useSession();
  const result = useLoad(
    `title-friends:${user?.id ?? "guest"}:${film.kind}:${film.id}:${revision}`,
    (signal) =>
      user
        ? api.titleFriends(film.id, film.kind, signal)
        : Promise.resolve(null),
  );
  const opinions = result.data;
  return (
    <section
      className="fx-title-section fx-title-friends"
      id="title-friends"
      aria-labelledby="title-friends-heading"
    >
      <div className="fx-friends-heading">
        <h2 id="title-friends-heading">Your friends on {film.title}</h2>
        {user && <p className="fx-friend-privacy"><LockKeyhole size={14} aria-hidden="true" />Only visible to you</p>}
      </div>
      {!user ? (
        <div className="fx-friend-join">
          <Users size={24} aria-hidden="true" />
          <div>
            <p>See which friends have watched, rated or recommended this.</p>
            <button className="fx-text-button" onClick={onSignIn}>
              Sign in to see your friends
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : result.loading ? (
        <DetailSkeleton label="Loading your friends’ opinions…" />
      ) : result.error ? (
        <ErrorState message={result.error} retry={result.retry} />
      ) : opinions?.friends.length ? (
        <>
          <div className="fx-friend-summary">
            {opinions.average !== null && (
              <div className="fx-friend-average">
                <span className="fx-friend-average-score">
                  {opinions.average.toFixed(1)}
                  <small>/10</small>
                </span>
                <p><strong>Friends’ average</strong><span>From {opinions.ratedCount} {opinions.ratedCount === 1 ? "rating" : "ratings"}</span></p>
              </div>
            )}
            <div className="fx-friend-counts">
              {opinions.watchedCount > 0 && (
                <p>
                  <Check size={16} aria-hidden="true" />
                  {opinions.watchedCount} watched
                </p>
              )}
              {opinions.recommendedCount > 0 && (
                <p className="fx-recommends">
                  <ThumbsUp size={16} aria-hidden="true" />
                  {opinions.recommendedCount}{" "}
                  {opinions.recommendedCount === 1
                    ? "recommends it"
                    : "recommend it"}
                </p>
              )}
            </div>
          </div>
          <ul className="fx-friend-opinions">
            {opinions.friends.map((opinion) => (
              <li key={opinion.person.id}>
                <AvatarLink person={opinion.person} />
                <div>
                  <Link to={profilePath(opinion.person.id)} className="fx-profile-name-link"><strong>{opinion.person.username}</strong></Link>
                  <div className="fx-friend-signals">
                    {opinion.watched && (
                      <span>
                        <Check size={13} aria-hidden="true" />
                        Watched
                      </span>
                    )}
                    {opinion.recommends && (
                      <span className="fx-recommends">
                        <ThumbsUp size={13} aria-hidden="true" />
                        Recommends
                      </span>
                    )}
                    {!opinion.watched &&
                      !opinion.recommends &&
                      opinion.rating !== null && <span>Rated</span>}
                  </div>
                </div>
                {opinion.rating !== null && (
                  <span
                    className="fx-friend-rating"
                    aria-label={`${opinion.person.username} rated ${opinion.rating} out of 10`}
                  >
                    {opinion.rating}
                    <small>/10</small>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <Empty title="Be the first in your circle">
          Your friends’ watches, ratings and recommendations for this title will
          appear here.
        </Empty>
      )}
    </section>
  );
}
function Photo({
  photo,
  title,
  large = false,
}: {
  photo: TitlePhoto;
  title: string;
  large?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setFailed(false); setLoaded(false); }, [photo.id]);
  const source = imageUrl(photo.path, large ? "original" : "w780");
  return source && !failed ? (
    <>
      {large && !loaded && <p className="fx-photo-loading" role="status">Loading image…</p>}
      <img
        src={source}
        alt={`${title} ${photo.kind === "poster" ? "poster artwork" : "still"}`}
        loading={large ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </>
  ) : (
    <div
      className="fx-photo-fallback"
      role="img"
      aria-label="Image unavailable"
    >
      <ImageIcon aria-hidden="true" />
      <span>This image could not be loaded.</span>
    </div>
  );
}
export function PhotosSection({ film }: { film: Film }) {
  const { api } = useSession();
  const result = useLoad(`images:${film.kind}:${film.id}`, (signal) =>
    api.images(film.id, film.kind, signal),
  );
  const [filter, setFilter] = useState<"still" | "poster">("still"),
    [limit, setLimit] = useState(6),
    [selected, setSelected] = useState<number | null>(null);
  const all = result.data ?? [],
    stills = all.filter((image) => image.kind === "still"),
    posters = all.filter((image) => image.kind === "poster");
  const active =
      filter === "still" && stills.length === 0 && posters.length
        ? "poster"
        : filter,
    photos = active === "still" ? stills : posters;
  const current = selected === null ? null : photos[selected];
  const move = (direction: number) =>
    setSelected((index) =>
      index === null
        ? null
        : (index + direction + photos.length) % photos.length,
    );
  function choose(kind: "still" | "poster") {
    setFilter(kind);
    setLimit(6);
    setSelected(null);
  }
  return (
    <section
      className="fx-title-section"
      id="title-photos"
      aria-labelledby="title-photos-heading"
    >
      <div className="fx-section-head">
        <h2 id="title-photos-heading">Photos &amp; artwork</h2>
        {all.length > 0 && (
          <div className="fx-photo-filters" aria-label="Image type">
            <button
              aria-pressed={active === "still"}
              disabled={!stills.length}
              onClick={() => choose("still")}
            >
              Stills <span>{stills.length}</span>
            </button>
            <button
              aria-pressed={active === "poster"}
              disabled={!posters.length}
              onClick={() => choose("poster")}
            >
              Posters <span>{posters.length}</span>
            </button>
          </div>
        )}
      </div>
      {result.loading ? (
        <DetailSkeleton label="Loading photos…" />
      ) : result.error ? (
        <ErrorState message={result.error} retry={result.retry} />
      ) : photos.length ? (
        <>
          <div
            className={`fx-photo-rail ${active === "poster" ? "fx-poster-rail" : ""}`}
            tabIndex={0}
            role="region"
            aria-label="Title images. Scroll to see more."
          >
            {photos.slice(0, limit).map((photo, index) => (
              <button
                className="fx-photo-thumb"
                key={photo.id}
                onClick={() => setSelected(index)}
                aria-label={`Enlarge ${film.title} ${active === "poster" ? "poster" : "still"} ${index + 1}`}
              >
                <Photo photo={photo} title={film.title} />
                <span>
                  <Expand size={15} aria-hidden="true" />
                  View image
                </span>
              </button>
            ))}
          </div>
          {photos.length > limit && (
            <button
              className="fx-text-button"
              onClick={() => setLimit((value) => value + 12)}
            >
              Show more {active === "poster" ? "posters" : "stills"}
              <ArrowRight size={16} />
            </button>
          )}
        </>
      ) : (
        <Empty title="No images available yet">
          Photos and alternative poster artwork will appear here when available.
        </Empty>
      )}
      {current && (
        <Sheet
          presentation="lightbox"
          title={film.title}
          description={`${active === "poster" ? "Poster" : "Still"} ${selected! + 1} of ${photos.length}`}
          onClose={() => setSelected(null)}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
              event.preventDefault();
              move(event.key === "ArrowRight" ? 1 : -1);
            }
          }}
        >
          <div
            className="fx-photo-viewer"
          >
            <Photo key={current.id} photo={current} title={film.title} large />
          </div>
          <div className="fx-photo-navigation">
            <button
              className="fx-lightbox-button"
              onClick={() => move(-1)}
              disabled={photos.length < 2}
            >
              <ArrowLeft size={18} aria-hidden="true" />
              Previous
            </button>
            <p aria-live="polite" aria-atomic="true">
              {selected! + 1} / {photos.length}
            </p>
            <button
              className="fx-lightbox-button"
              onClick={() => move(1)}
              disabled={photos.length < 2}
            >
              Next
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </Sheet>
      )}
    </section>
  );
}
