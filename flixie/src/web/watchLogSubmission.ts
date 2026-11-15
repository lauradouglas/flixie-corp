import { FlixieApi, type MovieWatchInput, type MovieReviewInput } from "./api";

export interface WatchDraft {
  date: string;
  rating: number | null;
  recommended: boolean | null;
  notes: string;
  cinema: boolean;
  reviewTitle: string;
  reviewBody: string;
  spoilers: boolean;
  includeReview: boolean;
}
export interface WatchCheckpoint {
  actorUid: string;
  owner: string;
  movieId: number;
  watchEntryId: string | null;
}
export class WatchDraftError extends Error {
  constructor(message: string, readonly field: string) { super(message); }
}
export function prepareWatchDraft(movieId: number, draft: WatchDraft): {
  watch: MovieWatchInput;
  review: MovieReviewInput | null;
} {
  const watchedAt = new Date(draft.date + "T12:00:00");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date) || Number.isNaN(watchedAt.getTime()) ||
      watchedAt.getFullYear() !== Number(draft.date.slice(0, 4)) ||
      watchedAt.getMonth() + 1 !== Number(draft.date.slice(5, 7)) ||
      watchedAt.getDate() !== Number(draft.date.slice(8)))
    throw new WatchDraftError("Choose a valid watch date.", "fx-watch-date");
  if (draft.rating !== null && (!Number.isInteger(draft.rating) || draft.rating < 1 || draft.rating > 10))
    throw new WatchDraftError("Choose a rating between 1 and 10.", "fx-rating-1");
  if (draft.notes.length > 2000) throw new WatchDraftError("Keep your private note under 2,000 characters.", "fx-watch-notes");
  const title = draft.reviewTitle.trim(), body = draft.reviewBody.trim();
  let review: MovieReviewInput | null = null;
  if (draft.includeReview && (title || body)) {
    if (!body) throw new WatchDraftError("Add your review text, or untick Include this review to save only the watch.", "fx-review-body");
    if (title.length > 150) throw new WatchDraftError("Keep your review title under 150 characters.", "fx-review-title");
    if (body.length > 5000) throw new WatchDraftError("Keep your review under 5,000 characters.", "fx-review-body");
    if (draft.rating === null) throw new WatchDraftError("Choose a rating to include your review.", "fx-rating-1");
    if (draft.recommended === null) throw new WatchDraftError("Choose Yes or No for the recommendation to include your review.", "fx-recommend-yes");
    review = { title, body, rating: draft.rating, recommended: draft.recommended, containsSpoilers: draft.spoilers };
  }
  return {
    watch: { movieId, watchedAt: watchedAt.toISOString(), rating: draft.rating, recommended: draft.recommended, notes: draft.notes, watchedAtCinema: draft.cinema },
    review,
  };
}

/** The checkpoint survives review failures. A retry upserts that watch's review. */
export async function saveWatchDraft(
  api: FlixieApi,
  checkpoint: WatchCheckpoint,
  draft: WatchDraft,
  onWatchSaved: () => void = () => {},
) {
  const { watch, review } = prepareWatchDraft(checkpoint.movieId, draft);
  api.assertIdentity(checkpoint.actorUid);
  if (!checkpoint.watchEntryId) {
    const receipt = await api.log(checkpoint.owner, watch);
    checkpoint.watchEntryId = receipt.id;
    onWatchSaved();
  }
  api.assertIdentity(checkpoint.actorUid);
  if (review) await api.addMovieReview(checkpoint.owner, checkpoint.movieId, checkpoint.watchEntryId, review);
  return { includedReview: review !== null };
}
