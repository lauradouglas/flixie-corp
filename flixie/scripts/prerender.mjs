import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { render, renderHead, pages, isIndexable, site } from '../.ssr/entry-server.js';
import { assertHostingBudget } from './lib/hosting-budget.mjs';

const template = await readFile('dist/index.html', 'utf8');
const year = new Date().getFullYear();
const config = JSON.parse(await readFile('public/staticwebapp.config.json', 'utf8'));
// Keep the public extensionless Apple URL, serving JSON through its typed target.
await writeFile('dist/.well-known/apple-app-site-association.json', await readFile('public/.well-known/apple-app-site-association'));
const fallbackRoutes=(config.routes||[]).filter(rule=>['/movies/*','/shows/*','/people/*'].includes(rule.route));
const routes = [...(config.routes || []).filter(rule=>!fallbackRoutes.includes(rule)), { route: '/index.html', redirect: '/', statusCode: 301 }];
// Preserve the original published .html aliases. New numeric title pages need
// only their canonical rewrite: their file URLs already fall under noindex
// media fallbacks, so generating a second rule per new title wastes Azure's budget.
// This compatibility list is frozen; do not append every newly indexed movie.
const legacyTitleAliases=new Set(['/movies/348','/movies/1368337','/movies/634649',
  '/movies/157336','/movies/666277','/movies/1339713','/shows/15621','/shows/76331']);
for (const [key, page] of Object.entries(pages)) {
  const file = key === 'home' ? 'index.html' : `${page.path.slice(1)}.html`;
  const html = template.replace('<!--page-head-->', renderHead(key)).replace('<div id="root"></div>', `<div id="root" data-prerendered="true" data-year="${year}">${await render(key, year)}</div>`);
  if (html.includes('<!--page-head-->') || !html.includes('data-prerendered')) throw new Error(`Rendering failed for ${key}`);
  await mkdir(`dist/${file}`.slice(0,`dist/${file}`.lastIndexOf('/')),{recursive:true});
  await writeFile(`dist/${file}`, html);
  if (key === 'home') continue;
  // Azure treats trailing-slash variants as the same route; trailingSlash handles redirects.
  if (key !== 'notFound' && (!key.startsWith('title-') || legacyTitleAliases.has(page.path)))
    routes.push({ route: `/${file}`, redirect: page.path, statusCode: 301 });
  routes.push({ route: page.path, ...(key === 'notFound' ? { statusCode: 404 } : { rewrite: `/${file}` }), ...(isIndexable(key) ? {} : { headers: { 'X-Robots-Tag': 'noindex' } }) });
}
// Azure counts actual bytes. Whitespace need not grow with the catalogue.
// Exact canonical/legacy redirects still precede noindex shared-title fallbacks.
const routing=JSON.stringify({ ...config, routes:[...routes,...fallbackRoutes] })+'\n';
assertHostingBudget({routingBytes:Buffer.byteLength(routing)});
await writeFile('dist/staticwebapp.config.json',routing);
const urls = Object.keys(pages).filter(isIndexable).map(key => `  <url><loc>${site.origin}${pages[key].path}</loc></url>`);
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${site.origin}/sitemap.xml\n`);
console.log(`Prerendered ${Object.keys(pages).length} pages; generated canonical routes, sitemap and robots.txt.`);
