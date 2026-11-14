import { useState, type FormEvent } from "react";
import { ArrowRight, BookmarkCheck, Check, Monitor } from "lucide-react";
import { useSession } from "./auth";
import { ErrorState, FilmMeta, Poster, Sheet } from "./components";
import { useLoad, errorMessage } from "./hooks";
import {
  imageUrl,
  list,
  object,
  text,
  type Film,
  type Pick as FilmPick,
  type JsonObject,
} from "./models";
import { navigate, titlePath } from "./routing";
export type Action =
  | { type: "login"; save?: Film }
  | { type: "log"; film: Film }
  | { type: "options"; film: Film }
  | { type: "picker" }
  | { type: "plan"; plan: JsonObject }
  | { type: "terms"; version: string };
export function WatchLog({
  film,
  onClose,
  onSaved,
}: {
  film: Film;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { api, user } = useSession();
  const [date, setDate] = useState(() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }),
    [rating, setRating] = useState(""),
    [notes, setNotes] = useState(""),
    [cinema, setCinema] = useState(false),
    [recommend, setRecommend] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!user || busy) return;
    setBusy(true);
    setError("");
    const owner = user.id;
    try {
      await api.log(owner, {
        movieId: film.id,
        watchedAt: new Date(date + "T12:00:00").toISOString(),
        rating: rating ? Number(rating) : null,
        recommended: recommend ? recommend === "yes" : null,
        notes,
        watchedAtCinema: cinema,
      });
      onSaved();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Sheet title={`Log ${film.title}`} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="fx-log-film">
          <Poster film={film} />
          <div>
            <h3>{film.title}</h3>
            <FilmMeta film={film} />
          </div>
        </div>
        <label htmlFor="fx-watch-date">Watched on</label>
        <input
          id="fx-watch-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <label htmlFor="fx-watch-rating">Your rating</label>
        <select
          id="fx-watch-rating"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        >
          <option value="">No rating</option>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} / 10
            </option>
          ))}
        </select>
        <label htmlFor="fx-recommend">Would you recommend it?</label>
        <select
          id="fx-recommend"
          value={recommend}
          onChange={(e) => setRecommend(e.target.value)}
        >
          <option value="">Leave undecided</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
        <label htmlFor="fx-watch-notes">
          Private diary note <span className="fx-muted">(optional)</span>
        </label>
        <textarea
          id="fx-watch-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={2000}
          rows={3}
        />
        <label className="fx-check">
          <input
            type="checkbox"
            checked={cinema}
            onChange={(e) => setCinema(e.target.checked)}
          />
          Watched at the cinema
        </label>
        {error && <ErrorState message={error} />}
        <div className="fx-button-row">
          <button
            type="submit"
            className="fx-button fx-primary"
            disabled={busy}
          >
            {busy ? "Saving…" : "Save watch"}
          </button>
          <button
            type="button"
            className="fx-button"
            disabled={busy}
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </Sheet>
  );
}
export function WatchOptions({
  film,
  onClose,
}: {
  film: Film;
  onClose: () => void;
}) {
  const { api, user } = useSession();
  const [country, setCountry] = useState(user?.country ?? "GB");
  const result = useLoad(
    `options:${film.kind}:${film.id}:${country}`,
    (signal) => api.options(film, country),
  );
  const groups = object(object(result.data).watchProviders ?? result.data);
  return (
    <Sheet title="Watch options" onClose={onClose}>
      <h3>{film.title}</h3>
      <label htmlFor="fx-country">Country</label>
      <select
        id="fx-country"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
      >
        {[
          ["GB", "United Kingdom"],
          ["US", "United States"],
          ["AU", "Australia"],
          ["CA", "Canada"],
          ["IE", "Ireland"],
          ["NZ", "New Zealand"],
          ["DE", "Germany"],
          ["FR", "France"],
          ["IN", "India"],
          ["BR", "Brazil"],
        ].map(([id, name]) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
      {result.loading ? (
        <p role="status">Checking viewing options…</p>
      ) : result.error ? (
        <ErrorState message={result.error} retry={result.retry} />
      ) : (
        <>
          {[
            ["stream", "Subscription / free"],
            ["rent", "Rent"],
            ["buy", "Buy"],
          ].map(
            ([key, label]) =>
              list(groups[key]).length > 0 && (
                <section key={key} className="fx-provider-group">
                  <h3>{label}</h3>
                  {list(groups[key]).map((value, i) => {
                    const row = object(value),
                      link = text(row.watchUrl);
                    let href: string | undefined;
                    try {
                      const url = new URL(link);
                      if (url.protocol === "https:") href = url.href;
                    } catch {}
                    return (
                      <div className="fx-option" key={text(row.id) || i}>
                        {imageUrl(text(row.logoPath), "w92") && (
                          <img
                            src={imageUrl(text(row.logoPath), "w92")}
                            alt=""
                          />
                        )}
                        <div>
                          <strong>
                            {text(row.providerName, "Viewing option")}
                          </strong>
                          {href && (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Check viewing details <ArrowRight size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </section>
              ),
          )}
          {!["stream", "rent", "buy"].some((k) => list(groups[k]).length) && (
            <p>
              No viewing options were found for this country. Try another region
              or check your streaming services directly.
            </p>
          )}
          <p className="fx-small fx-muted">
            Availability is supplied through TMDB / JustWatch. Subscriptions,
            rentals or purchases may be required.
          </p>
        </>
      )}
    </Sheet>
  );
}
const moods = [
  ["hooked", "Get hooked"],
  ["switch_off", "Something lighter"],
  ["challenged", "Make me think"],
];
export function Picker({
  onClose,
  onChoose,
}: {
  onClose: () => void;
  onChoose: (film: Film) => void;
}) {
  const { api } = useSession();
  const [mood, setMood] = useState("hooked"),
    [minutes, setMinutes] = useState("120"),
    [busy, setBusy] = useState(false),
    [choices, setChoices] = useState<FilmPick[] | null>(null),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await api.pick(mood, minutes ? Number(minutes) : null);
      setChoices(result.choices);
      setMessage(result.message);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Sheet
      title={choices ? "Tonight’s picks" : "Find tonight’s film"}
      onClose={onClose}
    >
      {choices ? (
        <>
          <p className="fx-muted">
            {message || "A few films that fit your night."}
          </p>
          {choices.map((choice) => (
            <section className="fx-picker-result" key={choice.film.id}>
              <Poster film={choice.film} />
              <div>
                <h3>{choice.film.title}</h3>
                <FilmMeta film={choice.film} />
                <ul>
                  {choice.reasons.slice(0, 3).map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
                {choice.offers.map((offer) => (
                  <p className="fx-small fx-muted" key={offer}>
                    {offer}
                  </p>
                ))}
                <button
                  className="fx-button fx-primary"
                  onClick={() => onChoose(choice.film)}
                >
                  View film
                  <ArrowRight size={16} />
                </button>
              </div>
            </section>
          ))}
          {choices.length === 0 && (
            <p>Try a different mood or give yourself more time.</p>
          )}
          <button className="fx-button" onClick={() => setChoices(null)}>
            Change choices
          </button>
        </>
      ) : (
        <form onSubmit={submit}>
          <p className="fx-muted">What kind of evening are you having?</p>
          <label>Your mood</label>
          <div className="fx-choice-row">
            {moods.map(([id, label]) => (
              <button
                type="button"
                key={id}
                aria-pressed={id === mood}
                onClick={() => setMood(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <label htmlFor="fx-time">How much time?</label>
          <select
            id="fx-time"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
          >
            <option value="90">Up to 90 minutes</option>
            <option value="120">Up to 2 hours</option>
            <option value="180">Up to 3 hours</option>
            <option value="">A longer evening</option>
          </select>
          {error && <ErrorState message={error} />}
          <div className="fx-button-row">
            <button className="fx-button fx-primary" disabled={busy}>
              {busy ? (
                "Finding your films…"
              ) : (
                <>
                  Show my picks
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Sheet>
  );
}

export function TermsSheet({
  version,
  onClose,
  onAccepted,
}: {
  version: string;
  onClose: () => void;
  onAccepted: () => void;
}) {
  const { api } = useSession();
  const [accepted, setAccepted] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!accepted || busy || !version) return;
    setBusy(true);
    try {
      await api.acceptTerms(version);
      onAccepted();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Sheet title="Flixie’s terms" onClose={onClose}>
      <form onSubmit={submit}>
        <p>
          Read the{" "}
          <a
            className="fx-underlined"
            href="/web/terms.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Use
          </a>{" "}
          and{" "}
          <a
            className="fx-underlined"
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>{" "}
          before continuing.
        </p>
        <label className="fx-check">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          I accept Flixie’s Terms of Use and Privacy Policy.
        </label>
        {error && <ErrorState message={error} />}
        <div className="fx-button-row">
          <button
            className="fx-button fx-primary"
            disabled={!accepted || busy || !version}
          >
            {busy ? "Saving…" : "Accept and continue"}
          </button>
          <button type="button" className="fx-button" onClick={onClose}>
            Later
          </button>
        </div>
      </form>
    </Sheet>
  );
}
