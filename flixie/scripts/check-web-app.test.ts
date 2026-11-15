import { test } from "node:test";
import assert from "node:assert/strict";
import {
  FlixieApi,
  ApiError,
  SessionChanged,
  type Identity,
} from "../src/web/api";
import { makeConfig } from "../src/web/config";
import { account, avatarBorder, film, watchlist } from "../src/web/models";
import { parseRoute, safeNext } from "../src/web/routing";
const local = "http://127.0.0.1:3000";
const identity: Identity = {
  uid: "local-alex",
  token: async (force) => (force ? "fresh" : "current"),
};
const reply = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });
test("local frontend cannot connect to production services", () => {
  assert.equal(
    makeConfig({ DEV: true }, "127.0.0.1").firebase.projectId,
    "demo-flixie-local",
  );
  assert.throws(() => makeConfig({ DEV: true }, "www.flixie.co.uk"));
  assert.throws(() =>
    makeConfig(
      { DEV: true, VITE_FLIXIE_API_URL: "https://production.example" },
      "localhost",
    ),
  );
  assert.throws(() =>
    makeConfig(
      { MODE: "production", VITE_FLIXIE_API_URL: local },
      "www.flixie.co.uk",
    ),
  );
});
test("the website production build has the registered Flixie Firebase web app without private build environment values", () => {
  const config = makeConfig({ MODE: "production" }, "www.flixie.co.uk");
  assert.equal(config.local, false);
  assert.equal(config.firebase.projectId, "flixie-9a8eb");
  assert.equal(config.firebase.appId, "1:1093787683868:web:cbfb38400d174042e963d9");
  assert.equal(config.firebase.authDomain, "flixie-9a8eb.firebaseapp.com");
  assert.match(config.firebase.apiKey, /^AIza[\w-]+$/);
  assert.equal(new URL(config.apiUrl).protocol, "https:");
});
test("shared links and sign-in continuation retain the title and reject external destinations", () => {
  assert.deepEqual(parseRoute("/shows/15621"), {
    page: "title",
    id: 15621,
    kind: "show",
  });
  assert.equal(parseRoute("/movies/2147483648").page, "home");
  assert.equal(safeNext("/movies/348"), "/movies/348");
  for (const value of [
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/app/../../evil",
  ])
    assert.equal(safeNext(value), "/app");
});
test("real watchlist response preserves both media types and filters removed items", () => {
  const items = watchlist({
    movieWatchlistWithWatchedStatus: [
      { movie: { id: 348, title: "Alien" } },
      { removed: true, movie: { id: 2 } },
    ],
    showWatchlistWithWatchedStatus: [
      { show: { id: 15621, name: "The Newsroom" } },
    ],
  });
  assert.deepEqual(
    items.map(({ id, kind, title }) => ({ id, kind, title })),
    [
      { id: 348, kind: "movie", title: "Alien" },
      { id: 15621, kind: "show", title: "The Newsroom" },
    ],
  );
});
test("scores follow the app’s twenty-vote threshold and name the source", () => {
  const title = {
    id: 348,
    voteAverage: 9,
    voteCount: 19,
    tmdbVoteAverage: 8.2,
    tmdbVoteCount: 500,
  };
  assert.equal(film(title).scoreSource, "TMDB");
  assert.equal(film({ ...title, voteCount: 20 }).scoreSource, "Flixie");
  assert.equal(film({ ...title, voteCount: 20, voteAverage: 11 }).score, 8.2);
  assert.equal(film({ id: 1, tmdbVoteAverage: 0 }).score, null);
});
test("avatar preference requires the user’s earned border and honours no border", () => {
  assert.equal(
    avatarBorder(["OG_USER", "VERIFIED", "FRAME:VERIFIED"]),
    "VERIFIED",
  );
  assert.equal(avatarBorder(["OG_USER", "FRAME:FOUNDER"]), "OG_USER");
  assert.equal(avatarBorder(["OG_USER", "FRAME:NONE"]), "");
  assert.equal(
    avatarBorder(["BORDER_CHRISTMAS_LIGHTS", "FOUNDER"]),
    "BORDER_CHRISTMAS_LIGHTS",
  );
  assert.throws(() =>
    account({ id: "private-person", externalId: "different" }, "local-alex"),
  );
});
test("a refreshed token is retried once after 401", async () => {
  const auth: string[] = [];
  const api = new FlixieApi(
    local,
    () => identity,
    async (_url, init) => {
      auth.push(
        String((init?.headers as Record<string, string>).Authorization),
      );
      return auth.length === 1 ? reply({}, 401) : reply({ ok: true });
    },
  );
  assert.deepEqual(await api.request("/users/me/terms"), { ok: true });
  assert.deepEqual(auth, ["Bearer current", "Bearer fresh"]);
});
test("network failure never automatically repeats a diary write", async () => {
  let count = 0;
  const api = new FlixieApi(
    local,
    () => identity,
    async () => {
      count++;
      throw new TypeError("offline");
    },
  );
  await assert.rejects(
    api.log("alex", {
      movieId: 348,
      watchedAt: "2026-11-14T12:00:00Z",
      rating: 9,
      recommended: true,
      notes: "Private",
      watchedAtCinema: false,
    }),
    ApiError,
  );
  assert.equal(count, 1);
});
test("successful diary receipt does not need nested movie data", async () => {
  let body: Record<string, unknown> = {};
  const api = new FlixieApi(
    local,
    () => identity,
    async (url, init) => {
      assert.equal(String(url), local + "/users/alex/movie/watches");
      body = JSON.parse(String(init?.body));
      return reply({ id: "watch-1" }, 201);
    },
  );
  await api.log("alex", {
    movieId: 348,
    watchedAt: "2026-11-14T12:00:00Z",
    rating: 9,
    recommended: true,
    notes: "Private",
    watchedAtCinema: true,
  });
  assert.equal(body.movieId, 348);
  assert.equal(body.rating, 9);
  assert.equal(body.notes, "Private");
});
test("account changes discard an in-flight private response", async () => {
  let active: Identity | null = identity;
  const api = new FlixieApi(
    local,
    () => active,
    async () => {
      active = { uid: "robin", token: async () => "" };
      return reply({ private: true });
    },
  );
  await assert.rejects(api.request("/users/alex/watchlists"), SessionChanged);
});
test("guest metadata omits reviews and bearer token; save uses the show endpoint", async () => {
  const calls: { path: string; init: RequestInit | undefined }[] = [];
  const api = new FlixieApi(
    local,
    () => identity,
    async (url, init) => {
      calls.push({ path: String(url), init });
      return reply({ id: 348, title: "Alien" });
    },
  );
  await api.title(348, "movie");
  assert.ok(
    calls[0].path.endsWith(
      "/movies/id/348?includeReviews=false&includeTmdbRating=true",
    ),
  );
  assert.equal(
    (calls[0].init?.headers as Record<string, string>).Authorization,
    undefined,
  );
  await api.save(
    "alex",
    film({ id: 15621, name: "The Newsroom" }, "show"),
    true,
  );
  assert.ok(calls[1].path.endsWith("/users/alex/show/watchlist/15621"));
  assert.equal(calls[1].init?.method, "POST");
});

test("download prompt chooses the correct mobile store and defers to Safari’s native banner", async () => {
  const { mobilePromptDevice } = await import("../src/web/appPrompt");
  assert.equal(
    mobilePromptDevice("Mozilla Android Chrome Safari", "Linux", 5, 390),
    "android",
  );
  assert.equal(
    mobilePromptDevice("Mozilla iPhone Safari", "iPhone", 5, 390),
    null,
  );
  assert.equal(
    mobilePromptDevice("Mozilla iPhone CriOS Safari", "iPhone", 5, 390),
    "ios",
  );
  assert.equal(
    mobilePromptDevice("Mozilla Macintosh Safari", "MacIntel", 0, 1440),
    null,
  );
});

test("a Firebase account without a Flixie profile can complete registration, while service failures remain errors", async () => {
  const missing = new FlixieApi(
    local,
    () => identity,
    async () => reply({ error: "User not found" }, 404),
  );
  assert.equal(await missing.profile(identity.uid), null);
  const unavailable = new FlixieApi(
    local,
    () => identity,
    async () => reply({}, 503),
  );
  await assert.rejects(unavailable.profile(identity.uid), ApiError);
});

test("cast portraits preserve actual roles, ordering and unique people", async () => {
  const { castMembers } = await import("../src/web/titleDetails");
  const cast = castMembers({
    castMembers: [
      {
        id: 2,
        name: "Second actor",
        character: "Ian",
        profileImage: "/ian.jpg",
        order: 2,
      },
      {
        id: 1,
        name: "First actor",
        character: "Bear",
        profileImage: "https://image.tmdb.org/t/p/w185/bear.jpg",
        order: 0,
      },
      { id: 1, name: "Duplicate" },
      { id: 0, name: "Invalid" },
      { id: 2147483648, name: "Outside person route range" },
    ],
  });
  assert.deepEqual(
    cast.map((person) => person.name),
    ["First actor", "Second actor"],
  );
  assert.equal(cast[0].character, "Bear");
  assert.equal(cast[0].portrait, "https://image.tmdb.org/t/p/w185/bear.jpg");
});
test("photo gallery distinguishes full poster artwork from real movie stills", async () => {
  const { titlePhotos } = await import("../src/web/titleDetails");
  const photos = titlePhotos({
    backdrops: [
      { imageUrl: "/scene.jpg", width: 1920, height: 1080 },
      { imageUrl: "/scene.jpg" },
      { imageUrl: "javascript:alert(1)" },
    ],
    posters: [{ file_path: "/poster.jpg", width: 1000, height: 1500 }],
    logos: [{ imageUrl: "/logo.png" }],
  });
  assert.deepEqual(
    photos.map((photo) => photo.kind),
    ["still", "poster"],
  );
  assert.equal(photos[1].width, 1000);
  assert.equal(photos[1].height, 1500);
});
test("friend opinions retain their own badge borders and never carry unmarked snippets or infer recommendations", async () => {
  const { friendOpinions } = await import("../src/web/titleDetails");
  const opinions = friendOpinions({
    friends: [
      {
        userId: "jamie",
        username: "Jamie",
        rating: 9,
        watched: true,
        recommends: false,
        profileBadges: ["OG_USER", "FRAME:OG_USER"],
        reviewSnippet: "PRIVATE SPOILER",
      },
      {
        userId: "robin",
        username: "Robin",
        rating: null,
        watched: true,
        recommends: true,
        profileBadges: ["VERIFIED"],
      },
      {
        userId: "inactive",
        username: "No activity",
        rating: null,
        recommends: false,
      },
    ],
  });
  assert.equal(opinions.friends.length, 2);
  assert.equal(opinions.average, 9);
  assert.equal(opinions.ratedCount, 1);
  assert.equal(opinions.watchedCount, 2);
  assert.equal(opinions.recommendedCount, 1);
  assert.equal(opinions.friends[0].recommends, false);
  assert.deepEqual(opinions.friends[0].person.profileBadges, [
    "OG_USER",
    "FRAME:OG_USER",
  ]);
  assert.doesNotMatch(
    JSON.stringify(opinions),
    /PRIVATE SPOILER|reviewSnippet/,
  );
});
test("public movie credits and gallery requests do not send account credentials", async () => {
  const calls: RequestInit[] = [];
  const api = new FlixieApi(
    local,
    () => identity,
    async (url, init) => {
      calls.push(init ?? {});
      return String(url).endsWith("/credits")
        ? reply({
            castMembers: [{ id: 1, name: "Actor", profileImage: "/actor.jpg" }],
            crewMembers: [{ job: "Director", name: "Director" }],
          })
        : reply({ backdrops: [{ imageUrl: "/scene.jpg" }] });
    },
  );
  assert.equal((await api.credits(1339713, "movie")).cast[0].name, "Actor");
  assert.equal((await api.images(1339713, "movie"))[0].kind, "still");
  for (const call of calls)
    assert.equal(
      (call.headers as Record<string, string>).Authorization,
      undefined,
    );
});
test("a signed-out visitor cannot request private title friends", async () => {
  let calls = 0;
  const api = new FlixieApi(
    local,
    () => null,
    async () => {
      calls++;
      return reply({});
    },
  );
  await assert.rejects(api.titleFriends(1339713, "movie"), ApiError);
  assert.equal(calls, 0);
});
test("movie and show friends use their authenticated title scope and reject a different title", async () => {
  const calls: { url: string; init?: RequestInit }[] = [];
  const api = new FlixieApi(
    local,
    () => identity,
    async (url, init) => {
      calls.push({ url: String(url), init });
      return String(url).endsWith("/shows/friend-recommendations")
        ? reply({
            items: [
              {
                showId: 15621,
                friends: [
                  {
                    userId: "watched-only",
                    username: "Friend",
                    watched: true,
                    profileBadges: ["FOUNDER"],
                  },
                ],
              },
            ],
          })
        : reply({ movieId: "1339713", friends: [] });
    },
  );
  await api.titleFriends(1339713, "movie");
  assert.ok(calls[0].url.endsWith("/movies/1339713/friend-recommendation"));
  assert.equal(
    (calls[0].init?.headers as Record<string, string>).Authorization,
    "Bearer current",
  );
  const show = await api.titleFriends(15621, "show");
  assert.equal(show.friends[0].watched, true);
  assert.deepEqual(JSON.parse(String(calls[1].init?.body)), {
    showIds: [15621],
  });
  await assert.rejects(api.titleFriends(348, "movie"), ApiError);
});
