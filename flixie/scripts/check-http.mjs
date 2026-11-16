import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
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

  // Store-review resources must work for an anonymous visitor, independently
  // of the personalised app entrance or its authentication redirects.
  for (const [path, heading] of [['/privacy','Privacy Policy'],['/contact','Contact &amp; Support'],['/terms','Flixie Terms of Use']]) {
    const response = await fetch(base + path, {redirect:'manual'});
    assert.equal(response.status,200,`${path} must remain public`);
    assert.equal(response.headers.get('location'),null);
    const html = await response.text();
    assert.ok(html.includes(heading),`${path} must contain its actual document`);
    assert.doesNotMatch(html, /<input[^>]+type="password"/, `${path} must not be an authentication gate`);
  }
  const privacyHtml = await (await fetch(base + '/privacy')).text();
  const contactHtml = await (await fetch(base + '/contact')).text();
  for (const html of [privacyHtml,contactHtml]) assert.match(html,/id="account-deletion"/,'deletion link needs a real destination');
  assert.match(contactHtml,/mailto:flixieadmin@gmail\.com\?subject=Flixie%20account%20deletion%20request/,'request pathway must be available without the app');
  assert.match(contactHtml,/href="\/privacy#account-deletion"/);
  const termsHtml = await (await fetch(base + '/terms')).text();
  assert.match(termsHtml.replace(/<!--[^]*?-->/g,''),/Effective 16 September 2026/);
  for (const heading of ['Using Flixie','Zero tolerance for objectionable content and abuse','Your content','Reporting and blocking','Moderation and enforcement','Privacy and your rights']) assert.ok(termsHtml.includes(heading));
  const legacyTerms = await fetch(base + '/web/terms.html',{redirect:'manual'});
  assert.equal(legacyTerms.status,301);assert.equal(legacyTerms.headers.get('location'),'/terms');

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
    assert.equal(shared.headers.get('x-robots-tag'), path==='/movies/348'?null:'noindex');
    const body = await shared.text();
    assert.match(body, /Get Flixie|Download Flixie/);
    if(path==='/movies/348'){assert.match(body, /<h1>Alien<\/h1>/);assert.match(body, /https:\/\/www\.flixie\.co\.uk\/movies\/348/);assert.match(body, /\"@type\":\"Movie\"/);}
    assert.doesNotMatch(body, /dev_web_|PRIVATE WEB FIXTURE|LOCAL WEB CHECK|Bearer /);
    assert.match(body, /apple-itunes-app/);
    assert.doesNotMatch(body, /Opening the App Store|Stay on this page/);
    assert.match(body, /apps.apple.com/);
    assert.match(body, /play.google.com/);
  }
  const config=JSON.parse(await readFile('dist/staticwebapp.config.json','utf8'));
  const oldAlias=await fetch(base+'/movies/348.html?source=legacy',{redirect:'manual'});
  assert.equal(oldAlias.status,301);
  assert.equal(oldAlias.headers.get('location'),'/movies/348?source=legacy');
  const newTitle=Object.values(pages).find(page=>page.path.startsWith('/movies/')&&!config.routes.some(rule=>rule.route===page.path+'.html'));
  assert.ok(newTitle,'The expanded catalogue should avoid one alias rule per new film');
  const fileAlias=await fetch(base+newTitle.path+'.html');
  assert.equal(fileAlias.status,200);
  assert.equal(fileAlias.headers.get('x-robots-tag'),'noindex');
  assert.equal(config.routes.find(rule=>rule.route==='/assets/*')?.headers?.['Cache-Control'],'public, max-age=31536000, immutable');
  const assetName=(await readdir('dist/assets')).find(name=>name.endsWith('.js'));
  const cachedAsset=await fetch(base+'/assets/'+assetName);
  assert.equal(cachedAsset.status,200);
  assert.equal(cachedAsset.headers.get('cache-control'),'public, max-age=31536000, immutable');
  for (const [path, indexed] of [['/people/525', true], ['/people/999999', false]]) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('x-robots-tag'), indexed ? null : 'noindex');
    const html = await response.text();
    if (indexed) { assert.match(html, /<h1>Christopher Nolan<\/h1>/); assert.match(html, /"@type":"Person"/); assert.match(html, /Filmography/); }
    assert.doesNotMatch(html, /dev_web_|Bearer |PRIVATE WEB FIXTURE/);
  }
  for (const path of ['/app/profile', '/app/profiles/7ea11114-2026-4000-a000-000000000002']) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('x-robots-tag'), 'noindex');
    const html = await response.text();
    assert.match(html, /content="noindex"/);
    assert.doesNotMatch(html, /dev_web_|Fictional local profile|PRIVATE LOCAL|Bearer /);
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
