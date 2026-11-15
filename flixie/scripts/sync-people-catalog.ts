// Public person metadata only; no account, history, favourite or review requests.
import { writeFile } from "node:fs/promises";
import { talent, talentCredits, validPersonId } from "../src/web/personDetails";
const base = (process.env.FLIXIE_CATALOG_API_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const origin = new URL(base);
if (origin.username || origin.password || (origin.protocol !== "https:" && !["127.0.0.1", "localhost"].includes(origin.hostname))) throw new Error("Use HTTPS or the local backend without URL credentials.");
const extra = process.argv.slice(2).map(Number);
if (!extra.every(validPersonId)) throw new Error("Provide positive person IDs.");
const selected = [...new Set([525, 1892, 1813, ...extra])];
async function read(path: string) {
  const response = await fetch(base + path, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  return response.json() as Promise<unknown>;
}
const people = [];
for (const id of selected) {
  const [raw, credits] = await Promise.all([read(`/people/${id}`), read(`/people/${id}/credits`)]);
  // Explicit parsers project only the public person and credit fields used by this site.
  people.push({ person: talent(raw, id), credits: talentCredits(credits) });
}
await writeFile("src/catalog/people.json", JSON.stringify({ updatedAt: new Date().toISOString().slice(0,10), people }, null, 2) + "\n");
console.log(`Saved ${people.length} public people. Review and rebuild before publishing.`);
