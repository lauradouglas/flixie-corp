import assert from 'node:assert/strict';
import { readFile, access, readdir } from 'node:fs/promises';
import { pages, site, isIndexable } from '../.ssr/entry-server.js';

const config = JSON.parse(await readFile('dist/staticwebapp.config.json', 'utf8'));
assert.equal(config.navigationFallback, undefined, 'Unknown paths must not become the homepage');
assert.equal(config.responseOverrides['404'].rewrite, '/404.html');
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const listed = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
assert.deepEqual(listed, Object.keys(pages).filter(isIndexable).map(key => site.origin + pages[key].path));
assert.match(await readFile('dist/robots.txt', 'utf8'), /Sitemap: https:\/\/www\.flixie\.co\.uk\/sitemap\.xml/);
const documents = new Map();
for (const [key, page] of Object.entries(pages)) {
  const file = key === 'home' ? 'index.html' : `${page.path.slice(1)}.html`;
  const html = await readFile(`dist/${file}`, 'utf8');
  documents.set(page.path, html);
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1, `${key}: one visible page heading`);
  assert.equal([...html.matchAll(/<title>/g)].length, 1, `${key}: one title`);
  assert.equal([...html.matchAll(/<meta name="description"/g)].length, 1);
  assert.match(html, /data-prerendered="true"/);
  assert.doesNotMatch(html, /style="[^"]*opacity:0(?:;|")/, `${key}: content must be visible before JS`);
  assert.doesNotMatch(html, /href="#"/, `${key}: no fake links`);
  assert.doesNotMatch(html, /<!--page-head-->/);
  if (isIndexable(key)) {
    assert.equal([...html.matchAll(/rel="canonical"/g)].length, 1);
    assert.ok(html.includes(`rel="canonical" href="${site.origin}${page.path}"`));
    const schema = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
    assert.equal(schema.length, 1);
    const graph = JSON.parse(schema[0][1]);
    assert.ok(graph['@graph'].some(entity => entity['@type'] === 'SoftwareApplication'));
    const organization = graph['@graph'].find(entity => entity['@type'] === 'Organization');
    assert.ok(organization, `${key}: brand organization is present`);
    const logo = new URL(organization.logo);
    assert.equal(logo.origin, site.origin);
    await access(`dist${logo.pathname}`);
    const entityIds = new Set(graph['@graph'].map(entity => entity['@id']).filter(Boolean));
    const checkReferences = value => {
      if (!value || typeof value !== 'object') return;
      if (Object.keys(value).length === 1 && value['@id']) {
        assert.ok(entityIds.has(value['@id']), `${key}: unresolved schema reference ${value['@id']}`);
      }
      Object.values(value).forEach(checkReferences);
    };
    checkReferences(graph);
    assert.doesNotMatch(schema[0][1], /aggregateRating|ACTUAL_|PLACEHOLDER/);
  } else {
    assert.match(html, /name="robots" content="noindex"/);
    assert.doesNotMatch(html, /rel="canonical"/);
    assert.ok(config.routes.some(route => route.route === page.path && route.headers?.['X-Robots-Tag'] === 'noindex'));
  }
  if (key !== 'home') {
    const rule = config.routes.find(route => route.route === page.path);
    assert.equal(rule.rewrite, `/${file}`);
    assert.equal(config.routes.find(route => route.route === page.path + '/').statusCode, 301);
  }
  for (const match of html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)) await access(`dist${match[1]}`);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, `${key}: duplicate element IDs`);
}
for (const [path, html] of documents) {
  for (const [, href] of html.matchAll(/<a\b[^>]*href="([^"?]+)"/g)) {
    if (!href.startsWith('/') && !href.startsWith('#')) continue;
    const [targetPath, fragment] = href.split('#');
    const target = documents.get(targetPath || path);
    assert.ok(target, `${path}: broken internal link ${href}`);
    if (fragment) assert.ok(target.includes(`id="${fragment}"`), `${path}: missing anchor ${href}`);
  }
}
assert.match(documents.get('/faqs'), /<details[\s>]/);
assert.match(documents.get('/faqs'), /How do I rate a movie\?/);
assert.match(documents.get('/faqs'), /select your rating out of 10/);
assert.match(documents.get('/'), /Illustrative app demo/);
assert.match(documents.get('/404'), /This page could not be found/);
assert.doesNotMatch(documents.get('/invite'), /Invited by @/);
const og = await readFile('dist/og/flixie-social.png');
assert.equal(og.readUInt32BE(16), 1200);
assert.equal(og.readUInt32BE(20), 630);
const assets = await readdir('dist/assets');
assert.ok(assets.some(name => name.startsWith('FaqView-')) && assets.some(name => name.startsWith('PrivacyView-')), 'Pages should be code-split');
console.log(`SEO checks passed: ${documents.size} rendered pages, ${listed.length} sitemap URLs, metadata/schema, links, assets, FAQ content, noindex, 404 and route configuration.`);
