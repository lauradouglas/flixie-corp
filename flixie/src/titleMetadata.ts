/** Shared by prerendering and client navigation so hydration preserves search metadata. */
export function titleMetadata(title: { title: string; releaseDate: string }) {
  const year = /^\d{4}(?:-|$)/.test(title.releaseDate) ? title.releaseDate.slice(0, 4) : '';
  const name = `${title.title}${year ? ` (${year})` : ''}`;
  return {
    title: `${name}: Watchlist & Where to Watch | Flixie`,
    description: `Find where to watch ${name}, explore its cast and read public reviews. Save it to your Flixie watchlist.`,
  };
}
