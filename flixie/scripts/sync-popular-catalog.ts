// Weekly public-only additions. Never rotate out published films or opt-outs.
import { appendFile, readFile, rename, writeFile } from 'node:fs/promises';
import { createPublicMovieReader, parseCatalogSnapshot, refreshPopularCatalog } from './lib/weekly-catalog';
import priorityMovies from './catalog-priority-movies.json';
import excludedMovies from './catalog-excluded-movies.json';

const filename='src/catalog/titles.json';
const previous=parseCatalogSnapshot(JSON.parse(await readFile(filename,'utf8')));
const get=createPublicMovieReader(process.env.FLIXIE_CATALOG_API_URL??'http://127.0.0.1:3000');
const result=await refreshPopularCatalog(previous,await get('/movies/popular?region=GB'),{
  maximumMovies:200,priorityMovies,excludedIds:excludedMovies.map(t=>t.id),today:new Date().toISOString().slice(0,10),
  loadMovie:({id})=>get(`/movies/id/${id}?includeReviews=false&includeTmdbRating=false`),
});
// Only complete, valid additions replace the saved snapshot. Validation and
// Azure budget checks must still pass before a workflow commits or publishes it.
if(result.changed){
  await writeFile(filename+'.weekly.tmp',JSON.stringify(result.snapshot,null,2)+'\n');
  await rename(filename+'.weekly.tmp',filename);
}
console.log(JSON.stringify({...result.report,changed:result.changed},null,2));
if(process.env.FLIXIE_CATALOG_REPORT_PATH)
  await writeFile(process.env.FLIXIE_CATALOG_REPORT_PATH,JSON.stringify(result.report,null,2)+'\n');
if(process.env.GITHUB_STEP_SUMMARY){
  const r=result.report;
  await appendFile(process.env.GITHUB_STEP_SUMMARY,
    `## Weekly movie sitemap\n\nCountry source: GB. ${r.movies}/${r.maximumMovies} movie pages.\n\n`+
    `Added movie IDs: ${r.addedIds.join(', ')||'none'}.\n\n`+
    `Excluded feed IDs: ${r.excludedFeedIds.join(', ')||'none'}.\n\n`+
    `Waiting for capacity: ${r.capacitySkippedIds.join(', ')||'none'}.\n\n`+
    'Existing movie pages, user exclusions and TV records are retained. A full catalogue skips additions; it does not rotate pages or upgrade hosting.\n');
}
