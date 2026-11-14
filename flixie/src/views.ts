import { createElement } from 'react';
import { isFeaturePage } from './featureContent';
import type { PageId } from './site';
const views = {
  catalog: () => import('./components/CatalogView'),
  webApp: () => import('./web/WebApp'),
  download: () => import('./components/DownloadView'),
  home: () => import('./components/HomeView'),
  features: () => import('./components/FeaturesView'),
  faq: () => import('./components/FaqView'),
  privacy: () => import('./components/PrivacyView'),
  contact: () => import('./components/ContactView'),
  mediaShare: () => import('./components/MediaShareView'),
  invite: () => import('./components/InviteView'),
  about: () => import('./components/AboutView'),
  notFound: () => import('./components/NotFoundView'),
};
export async function loadView(page: PageId) {
  if (isFeaturePage(page)) { const { default: FeatureLandingView } = await import('./components/FeatureLandingView'); return () => createElement(FeatureLandingView, { page }); }
  if(page.startsWith('title-'))return (await import('./components/MediaShareView')).default;
  return (await views[page as keyof typeof views]()).default;
}
