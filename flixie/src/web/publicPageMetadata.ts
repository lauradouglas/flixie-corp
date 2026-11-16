import { useEffect } from 'react';

/** Update only public display metadata; route indexing/canonicals stay with the shell. */
export function usePublicPageMetadata(path: string, title?: string, description?: string) {
  useEffect(() => {
    if (!title || window.location.pathname.replace(/\/$/, '') !== path) return;
    document.title = title;
    for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]'])
      document.querySelector(selector)?.setAttribute('content', title);
    if (description) for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]'])
      document.querySelector(selector)?.setAttribute('content', description);
  }, [path, title, description]);
}
