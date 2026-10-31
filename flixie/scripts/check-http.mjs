import assert from 'node:assert/strict';
import { pages, isIndexable } from '../.ssr/entry-server.js';
import { createPreviewServer } from './preview.mjs';
const server = await createPreviewServer();
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
try {
  const download = await fetch(base + '/download?utm_source=instagram');
  assert.equal(download.status, 200);
  assert.equal(download.headers.get('x-robots-tag'), 'noindex');
  const downloadHtml = await download.text();
  assert.match(downloadHtml, /Get Flixie/);
  assert.match(downloadHtml, /https:\/\/apps.apple.com\/app\/id6779375028/);
  assert.match(downloadHtml, /https:\/\/play.google.com\/store\/apps\/details/);

  for (const query of ['', '?utm_source=instagram']) {
    const response = await fetch(base + '/android' + query, { redirect: 'manual' });
    assert.equal(response.status, 302, 'Android download uses a temporary redirect');
    const destination = new URL(response.headers.get('location'));
    assert.equal(destination.origin, 'https://play.google.com');
    assert.equal(destination.pathname, '/store/apps/details');
    assert.equal(destination.searchParams.get('id'), 'com.flixie.app');
    if (query) assert.equal(destination.searchParams.get('utm_source'), 'instagram');
  }

  for (const query of ['', '?utm_source=instagram']) {
    const response = await fetch(base + '/iphone' + query, { redirect: 'manual' });
    assert.equal(response.status, 302, 'iPhone download uses a temporary redirect');
    const destination = new URL(response.headers.get('location'));
    assert.equal(destination.origin, 'https://apps.apple.com');
    assert.equal(destination.pathname, '/gb/app/flixie/id6779375028');
    if (query) assert.equal(destination.searchParams.get('utm_source'), 'instagram');
  }

  for (const path of Object.keys(pages).filter(isIndexable).map(key => pages[key].path)) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200, path);
    assert.match(await response.text(), /<h1\b/);
  }
  for (const path of Object.keys(pages).filter(key => key !== 'home' && isIndexable(key)).map(key => pages[key].path)) {
    const response = await fetch(base + path + '/', { redirect: 'manual' });
    assert.equal(response.status, 301);
    assert.equal(response.headers.get('location'), path);
  }
  for (const path of ['/not-a-real-page', '/missing.js', '/404']) {
    const response = await fetch(base + path);
    assert.equal(response.status, 404, path);
    assert.match(await response.text(), /This page could not be found/);
  }
  for (const [path, type, text] of [['/robots.txt', 'text/plain', 'User-agent: *'], ['/sitemap.xml', 'application/xml', '<urlset']]) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200);
    assert.ok(response.headers.get('content-type').startsWith(type));
    assert.ok((await response.text()).includes(text));
  }
  const apple = await fetch(base + '/.well-known/apple-app-site-association', { redirect: 'manual' });
  assert.equal(apple.status, 200);
  assert.equal(apple.headers.get('location'), null);
  assert.ok(apple.headers.get('content-type').startsWith('application/json'));
  const appleData = await apple.json();
  assert.deepEqual(appleData.applinks.details, [{
    appIDs: ['4T69VPQXW6.com.flixie.flixieApp'],
    components: [{ '/': '/invite', comment: 'Open Flixie invitations in the installed app.' },
      { '/': '/movies/*', comment: 'Open shared movies in Flixie.' },
      { '/': '/shows/*', comment: 'Open shared shows in Flixie.' }],
  }]);
  const association = await fetch(base + '/.well-known/assetlinks.json', { redirect: 'manual' });
  assert.equal(association.status, 200);
  assert.equal(association.headers.get('location'), null);
  assert.ok(association.headers.get('content-type').startsWith('application/json'));
  assert.deepEqual(await association.json(), [{
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: 'com.flixie.app',
      sha256_cert_fingerprints: ['71:D8:A2:A5:A0:ED:E1:E5:44:94:F0:EE:91:7C:DB:2A:23:ED:43:DF:4A:E8:3F:68:CF:EA:23:7A:B6:5A:97:D5'],
    },
  }]);
  for (const path of ['/movies/348', '/shows/1399']) {
    const shared = await fetch(base + path);
    assert.equal(shared.status, 200);
    assert.equal(shared.headers.get('x-robots-tag'), 'noindex');
    const body = await shared.text();
    assert.match(body, /Need the app/);
    assert.match(body, /apple-itunes-app/);
    assert.doesNotMatch(body, /Opening the App Store|Stay on this page/);
    assert.match(body, /apps.apple.com/);
    assert.match(body, /play.google.com/);
  }
  const invite = await fetch(base + '/invite?code=TEST_ONLY');
  assert.equal(invite.status, 200);
  assert.equal(invite.headers.get('x-robots-tag'), 'noindex');
  assert.doesNotMatch(await invite.text(), /TEST_ONLY/);
  for (const path of ['/invite/', '/invite.html']) {
    const response = await fetch(base + path + '?code=TEST_ONLY', { redirect: 'manual' });
    assert.equal(response.status, 301);
    assert.equal(response.headers.get('location'), '/invite?code=TEST_ONLY');
  }
  console.log('HTTP preview checks passed: public routes, Apple and Android association JSON without redirects, crawl-file MIME, real 404s, invitation noindex and query-preserving redirects. Verify again on Azure staging.');
} finally {
  await new Promise(resolve => server.close(resolve));
}
