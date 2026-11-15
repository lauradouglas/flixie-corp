import { test } from "node:test";
import assert from "node:assert/strict";
import { FlixieApi, ApiError, SessionChanged, type Identity } from "../src/web/api";
import { film } from "../src/web/models";
import { matchesSavedProvider, offerLabel, providerOffers, providerWatchUrl, savedProviders } from "../src/web/watchProviders";

const title = { id: 348, kind: "movie" as const };
const link = "https://www.themoviedb.org/movie/348-alien/watch?locale=GB";
const netflix = { id: 8, providerName: "Netflix", logoPath: "/netflix.jpg", watchUrl: link };
const amazon = { providerId: 10, providerName: "Amazon Video", logoPath: "/amazon.jpg", watchUrl: link };
const groups = { stream: [netflix], rent: [amazon], buy: [amazon] };
const identity: Identity = { uid: "dev-web-alex", token: async () => "local-token" };
const reply = (value: unknown) => new Response(JSON.stringify(value), { headers: { "Content-Type": "application/json" } });

test("overview combines rent/buy offers, handles movie/show IDs and preserves the country watch link", () => {
  const offers = providerOffers({ watchProviders: groups }, title);
  assert.deepEqual(offers.map(offer => [offer.id, offer.name, offerLabel(offer)]), [[8, "Netflix", "Stream"], [10, "Amazon Video", "Rent or buy"]]);
  assert.equal(offers[0].href, link);
  assert.equal(offers[1].logo, "/amazon.jpg");
  const shows = providerOffers({ stream: [{ providerId: 8, providerName: "Netflix", watchUrl: "https://www.themoviedb.org/tv/15621-the-newsroom/watch?locale=US" }], rent: [], buy: [] }, { id: 15621, kind: "show" });
  assert.equal(shows[0].id, 8); assert.match(shows[0].href!, /locale=US/);
});

test("saved-service matching supports refreshed IDs without conflating Amazon rental, Prime or add-on plans", () => {
  const selected = savedProviders({ watchProviders: [{ id: 8, providerName: "Netflix" }, { id: 9, providerName: "Amazon Prime Video" }] });
  assert(matchesSavedProvider({ id: 999, name: "NETFLIX" }, selected));
  assert(matchesSavedProvider({ id: 8, name: "Netflix" }, selected));
  assert(!matchesSavedProvider({ id: 10, name: "Amazon Video" }, selected));
  assert(!matchesSavedProvider({ id: 2100, name: "Amazon Prime Video with Ads" }, selected));
  assert(!matchesSavedProvider({ id: 500, name: "Netflix Channel" }, selected));
  const rental = providerOffers({ stream: [], rent: [amazon], buy: [] }, title)[0];
  assert.equal(offerLabel(rental), "Rent");
});

test("malformed service or offer responses are errors, while valid empty availability remains empty", () => {
  for (const value of [null, {}, { stream: "failed", rent: [], buy: [] }, { stream: [{ providerName: "Missing ID" }], rent: [], buy: [] }])
    assert.throws(() => providerOffers(value, title));
  assert.throws(() => savedProviders({ error: "not loaded" }));
  assert.deepEqual(providerOffers({ stream: [], rent: [], buy: [] }, title), []);
  assert.deepEqual(savedProviders({ watchProviders: [] }), []);
});

test("provider links require a source-supplied HTTPS TMDB watch page for the exact title", () => {
  for (const value of ["javascript:alert(1)", "https://example.com/watch", "https://www.themoviedb.org.attacker.test/movie/348/watch", "https://token@www.themoviedb.org/movie/348/watch", "https://www.themoviedb.org/movie/999/watch", "https://www.themoviedb.org/tv/348/watch", "https://www.themoviedb.org/movie/348"])
    assert.equal(providerWatchUrl(value, title), null);
  assert.equal(providerWatchUrl(link, title), link);
});

test("personal services require sign-in; availability stays public and country-specific", async () => {
  const calls: { path: string; options: RequestInit | undefined }[] = [];
  const api = new FlixieApi("http://127.0.0.1:3000", () => identity, async (path, options) => {
    calls.push({ path: String(path), options });
    return String(path).endsWith("watch-providers") ? reply({ watchProviders: [netflix] }) : reply({ watchProviders: groups });
  });
  assert.equal((await api.savedProviders("alex"))[0].name, "Netflix");
  assert.equal(calls[0].path, "http://127.0.0.1:3000/users/alex/watch-providers");
  assert.equal((calls[0].options?.headers as Record<string, string>).Authorization, "Bearer local-token");
  await api.options(film({ id: 348 }), "GB");
  await api.options(film({ id: 348 }), "US");
  assert.match(calls[1].path, /\/movies\/348\/GB\/watch\/providers$/);
  assert.match(calls[2].path, /\/movies\/348\/US\/watch\/providers$/);
  assert.equal((calls[1].options?.headers as Record<string, string>).Authorization, undefined);
  let guestCalls = 0;
  const guest = new FlixieApi("http://127.0.0.1:3000", () => null, async () => { guestCalls++; return reply({}); });
  await assert.rejects(guest.savedProviders("alex"), ApiError);
  assert.equal(guestCalls, 0);
});

test("a service response from the previous account is discarded after an account switch", async () => {
  let active: Identity | null = identity;
  const api = new FlixieApi("http://127.0.0.1:3000", () => active, async () => {
    active = { uid: "dev-web-robin", token: async () => "robin-token" };
    return reply({ watchProviders: [netflix] });
  });
  await assert.rejects(api.savedProviders("alex"), SessionChanged);
});
