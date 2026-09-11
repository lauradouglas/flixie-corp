import { readFile, writeFile } from 'node:fs/promises';
import { render, renderHead, pages, isIndexable, site } from '../.ssr/entry-server.js';

const template = await readFile('dist/index.html', 'utf8');
const year = new Date().getFullYear();
const config = JSON.parse(await readFile('public/staticwebapp.config.json', 'utf8'));
const routes = [...(config.routes || []), { route: '/index.html', redirect: '/', statusCode: 301 }];
for (const [key, page] of Object.entries(pages)) {
  const file = key === 'home' ? 'index.html' : `${page.path.slice(1)}.html`;
  const html = template.replace('<!--page-head-->', renderHead(key)).replace('<div id="root"></div>', `<div id="root" data-prerendered="true" data-year="${year}">${await render(key, year)}</div>`);
  if (html.includes('<!--page-head-->') || !html.includes('data-prerendered')) throw new Error(`Rendering failed for ${key}`);
  await writeFile(`dist/${file}`, html);
  if (key === 'home') continue;
  routes.push({ route: `${page.path}/`, redirect: page.path, statusCode: 301 });
  if (key !== 'notFound') routes.push({ route: `/${file}`, redirect: page.path, statusCode: 301 });
  routes.push({ route: page.path, rewrite: `/${file}`, ...(isIndexable(key) ? {} : { headers: { 'X-Robots-Tag': 'noindex' } }), ...(key === 'notFound' ? { statusCode: 404 } : {}) });
}
await writeFile('dist/staticwebapp.config.json', JSON.stringify({ ...config, routes }, null, 2) + '\n');
const urls = Object.keys(pages).filter(isIndexable).map(key => `  <url><loc>${site.origin}${pages[key].path}</loc></url>`);
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${site.origin}/sitemap.xml\n`);
console.log(`Prerendered ${Object.keys(pages).length} pages; generated canonical routes, sitemap and robots.txt.`);
