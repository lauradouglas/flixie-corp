import { useEffect, useRef, useState, type FormEvent } from "react";
import { Check, ChevronDown, LockKeyhole, ThumbsDown, ThumbsUp, Users } from "lucide-react";
import { ApiError } from "./api";
import { useSession } from "./auth";
import { FilmMeta, Sheet } from "./components";
import { errorMessage } from "./hooks";
import type { Film } from "./models";
import { navigate } from "./routing";
import { saveWatchDraft, WatchDraftError, type WatchDraft, type WatchCheckpoint } from "./watchLogSubmission";
import "./watch-log.css";

function initialDraft(): WatchDraft {
  const now = new Date();
  return {
    date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
    rating: null, recommended: null, notes: "", cinema: false,
    reviewTitle: "", reviewBody: "", spoilers: false, includeReview: true,
  };
}

export function WatchLog({ film, onClose, onSaved }: {
  film: Film;
  onClose: () => void;
  onSaved: (includedReview: boolean) => void;
}) {
  const { api, user } = useSession();
  const [draft, setDraft] = useState(initialDraft);
  const [checkpoint] = useState<WatchCheckpoint>(() => ({ actorUid: user?.externalId ?? "", owner: user?.id ?? "", movieId: film.id, watchEntryId: null }));
  const [busy, setBusy] = useState(false), [watchSaved, setWatchSaved] = useState(false);
  const [uncertain, setUncertain] = useState(false), [error, setError] = useState("");
  const [invalidField, setInvalidField] = useState("");
  const active = useRef(true), submitting = useRef(false);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  useEffect(() => {
    if (!busy && invalidField) { document.getElementById(invalidField)?.focus(); setInvalidField(""); }
  }, [busy, invalidField]);
  const change = <K extends keyof WatchDraft>(key: K, value: WatchDraft[K]) => {
    setDraft(previous => ({ ...previous, [key]: value }));
    if (!uncertain) setError("");
  };
  const hasReview = draft.includeReview && Boolean(draft.reviewBody.trim() || draft.reviewTitle.trim());
  const close = () => checkpoint.watchEntryId ? onSaved(false) : onClose();

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!user || submitting.current || uncertain) return;
    submitting.current = true; setBusy(true); setError("");
    try {
      const result = await saveWatchDraft(api, checkpoint, draft, () => {
        if (active.current) setWatchSaved(true);
      });
      if (active.current) onSaved(result.includedReview);
    } catch (failure) {
      if (!active.current) return;
      if (failure instanceof WatchDraftError) {
        setError(failure.message);
        setInvalidField(failure.field);
      } else if (!checkpoint.watchEntryId && failure instanceof ApiError && (failure.status === 0 || failure.status >= 500)) {
        setUncertain(true);
        setError("We couldn’t confirm whether your watch was saved. Check your diary before logging again. Your review has not been submitted.");
      } else {
        setError((checkpoint.watchEntryId ? "Your watch entry is saved. Your review hasn’t been confirmed. You can retry the review. " : "") + errorMessage(failure));
      }
    } finally {
      submitting.current = false;
      if (active.current) setBusy(false);
    }
  }

  if (!user) return null;
  return <Sheet title={`Your take on ${film.title}`} description={<FilmMeta film={film} />}
    presentation="modal" mobileFullScreen dismissible={!busy} onClose={close}>
    <form className="fx-watch-form" onSubmit={submit} noValidate aria-busy={busy}>
      <div className="fx-watch-content">
        {watchSaved && <p className="fx-watch-status" role="status">Your watch entry is saved. Finish your review below.</p>}
        <fieldset className="fx-watch-entry" disabled={busy || watchSaved || uncertain}>
          <legend>Watch entry</legend>
          <div className="fx-watch-date">
            <label htmlFor="fx-watch-date">Watched on</label>
            <input id="fx-watch-date" type="date" value={draft.date} onChange={e => change("date", e.target.value)} required />
          </div>
          <fieldset className="fx-watch-rating">
            <legend>Your rating</legend>
            <output className="fx-watch-score" aria-live="polite" aria-label={draft.rating ? `${draft.rating} out of 10` : "No rating"}>{draft.rating ?? "—"}<small>/10</small></output>
            <div className="fx-watch-rating-grid">
              {Array.from({ length: 10 }, (_, index) => index + 1).map(value => <label key={value} className="fx-watch-rating-option">
                <input id={`fx-rating-${value}`} type="radio" name="watch-rating" value={value} checked={draft.rating === value} onChange={() => change("rating", value)} aria-label={`Rate ${value} out of 10`} />
                <span>{value}</span>
              </label>)}
            </div>
            <div className="fx-watch-scale"><span>Not for me</span><button className="fx-text-button" type="button" onClick={() => change("rating", null)}>Clear rating</button><span>Loved it</span></div>
          </fieldset>
          <div className="fx-watch-recommend">
            <p id="fx-recommend-label">Would you recommend it?</p>
            <div role="group" aria-labelledby="fx-recommend-label">
              <button id="fx-recommend-yes" className="fx-watch-choice" type="button" aria-pressed={draft.recommended === true} onClick={() => change("recommended", draft.recommended === true ? null : true)}><ThumbsUp size={16} aria-hidden="true" />Yes</button>
              <button className="fx-watch-choice" type="button" aria-pressed={draft.recommended === false} onClick={() => change("recommended", draft.recommended === false ? null : false)}><ThumbsDown size={16} aria-hidden="true" />No</button>
            </div>
          </div>
          <label className="fx-watch-check fx-watch-cinema"><input type="checkbox" checked={draft.cinema} onChange={e => change("cinema", e.target.checked)} />Watched at the cinema</label>
          <details className="fx-watch-private">
            <summary><LockKeyhole size={16} aria-hidden="true" />Add a private diary note<ChevronDown size={16} aria-hidden="true" /></summary>
            <label className="fx-sr-only" htmlFor="fx-watch-notes">Private diary note</label>
            <textarea id="fx-watch-notes" value={draft.notes} onChange={e => change("notes", e.target.value)} maxLength={2000} rows={3} placeholder="Who you watched with, where you were…" />
            <p>Only you can see this note.</p>
          </details>
        </fieldset>
        <fieldset className="fx-watch-review" disabled={busy || uncertain}>
          <legend className="fx-sr-only">Your review</legend>
          <div className="fx-watch-field-label"><label htmlFor="fx-review-title">Review title</label><span>Optional</span></div>
          <input id="fx-review-title" type="text" value={draft.reviewTitle} onChange={e => change("reviewTitle", e.target.value)} maxLength={150} placeholder="Give your review a title" disabled={!draft.includeReview || busy || uncertain} />
          <div className="fx-watch-field-label fx-watch-body-label"><label htmlFor="fx-review-body">Your review</label><span>Optional</span></div>
          <textarea id="fx-review-body" value={draft.reviewBody} onChange={e => change("reviewBody", e.target.value)} maxLength={5000} rows={4} placeholder="What did you think?" disabled={!draft.includeReview || busy || uncertain} aria-describedby="fx-review-help" />
          <div className="fx-watch-review-options">
            <label className="fx-watch-check"><input type="checkbox" checked={draft.spoilers} onChange={e => change("spoilers", e.target.checked)} disabled={!draft.includeReview || busy || uncertain} />Contains spoilers</label>
            <label className="fx-watch-check"><input type="checkbox" checked={draft.includeReview} onChange={e => change("includeReview", e.target.checked)} />Include this review</label>
          </div>
          <p className="fx-watch-help" id="fx-review-help"><Users size={16} aria-hidden="true" />{draft.includeReview ? "Review sharing follows your profile’s privacy settings. Add a rating and recommendation to include a review." : "This review won’t be included. Your diary note stays private."}</p>
        </fieldset>
      </div>
      {error && <p className="fx-watch-error" role="alert">{error}</p>}
      <footer className="fx-watch-footer">
        <button className="fx-text-button" type="button" onClick={close} disabled={busy}>{watchSaved ? "Finish without review" : "Cancel"}</button>
        {uncertain ? <button className="fx-button fx-primary" type="button" onClick={() => { onClose(); navigate("/app/diary"); }}>Check diary</button> :
          <button className="fx-button fx-primary" type="submit" disabled={busy}><Check size={17} aria-hidden="true" />{busy ? "Saving…" : watchSaved ? hasReview ? "Save review" : "Done" : hasReview ? "Save watch & review" : "Save watch"}</button>}
      </footer>
    </form>
  </Sheet>;
}
