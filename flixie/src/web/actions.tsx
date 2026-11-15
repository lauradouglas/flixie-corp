import { useState, type FormEvent } from "react";
import { ArrowRight, Monitor } from "lucide-react";
import { useSession } from "./auth";
import { ErrorState, Sheet } from "./components";
import { useLoad, errorMessage } from "./hooks";
import {
  imageUrl,
  list,
  object,
  text,
  type Film,
  type Plan,
} from "./models";
export type Action =
  | { type: "login"; save?: Film }
  | { type: "log"; film: Film }
  | { type: "options"; film: Film }
  | { type: "picker" }
  | { type: "plan"; plan: Plan }
  | { type: "terms"; version: string };
export { WatchLog } from "./WatchLog";
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
    (signal) => api.options(film, country, signal),
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
export { default as Picker } from './PickForUsDialog';

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
