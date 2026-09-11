import { isIndexable, pages, site, type PageId } from './site';

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]!));
export function renderHead(page: PageId) {
  const metadata = pages[page];
  const url = site.origin + metadata.path;
  const image = site.origin + '/og/flixie-social.png';
  const graph: Record<string, unknown>[] = [
    { '@type': 'Organization', '@id': site.origin + '/#organization', name: site.name, url: site.origin + '/', logo: site.origin + '/flixie-icon.png' },
    { '@type': 'WebSite', '@id': site.origin + '/#website', name: site.name, url: site.origin + '/', inLanguage: 'en-GB', publisher: { '@id': site.origin + '/#organization' } },
    { '@type': 'SoftwareApplication', '@id': site.origin + '/#app', name: site.name, url: site.origin + '/', applicationCategory: 'EntertainmentApplication', operatingSystem: 'iOS, Android', description: 'Discover films through friends, save a watchlist, rate movies and make watch plans.', installUrl: [site.iosUrl, site.androidUrl] },
    { '@type': 'WebPage', '@id': url + '#webpage', url, name: metadata.title, description: metadata.description, isPartOf: { '@id': site.origin + '/#website' }, about: { '@id': site.origin + '/#app' } },
  ];
  if (page !== 'home') graph.push({ '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: site.origin + '/' },
    { '@type': 'ListItem', position: 2, name: metadata.label, item: url },
  ] });
  const tags = [
    `<title>${escapeHtml(metadata.title)}</title>`,
    `<meta name="description" content="${escapeHtml(metadata.description)}">`,
    `<meta name="robots" content="${isIndexable(page) ? 'index, follow' : 'noindex'}">`,
  ];
  // Private invitations and error responses have no public canonical/entity graph.
  if (isIndexable(page)) tags.push(`<link rel="canonical" href="${url}">`);
  for (const [property, value] of Object.entries({ 'og:type': 'website', 'og:site_name': site.name, 'og:locale': 'en_GB', 'og:title': metadata.title, 'og:description': metadata.description, 'og:url': url, 'og:image': image, 'og:image:width': '1200', 'og:image:height': '630', 'og:image:alt': 'Flixie — find your next film with friends' })) tags.push(`<meta property="${property}" content="${escapeHtml(value)}">`);
  for (const [name, value] of Object.entries({ 'twitter:card': 'summary_large_image', 'twitter:title': metadata.title, 'twitter:description': metadata.description, 'twitter:image': image, 'twitter:image:alt': 'Flixie — find your next film with friends' })) tags.push(`<meta name="${name}" content="${escapeHtml(value)}">`);
  if (isIndexable(page)) tags.push(`<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`);
  return tags.join('\n    ');
}
