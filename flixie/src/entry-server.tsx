import { renderToString } from 'react-dom/server';
import App from './App';
import { loadView } from './views';
export { pages, isIndexable, site } from './site';
export { renderHead } from './seo';
import type { PageId } from './site';
export async function render(page: PageId, year: number) {
  const View = await loadView(page);
  return renderToString(<App page={page} year={year} View={View} />);
}
