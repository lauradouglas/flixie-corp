// Local preview of this project's exact static routes; Azure staging remains the authority.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

export async function createPreviewServer() {
  const root = resolve('dist');
  const config = JSON.parse(await readFile(resolve(root, 'staticwebapp.config.json'), 'utf8'));
  const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', ...config.mimeTypes };
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      const pathname = decodeURIComponent(url.pathname);
      const route = config.routes.find(rule => rule.route === pathname);
      if (route?.redirect) {
        response.writeHead(route.statusCode || 301, { Location: route.redirect + url.search });
        return response.end();
      }
      const resource = route?.rewrite || (pathname === '/' ? '/index.html' : pathname);
      const file = resolve(root, '.' + resource);
      if (!file.startsWith(root + sep)) throw new Error('Invalid path');
      const body = await readFile(file);
      response.writeHead(route?.statusCode || 200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', ...config.globalHeaders, ...route?.headers });
      response.end(request.method === 'HEAD' ? undefined : body);
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' });
      response.end(request.method === 'HEAD' ? undefined : await readFile(resolve(root, '404.html')));
    }
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const port = Number(process.env.PORT || 4173);
  const server = await createPreviewServer();
  server.listen(port, '127.0.0.1', () => console.log(`Static site preview: http://127.0.0.1:${port}`));
}
