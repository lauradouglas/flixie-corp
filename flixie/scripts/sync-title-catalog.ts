// Refresh the finite public search catalogue. Never request accounts, reviews or history.
import { writeFile } from "node:fs/promises";
import { film } from "../src/web/models";
const base = process.env.FLIXIE_CATALOG_API_URL ?? "http://127.0.0.1:3000";
const origin = new URL(base);
if (
  origin.protocol !== "https:" &&
  !["127.0.0.1", "localhost"].includes(origin.hostname)
)
  throw new Error("Use HTTPS or the local backend.");
const selected = [
  ["movie", 348],
  ["movie", 1368337],
  ["movie", 634649],
  ["movie", 157336],
  ["movie", 666277],
  ["movie", 1339713],
  ["show", 15621],
  ["show", 76331],
] as const;
const titles = await Promise.all(
  selected.map(async ([kind, id]) => {
    const path =
      kind === "movie"
        ? `/movies/id/${id}?includeReviews=false&includeTmdbRating=true`
        : `/shows/id/${id}?summary=true`;
    const response = await fetch(base + path, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error(`${kind}/${id}: ${response.status}`);
    const title = film(await response.json(), kind);
    if (!title.title || !title.overview || !title.posterPath)
      throw new Error(`${kind}/${id}: incomplete public metadata`);
    // Explicit projection: no user IDs, reviews, diary entries or provider availability in static output.
    return {
      id: title.id,
      kind: title.kind,
      title: title.title,
      posterPath: title.posterPath,
      releaseDate: title.releaseDate,
      runtime: title.runtime,
      overview: title.overview,
      tagline: title.tagline,
      genres: title.genres,
    };
  }),
);
await writeFile(
  "src/catalog/titles.json",
  JSON.stringify(
    { updatedAt: new Date().toISOString().slice(0, 10), titles },
    null,
    2,
  ) + "\n",
);
console.log(
  `Saved ${titles.length} public titles. Review and build before publishing.`,
);
