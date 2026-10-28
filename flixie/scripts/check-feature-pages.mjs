import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pages, renderHead } from '../.ssr/entry-server.js';
const features = ['diary', 'tvTracker', 'watchlist', 'planner', 'recommendations', 'reviews', 'whereToWatch', 'friends', 'communities'];
const titles = new Set(), descriptions = new Set();
const decode = text => text.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
for (const key of features) {
  const page = pages[key];
  const html = await readFile(`dist${page.path}.html`, 'utf8');
  const head = renderHead(key);
  titles.add(page.title); descriptions.add(page.description);
  const graph = JSON.parse(head.match(/application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
  const breadcrumbs = graph.find(entity => entity['@type'] === 'BreadcrumbList');
  assert.equal(breadcrumbs.itemListElement.length, 3, `${key}: features breadcrumb`);
  const faq = graph.find(entity => entity['@type'] === 'FAQPage');
  assert.ok(faq.mainEntity.length >= 2);
  for (const question of faq.mainEntity) {
    assert.ok(decode(html).includes(question.name), `${key}: schema question must be visible`);
    assert.ok(decode(html).includes(question.acceptedAnswer.text), `${key}: schema answer must be visible`);
  }
  assert.match(html, /aria-label="Breadcrumb"/);
  assert.match(html, /href="\/features" aria-current="page"[^>]*>Features/);
  assert.match(html, /class="feature-app-shot/, `${key}: feature has an app screenshot`);
  assert.match(html, /Open full-size/, `${key}: original screenshot is accessible`);
  const visualBlock = html.match(/<figure class="feature-app-shot[\s\S]*?<\/figure>/)?.[0];
  assert.ok(visualBlock, `${key}: hero visual exists`);
  assert.match(visualBlock, /alt="[^"]{30,}"/, `${key}: descriptive screenshot alt text`);
  assert.match(html, /apps\.apple\.com/);
  assert.match(html, /play\.google\.com/);
}
assert.equal(titles.size, features.length, 'Distinct page titles');
assert.equal(descriptions.size, features.length, 'Distinct page descriptions');
const home = await readFile('dist/index.html', 'utf8');
assert.match(home, /href="\/film-diary"/);
assert.match(home, /href="\/tv-show-tracker"/);
assert.doesNotMatch(home, /real sync times|segmented, targeted notifications/);
const tv = await readFile('dist/tv-show-tracker.html', 'utf8');
assert.match(tv, /watched TV episodes and season progress/);
const hub = await readFile('dist/features.html', 'utf8');
assert.doesNotMatch(hub, /out of five stars|dynamic folders|Calendar or Google Calendar/);
assert.match(await readFile('dist/faqs.html', 'utf8'), /explore Flixie before signing up/);
await readFile('dist/images/film-diary-example.png');
await readFile('dist/images/odyssey-friends.png');
await readFile('dist/images/odyssey-friends-detail.png');
await readFile('dist/images/pip-hoodie.png');
assert.match(home, /Get Flixie for iPhone/);
assert.match(home, /Get it for Android/);
const social = await readFile('dist/social-movie-app.html','utf8');
assert.match(social,/The Odyssey/);
assert.match(social,/Fictional users and scores/);
assert.match(home,/href="\/social-movie-app"/);
assert.match(home,/href="\/film-tv-communities"/);
assert.match(home,/Friends’ opinions/);
const communities = await readFile('dist/film-tv-communities.html','utf8');
assert.match(communities,/does not enable public review sharing/);

console.log('Feature-page checks passed: nine distinct prerendered pages, visible/schema FAQ parity, breadcrumbs, download links, film/TV tracking and accurate copy.');
