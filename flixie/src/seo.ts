import { featureContent, isFeaturePage } from './featureContent';
import { isIndexable, pages, site, type PageId } from './site';

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]!));
export function renderHead(page: PageId) {
  const metadata = pages[page];
  const url = site.origin + metadata.path;
  const image = site.origin + '/og/flixie-social.png';
  const graph: Record<string, unknown>[] = [
    { '@type': 'Organization', '@id': site.origin + '/#organization', name: site.name, url: site.origin + '/', logo: site.origin + '/flixie-icon.png', sameAs: ['https://www.instagram.com/flixie_co/'] },
    { '@type': 'WebSite', '@id': site.origin + '/#website', name: site.name, url: site.origin + '/', inLanguage: 'en-GB', publisher: { '@id': site.origin + '/#organization' } },
    { '@type': 'SoftwareApplication', '@id': site.origin + '/#app', name: site.name, url: site.origin + '/', applicationCategory: 'EntertainmentApplication', operatingSystem: 'iOS, Android', description: 'Keep a film diary, track TV episodes and seasons, save watchlists, rate films, discover recommendations and plan movie nights.', installUrl: [site.iosUrl, site.androidUrl], featureList: ['Film diary and rewatches', 'TV episode and season tracking', 'Movie and TV watchlists', 'Personal ratings out of 10', 'Friends’ ratings and recommendation signals', 'Film and TV genre communities', 'Movie-night Watch Plans', 'Watch-provider information'] },
    { '@type': 'WebPage', '@id': url + '#webpage', url, name: metadata.title, description: metadata.description, isPartOf: { '@id': site.origin + '/#website' }, about: { '@id': site.origin + '/#app' } },
  ];
  if (page !== 'home') graph.push({ '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: site.origin + '/' },
    ...(isFeaturePage(page) ? [{ '@type': 'ListItem', position: 2, name: 'Features', item: site.origin + '/features' }, { '@type': 'ListItem', position: 3, name: metadata.label, item: url }] : [{ '@type': 'ListItem', position: 2, name: metadata.label, item: url }]),
  ] });
  if (isFeaturePage(page)) graph.push({ '@type': 'FAQPage', '@id': url + '#questions', mainEntity: featureContent[page].faqs.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })) });
  const tags = [
    `<title>${escapeHtml(metadata.title)}</title>`,
    `<meta name="description" content="${escapeHtml(metadata.description)}">`,
    `<meta name="robots" content="${isIndexable(page) ? 'index, follow' : 'noindex'}">`,
  ];
  if (page === 'mediaShare') tags.push('<meta name="apple-itunes-app" content="app-id=6779375028">');
  // Private invitations and error responses have no public canonical/entity graph.
  if (isIndexable(page)) tags.push(`<link rel="canonical" href="${url}">`);
  for (const [property, value] of Object.entries({ 'og:type': 'website', 'og:site_name': site.name, 'og:locale': 'en_GB', 'og:title': metadata.title, 'og:description': metadata.description, 'og:url': url, 'og:image': image, 'og:image:width': '1200', 'og:image:height': '630', 'og:image:alt': 'Flixie - film diary, TV tracking and your next watch' })) tags.push(`<meta property="${property}" content="${escapeHtml(value)}">`);
  for (const [name, value] of Object.entries({ 'twitter:card': 'summary_large_image', 'twitter:title': metadata.title, 'twitter:description': metadata.description, 'twitter:image': image, 'twitter:image:alt': 'Flixie - film diary, TV tracking and your next watch' })) tags.push(`<meta name="${name}" content="${escapeHtml(value)}">`);
  if (isIndexable(page)) tags.push(`<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`);
  return tags.join('\n    ');
}
