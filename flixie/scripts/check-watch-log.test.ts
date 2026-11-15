import { test } from "node:test";
import assert from "node:assert/strict";
import { FlixieApi, ApiError, SessionChanged, type Identity } from "../src/web/api";
import { diaryEntry } from "../src/web/models";
import { prepareWatchDraft, saveWatchDraft, WatchDraftError, type WatchDraft, type WatchCheckpoint } from "../src/web/watchLogSubmission";

const identity: Identity = { uid: "dev-web-alex", token: async () => "local-token" };
const checkpoint = (): WatchCheckpoint => ({ actorUid: identity.uid, owner: "alex", movieId: 1339713, watchEntryId: null });
const draft = (): WatchDraft => ({ date: "2026-11-14", rating: 8, recommended: true, notes: "Private: watched with a friend", cinema: true, reviewTitle: "", reviewBody: " A fictional LOCAL review. ", spoilers: true, includeReview: true });
const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

test("all-in-one save links the review to its watch, keeps the title optional and never publishes diary notes", async () => {
  const calls: { path: string; body: Record<string, unknown> }[] = [];
  const api = new FlixieApi("http://127.0.0.1:3000", () => identity, async (url, options) => {
    assert.equal((options?.headers as Record<string, string>).Authorization, "Bearer local-token");
    calls.push({ path: String(url), body: JSON.parse(String(options?.body)) });
    return calls.length === 1 ? reply({ id: "watch-local" }, 201) : reply({ id: "review-local" });
  });
  assert.deepEqual(await saveWatchDraft(api, checkpoint(), draft()), { includedReview: true });
  assert.equal(calls[0].path, "http://127.0.0.1:3000/users/alex/movie/watches");
  assert.equal(calls[0].body.notes, "Private: watched with a friend");
  assert.equal(calls[0].body.watchedAtCinema, true);
  assert.equal(calls[1].path, "http://127.0.0.1:3000/users/add/MOVIE/review");
  assert.deepEqual(calls[1].body, { review: { title: "", body: "A fictional LOCAL review.", rating: 8, recommended: true, containsSpoilers: true, userId: "alex", mediaId: 1339713, watchEntryId: "watch-local", language: "en" } });
});

test("unticking review saves only the watch and preserves an undecided recommendation/no rating", async () => {
  const calls: Record<string, unknown>[] = [];
  const api = new FlixieApi("http://127.0.0.1:3000", () => identity, async (_url, options) => {
    calls.push(JSON.parse(String(options?.body))); return reply({ id: "watch-only" }, 201);
  });
  const value = { ...draft(), rating: null, recommended: null, includeReview: false };
  assert.deepEqual(await saveWatchDraft(api, checkpoint(), value), { includedReview: false });
  assert.equal(calls.length, 1); assert.equal(calls[0].rating, null); assert.equal(calls[0].recommended, null);
  assert.equal("review" in calls[0], false);
});

test("incomplete review choices, title without text and invalid dates fail before any write", async () => {
  let writes = 0;
  const api = new FlixieApi("http://127.0.0.1:3000", () => identity, async () => { writes++; return reply({ id: "unexpected" }); });
  for (const change of [
    { rating: null }, { recommended: null }, { reviewTitle: "A title", reviewBody: " " },
    { date: "2026-02-30" }, { rating: 8.5 }, { reviewBody: "a".repeat(5001) },
  ]) await assert.rejects(saveWatchDraft(api, checkpoint(), { ...draft(), ...change }), WatchDraftError);
  assert.equal(writes, 0);
  assert.equal(prepareWatchDraft(1339713, { ...draft(), reviewBody: "", reviewTitle: "", rating: null, recommended: null }).review, null);
});

test("a failed review retries against the same watch without duplicating its diary entry", async () => {
  let watches = 0, reviews = 0;
  const linkedIds: unknown[] = [];
  const api = new FlixieApi("http://127.0.0.1:3000", () => identity, async (url, options) => {
    if (String(url).endsWith("/watches")) { watches++; return reply({ id: "saved-watch" }, 201); }
    reviews++; linkedIds.push(JSON.parse(String(options?.body)).review.watchEntryId);
    return reviews === 1 ? reply({ error: "Try another phrase." }, 400) : reply({ id: "saved-review" });
  });
  const state = checkpoint();
  await assert.rejects(saveWatchDraft(api, state, draft()), ApiError);
  assert.equal(state.watchEntryId, "saved-watch");
  await saveWatchDraft(api, state, { ...draft(), reviewTitle: "New title", recommended: false });
  assert.equal(watches, 1); assert.equal(reviews, 2); assert.deepEqual(linkedIds, ["saved-watch", "saved-watch"]);
});

test("an account change between watch and review cannot submit the old account's review", async () => {
  let current: Identity | null = identity, writes = 0;
  const api = new FlixieApi("http://127.0.0.1:3000", () => current, async () => { writes++; return reply({ id: "watch" }, 201); });
  const state = checkpoint();
  await assert.rejects(saveWatchDraft(api, state, draft(), () => { current = { uid: "another-user", token: async () => "new-token" }; }), SessionChanged);
  assert.equal(writes, 1);
  await assert.rejects(saveWatchDraft(api, state, draft()), SessionChanged);
  assert.equal(writes, 1);
});

test("finishing a saved watch without its failed review performs no additional write", async () => {
  let writes = 0;
  const api = new FlixieApi("http://127.0.0.1:3000", () => identity, async () => { writes++; throw new Error("Unexpected write"); });
  const state = { ...checkpoint(), watchEntryId: "already-saved-watch" };
  assert.deepEqual(await saveWatchDraft(api, state, { ...draft(), includeReview: false }), { includedReview: false });
  assert.equal(writes, 0);
});

test("a missing diary receipt fails safely and cannot create an unlinked review", async () => {
  let writes = 0;
  const api = new FlixieApi("http://127.0.0.1:3000", () => identity, async () => { writes++; return reply({ ok: true }, 201); });
  await assert.rejects(saveWatchDraft(api, checkpoint(), draft()), (error: unknown) => error instanceof ApiError && error.code === "WATCH_RECEIPT_MISSING");
  assert.equal(writes, 1);
});

test("owner diary exposes the linked review, but ignores another watch's or account's review", () => {
  const base = { id: "watch", userId: "alex", movie: { id: 1339713, title: "Obsession" }, notes: "Private" };
  const review = { id: "review", userId: "alex", watchEntryId: "watch", title: "", body: "LOCAL review", containsSpoilers: true };
  assert.equal(diaryEntry({ ...base, reviews: [review] }).review?.containsSpoilers, true);
  assert.equal(diaryEntry({ ...base, reviews: [{ ...review, userId: "jamie" }] }).review, null);
  assert.equal(diaryEntry({ ...base, reviews: [{ ...review, watchEntryId: "other" }] }).review, null);
});
