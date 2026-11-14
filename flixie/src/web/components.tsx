import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type KeyboardEventHandler,
  type MouseEvent,
} from "react";
import {
  BookmarkCheck,
  BookmarkPlus,
  ChevronRight,
  Film as FilmIcon,
  X,
} from "lucide-react";
import {
  avatarBorder,
  avatarUrl,
  imageUrl,
  movieMeta,
  type Film,
  type Person,
} from "./models";
import { navigate, titlePath } from "./routing";

export function Link({
  to,
  children,
  className = "",
  ...props
}: {
  to: string;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}) {
  const click = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      !event.defaultPrevented &&
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey
    ) {
      event.preventDefault();
      navigate(to);
    }
  };
  return (
    <a href={to} onClick={click} className={className} {...props}>
      {children}
    </a>
  );
}
export function Wordmark() {
  return (
    <Link to="/app" className="fx-wordmark" aria-label="Flixie Home">
      flix<span>ie</span>
    </Link>
  );
}
export function Avatar({
  person,
  small = false,
}: {
  person: Person;
  small?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const src = avatarUrl(person.avatar);
  const badge = avatarBorder(person.profileBadges);
  return (
    <span
      className={`fx-avatar ${small ? "fx-tiny" : ""} ${badge ? "" : "fx-no-border"} ${badge === "BORDER_CHRISTMAS_LIGHTS" ? "fx-christmas" : ""}`}
      data-badges={badge}
      role="img"
      aria-label={`${person.username}${badge ? ", " + badge.replaceAll("_", " ").toLowerCase() + " border" : ""}`}
    >
      {src && !failed ? (
        <img src={src} alt="" onError={() => setFailed(true)} />
      ) : (
        <span className="fx-initials" aria-hidden="true">
          {person.username.slice(0, 1).toUpperCase()}
        </span>
      )}
      {badge === "BORDER_CHRISTMAS_LIGHTS" && (
        <img
          className="fx-avatar-frame"
          src="/web/christmas-lights-border.svg"
          alt=""
        />
      )}
    </span>
  );
}
export function Poster({
  film,
  className = "",
}: {
  film: Pick<Film, "title" | "posterPath">;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [film.posterPath]);
  const src = imageUrl(film.posterPath);
  return src && !failed ? (
    <img
      className={`fx-poster ${className}`}
      src={src}
      alt={`${film.title} poster`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  ) : (
    <div
      className={`fx-poster fx-missing-poster ${className}`}
      role="img"
      aria-label={`Poster unavailable for ${film.title}`}
    >
      <FilmIcon aria-hidden="true" />
      <span>{film.title}</span>
    </div>
  );
}
export function FilmCard({
  film,
  saved,
  onSave,
  busy = false,
}: {
  film: Film;
  saved: boolean;
  onSave: (film: Film, enabled: boolean) => void;
  busy?: boolean;
}) {
  return (
    <article className="fx-film">
      <div className="fx-artwork">
        <Link
          to={titlePath(film.id, film.kind)}
          className="fx-poster-button"
          aria-label={`View ${film.title}`}
        >
          <Poster film={film} />
        </Link>
        <button
          type="button"
          className="fx-save-film"
          disabled={busy}
          onClick={() => onSave(film, !saved)}
          aria-pressed={saved}
          aria-label={`${saved ? "Remove " + film.title + " from" : "Save " + film.title + " to"} watchlist`}
        >
          {saved ? <BookmarkCheck /> : <BookmarkPlus />}
        </button>
      </div>
      <Link to={titlePath(film.id, film.kind)} className="fx-film-title">
        {film.title}
      </Link>
      <p className="fx-film-meta">
        {film.releaseDate.slice(0, 4)}
        {film.score !== null && film.scoreSource && (
          <span>
            {" "}
            · {film.score.toFixed(1)} <small>{film.scoreSource}</small>
          </span>
        )}
      </p>
    </article>
  );
}
export function FilmMeta({ film }: { film: Film }) {
  return <p className="fx-muted">{movieMeta(film)}</p>;
}
export function SectionHeading({
  children,
  to,
  label = "See all",
}: {
  children: ReactNode;
  to?: string;
  label?: string;
}) {
  return (
    <div className="fx-section-head">
      <h2>{children}</h2>
      {to && (
        <Link className="fx-text-button" to={to}>
          {label}
          <ChevronRight aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
export function Loading({ label = "Loading your films…" }: { label?: string }) {
  return (
    <div className="fx-loading" role="status">
      <span className="fx-skeleton" />
      <span className="fx-skeleton" />
      <span className="fx-skeleton" />
      <p>{label}</p>
    </div>
  );
}
export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div className="fx-error" role="alert">
      <p>{message}</p>
      {retry && (
        <button className="fx-button" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="fx-empty">
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
export function Sheet({
  title,
  children,
  onClose,
  wide = false,
  onKeyDown,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
  onKeyDown?: KeyboardEventHandler<HTMLDialogElement>;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const focus = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previous;
      focus?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`fx-sheet ${wide ? "fx-sheet-wide" : ""}`}
      onKeyDown={onKeyDown}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-labelledby="fx-sheet-title"
    >
      <div className="fx-sheet-top">
        <h2 id="fx-sheet-title">{title}</h2>
        <button className="fx-icon-button" aria-label="Close" onClick={onClose}>
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
