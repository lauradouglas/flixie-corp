import type { PageId } from './site';
const views = {
  home: () => import('./components/HomeView'),
  features: () => import('./components/FeaturesView'),
  faq: () => import('./components/FaqView'),
  privacy: () => import('./components/PrivacyView'),
  contact: () => import('./components/ContactView'),
  invite: () => import('./components/InviteView'),
  about: () => import('./components/AboutView'),
  notFound: () => import('./components/NotFoundView'),
};
export async function loadView(page: PageId) { return (await views[page]()).default; }
