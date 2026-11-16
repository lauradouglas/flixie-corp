import WordmarkArtwork from '../components/WordmarkArtwork';
import { followMobileTaskViewport } from './mobileTaskViewport';
import {
  useEffect,
  useId,
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
  imageUrl,
  movieMeta,
  type Film,
  type Person,
} from "./models";
import { navigate, profilePath, titlePath } from "./routing";
import { avatarSources, resolveAvatarImage } from './avatarImages';

export function Link({
  to,
  children,
  className = "",
  onNavigate,
  ...props
}: {
  to: string;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
  "aria-current"?: "page";
  onNavigate?: () => void;
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
      onNavigate?.();
    }
  };
  return (
    <a href={to} onClick={click} className={className} {...props}>
      {children}
    </a>
  );
}
export function Wordmark({ to = "/app" }: { to?: string }) {
  return (
    <Link to={to} className="fx-wordmark" aria-label="Flixie Home">
      <WordmarkArtwork/>
    </Link>
  );
}
export function Avatar({
  person,
  small = false,
  large = false,
}: {
  person: Person;
  small?: boolean;
  large?: boolean;
}) {
  const sources=avatarSources(person.avatar,large), sourceKey=JSON.stringify(sources);
  const [loaded, setLoaded]=useState<{key:string;src:string}>({key:'',src:''}), [sourceIndex,setSourceIndex]=useState(0);
  useEffect(()=>{setSourceIndex(0);setLoaded({key:'',src:''});},[sourceKey]);
  useEffect(()=>{
    let active=true;
    const source=sources[sourceIndex];
    if (source) void resolveAvatarImage(source).then(src=>{if(active)setLoaded({key:sourceKey,src});}).catch(()=>{if(active)setSourceIndex(i=>i+1);});
    return ()=>{active=false;};
  },[sourceKey,sourceIndex]);
  const src=loaded.key===sourceKey?loaded.src:'';
  const badge = avatarBorder(person.profileBadges);
  return (
    <span
      className={`fx-avatar ${small ? "fx-tiny" : ""} ${large ? "fx-avatar-large" : ""} ${badge ? "" : "fx-no-border"} ${badge === "BORDER_CHRISTMAS_LIGHTS" ? "fx-christmas" : ""}`}
      data-badges={badge}
      role="img"
      aria-label={`${person.username}${badge ? ", " + badge.replaceAll("_", " ").toLowerCase() + " border" : ""}`}
    >
      {src ? (
        <img src={src} alt="" loading="lazy" decoding="async" onError={() => {setLoaded({key:'',src:''});setSourceIndex(i=>i+1);}} />
      ) : (
        <span className="fx-initials" aria-hidden="true">
          {(person.firstName || person.username).slice(0, 1).toUpperCase()}
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
export function AvatarLink({ person, small=false, to }: {person:Person;small?:boolean;to?:string}) {
  return person.id ? <Link to={to||profilePath(person.id)} className="fx-profile-link" aria-label={`View ${person.username}’s profile`}><Avatar person={person} small={small}/></Link> : <Avatar person={person} small={small}/>;
}
export function Poster({
  film,
  className = "",
}: {
  film: Pick<Film, "title" | "posterPath">;
  className?: string;
}) {
  const src = imageUrl(film.posterPath);
  const [loaded, setLoaded] = useState(""), [failed, setFailed] = useState("");
  const image = useRef<HTMLImageElement>(null);
  useEffect(() => {
    // Cached prerendered artwork can finish before hydration attaches onLoad.
    if (src && image.current?.complete) {
      if (image.current.naturalWidth) setLoaded(src);
      else setFailed(src);
    }
  }, [src]);
  return src && failed !== src ? (
    <img
      className={`fx-poster ${className}`}
      ref={image}
      src={src}
      alt={`${film.title} poster`}
      width={300}
      height={450}
      decoding="async"
      data-loading={loaded !== src}
      loading="lazy"
      onLoad={() => setLoaded(src)}
      onError={() => setFailed(src)}
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
            · {film.score.toFixed(1)} <small>community</small>
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
export { Loading } from './Loading';
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
const modalScrollLocks = new WeakMap<Document, { count: number; previous: string }>();
export function Sheet({
  title,
  children,
  onClose,
  wide = false,
  onKeyDown,
  presentation = "sheet",
  description,
  dismissible = true,
  className = "",
  mobileFullScreen = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
  onKeyDown?: KeyboardEventHandler<HTMLDialogElement>;
  presentation?: "sheet" | "modal" | "lightbox";
  description?: ReactNode;
  dismissible?: boolean;
  className?: string;
  mobileFullScreen?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const labelId = useId(), descriptionId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const focus = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    const owner = dialog?.ownerDocument ?? document;
    const lock = modalScrollLocks.get(owner) ?? { count: 0, previous: owner.body.style.overflow };
    lock.count++;
    modalScrollLocks.set(owner, lock);
    owner.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      if (--lock.count === 0) {
        owner.body.style.overflow = lock.previous;
        modalScrollLocks.delete(owner);
      }
      focus?.focus();
    };
  }, []);
  useEffect(() => {
    if (mobileFullScreen && ref.current) return followMobileTaskViewport(ref.current);
  }, [mobileFullScreen]);
  return (
    <dialog
      ref={ref}
      className={`${presentation === "lightbox" ? "fx-photo-lightbox" : presentation === "modal" ? "fx-watch-modal" : `fx-sheet ${wide ? "fx-sheet-wide" : ""}`} ${mobileFullScreen ? "fx-mobile-task" : ""} ${className}`.trim()}
      onKeyDown={onKeyDown}
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) onClose();
      }}
      onClick={(event) => {
        if (!dismissible || event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        // Native dialogs send backdrop clicks to the dialog too. Its own
        // padding is part of the task, so only dismiss outside its bounds.
        if (event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
      }}
      aria-labelledby={labelId}
      aria-describedby={description ? descriptionId : undefined}
    >
      <div className={presentation === "lightbox" ? "fx-lightbox-heading" : presentation === "modal" ? "fx-watch-heading" : "fx-sheet-top"}>
        {presentation === "modal" && <img className="fx-watch-brand" src="/web/flixie-f.png" alt="" width={36} height={36} />}
        <div>
          <h2 id={labelId}>{title}</h2>
          {description && <div id={descriptionId}>{description}</div>}
        </div>
        <button className="fx-icon-button" aria-label="Close" onClick={onClose} disabled={!dismissible}>
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
