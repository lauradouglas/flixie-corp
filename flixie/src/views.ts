import { createElement } from 'react';
import { isFeaturePage } from './featureContent';
import type { PageId } from './site';
const views = {
  catalog: () => import('./components/CatalogView'),
  webApp: () => import('./web/WebApp'),
  download: () => import('./components/DownloadView'),
  home: async () => {const {default:WebApp}=await import('./web/WebApp');return {default:()=>createElement(WebApp,{publicHome:true})};},
  welcome: () => import('./components/HomeView'),
  features: () => import('./components/FeaturesView'),
  faq: () => import('./components/FaqView'),
  privacy: () => import('./components/PrivacyView'),
  terms: () => import('./components/TermsView'),
  contact: () => import('./components/ContactView'),
  mediaShare: () => import('./components/MediaShareView'),
  personShare: () => import('./components/MediaShareView'),
  invite: () => import('./components/InviteView'),
  about: () => import('./components/AboutView'),
  notFound: () => import('./components/NotFoundView'),
};
export async function loadView(page: PageId) {
  if (isFeaturePage(page)) { const { default: FeatureLandingView } = await import('./components/FeatureLandingView'); return () => createElement(FeatureLandingView, { page }); }
  if(page.startsWith('title-') || page.startsWith('person-'))return (await import('./components/MediaShareView')).default;
  return (await views[page as keyof typeof views]()).default;
}
