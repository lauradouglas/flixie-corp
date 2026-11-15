import { test } from "node:test";
import assert from "node:assert/strict";
import { FlixieApi, ApiError } from "../src/web/api";
import { directorPeople, displayPersonDate, personDate, talent, talentCredits, selectTalentCredits } from "../src/web/personDetails";
import { parseRoute, personPath, safeNext } from "../src/web/routing";
import { catalogPeople, personPages } from "../src/peopleCatalog";
import { pageFromPath } from "../src/site";
import { renderHead } from "../src/seo";
import { castMembers } from "../src/web/titleDetails";

const person = { id: 525, name: "Christopher Nolan", department: "Directing", biography: "A public biography.", dateOfBirth: "1970-07-30", dateOfDeath: null, profileImgUrl: "/portrait.jpg", imdbId: "nm0634240", images: [{ personId: 525, imageUrl: "/portrait.jpg" }] };
const movie = { id: 348, type: "movie", title: "Alien", posterPath: "/alien.jpg", characters: ["Ripley"], releaseDate: "1979-05-25T00:00:00.000Z", popularity: 8 };
const raw = { allCredits: [movie, { ...movie, characters: ["Ripley", "Voice"] }, { ...movie, type: "tv", title: "Alien: Earth", releaseDate: "2025-08-12" }], crewCredits: [{ ...movie, characters: [], department: "Directing", job: "Director" }, { ...movie, characters: [], department: "Writing", job: "Screenplay" }, { ...movie, characters: [], department: "Writing", job: "Screenplay" }], knownForCredits: [movie, movie] };
const defaults = { role: "all", media: "all", query: "", year: "", sort: "newest" } as const;
const response = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });

test("cast/director person paths work with sign-in continuation and bounded numeric routes", () => {
  assert.equal(personPath(525), "/people/525");
  assert.deepEqual(parseRoute("/people/525/"), { page: "person", id: 525 });
  assert.equal(safeNext("/people/525"), "/people/525");
  for (const path of ["/people/0", "/people/-1", "/people/2147483648", "/people/525/elsewhere"]) assert.notEqual(parseRoute(path).page, "person");
  assert.equal(safeNext("https://evil.example/people/525"), "/app");
});
test("person information rejects the wrong identity and preserves only valid public facts/images", () => {
  const result = talent({ ...person, privateNote: "PRIVATE", images: [...person.images, ...person.images, { personId: 1, imageUrl: "/other.jpg" }, { personId: 525, imageUrl: "javascript:bad" }] }, 525);
  assert.equal(result.photos.length, 1); assert.equal(result.birthDate, "1970-07-30");
  assert.equal(result.deathDate, ""); assert.equal(result.imdbId, "nm0634240");
  assert(!JSON.stringify(result).includes("PRIVATE"));
  assert.throws(() => talent(person, 1892)); assert.throws(() => talent(null, 525));
  assert.equal(personDate("2026-02-30"), ""); assert.equal(personDate(null), "");
  assert.equal(displayPersonDate("1970-07-30"), "30 Jul 1970");
});
test("Nolan always uses the user-selected portrait after metadata refresh, including cast cards and static search metadata", () => {
  const preferred = "/kWogkBJKzXFJSY8cZpuzanfsaFi.jpg";
  const nextDefault = "/a-different-tmdb-default.jpg";
  assert.equal(talent({ ...person, profileImgUrl: nextDefault }, 525).portrait, preferred);
  assert.equal(castMembers({ castMembers: [{ id: 525, name: "Christopher Nolan", profileImage: nextDefault }] })[0].portrait, preferred);
  assert.equal(talent({ ...person, id: 1892, name: "Matt Damon", images: [], profileImgUrl: nextDefault }, 1892).portrait, nextDefault);
  assert.equal(catalogPeople.find(p => p.person.id === 525)?.person.portrait, preferred);
  assert(renderHead("person-525").includes(preferred));
});
test("sparse person profiles use a valid gallery portrait without borrowing another person's image or tagged artwork", () => {
  const sparse = { id: 10205, name: "Sigourney Weaver", profileImgUrl: null, images: [
    { personId: 1, imageUrl: "/other-person.jpg", aspectRatio: .667 },
    { personId: 10205, imageUrl: "/tagged-poster.jpg", imageType: "poster", aspectRatio: .667 },
    { personId: 10205, imageUrl: "/tagged-still.jpg", imageType: "still", aspectRatio: .667 },
    { personId: 10205, imageUrl: "/landscape.jpg", aspectRatio: 1.778 },
    { personId: 10205, imageUrl: "/portrait.jpg", aspectRatio: .667 },
  ] };
  assert.equal(talent(sparse, 10205).portrait, "/portrait.jpg");
  assert.equal(talent({ ...sparse, profileImgUrl: "/chosen.jpg" }, 10205).portrait, "/chosen.jpg");
  assert.equal(talent({ ...sparse, images: [] }, 10205).portrait, "");
});
test("director names keep real person IDs, deduplicate, and exclude Director of Photography", () => {
  assert.deepEqual(directorPeople({ crewMembers: [{ id: 525, name: "Christopher Nolan", job: "Director" }, { id: 525, name: "Christopher Nolan", job: "Director" }, { id: 1, name: "Camera", job: "Director of Photography" }, { name: "Missing ID", job: "Director" }] }), [{ id: 525, name: "Christopher Nolan" }]);
});
test("filmography merges acting/crew roles by media AND title, and links known-for work to the merged credit", () => {
  const result = talentCredits(raw);
  assert.equal(result.all.length, 2); assert.equal(result.knownFor.length, 1);
  assert.deepEqual(result.all[0].roles, ["Ripley", "Voice"]);
  assert.deepEqual(result.all[0].jobs.map(j => j.job), ["Director", "Screenplay"]);
  assert.equal(result.knownFor[0], result.all[0]);
  assert.equal(result.all[1].kind, "show");
});
test("role, media, year and character search select real matching credits, with released-first newest order", () => {
  const all = talentCredits({ ...raw, crewCredits: [...raw.crewCredits, { ...movie, id: 9, job: "Director of Photography", department: "Camera" }], allCredits: [...raw.allCredits, { ...movie, id: 10, title: "Future", releaseDate: "2027-01-01" }, { ...movie, id: 11, title: "Undated", releaseDate: null }] }).all;
  assert.deepEqual(selectTalentCredits(all, { ...defaults, role: "directing" }).map(c => c.id), [348]);
  assert.deepEqual(selectTalentCredits(all, { ...defaults, role: "writing", media: "movie", year: "1979", query: "Voice" }).map(c => c.id), [348]);
  assert.equal(selectTalentCredits(all, { ...defaults, media: "show" }).length, 1);
  const sorted = selectTalentCredits(all, defaults, "2026-11-14");
  assert(sorted.findIndex(c => c.id === 10) > sorted.findIndex(c => c.kind === "show"));
  assert.equal(sorted.at(-1)?.title, "Undated");
  assert.equal(selectTalentCredits(all, { ...defaults, query: "nothing matches" }).length, 0);
});
test("malformed credits remain errors; valid empty credits and unsupported/adult rows remain distinct", () => {
  assert.throws(() => talentCredits({ error: "unavailable" }));
  assert.deepEqual(talentCredits({ allCredits: [], crewCredits: [], knownForCredits: [] }), { all: [], knownFor: [] });
  const result = talentCredits({ allCredits: [{ ...movie, adult: true }, { ...movie, type: "person" }, { ...movie, id: 0 }], crewCredits: [], knownForCredits: [] });
  assert.equal(result.all.length, 0);
});
test("person reads use existing PUBLIC endpoints, no bearer credentials, and honor request cancellation", async () => {
  const calls: { url: string; init?: RequestInit }[] = [], controller = new AbortController();
  const api = new FlixieApi("http://127.0.0.1:3000", () => ({ uid: "local-user", token: async () => { throw new Error("Must not request a token"); } }), async (url, init) => { calls.push({ url: String(url), init }); return response(String(url).endsWith("credits") ? raw : person); });
  assert.equal((await api.person(525, controller.signal)).id, 525);
  assert.equal((await api.personCredits(525, controller.signal)).all.length, 2);
  assert.deepEqual(calls.map(c => c.url), ["http://127.0.0.1:3000/people/525", "http://127.0.0.1:3000/people/525/credits"]);
  for (const call of calls) { assert.equal((call.init?.headers as Record<string,string>).Authorization, undefined); assert.equal(call.init?.signal, controller.signal); }
  const failed = new FlixieApi("http://127.0.0.1:3000", () => null, async () => response({}, 503));
  await assert.rejects(failed.personCredits(525), ApiError);
});
test("reviewed public person snapshots produce individual canonical metadata and Person schema", () => {
  assert(catalogPeople.length >= 3);
  for (const id of [525, 1892, 1813]) assert(catalogPeople.some(row => row.person.id === id));
  for (const snapshot of catalogPeople) {
    const page = pageFromPath(personPath(snapshot.person.id));
    assert(page.startsWith("person-")); assert(personPages[page as keyof typeof personPages]);
    const head = renderHead(page);
    assert(head.includes(`https://www.flixie.co.uk/people/${snapshot.person.id}`));
    assert.match(head, /"@type":"Person"/); assert(!head.includes('content="noindex"'));
    assert(!JSON.stringify(snapshot).includes("dev_web_"));
  }
  assert.equal(pageFromPath("/people/999999"), "personShare");
  assert.match(renderHead("personShare"), /content="noindex"/);
});
