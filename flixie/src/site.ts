export const site = {
  origin: 'https://www.flixie.co.uk',
  name: 'Flixie',
  supportEmail: 'flixieadmin@gmail.com',
  iosUrl: 'https://apps.apple.com/app/id6779375028',
  androidUrl: 'https://play.google.com/store/apps/details?id=com.flixie.app',
  iosLabel: 'Download on the App Store',
  androidLabel: 'Download on Play Store',
  availability: 'Download Flixie for iOS on the App Store or for Android on Google Play.',
};

export const pages = {
  home: { path: '/', title: 'Flixie: Movie Tracker & Social Movie App for Friends', description: 'Track movies, build your watchlist and discover what to watch with friends and genre communities. Share reviews and plan your next movie night.', label: 'Home' },
  features: { path: '/features', title: 'Flixie Features: Communities, Watchlists & Movie Plans', description: 'Explore Flixie’s movie discovery features, from genre communities and friends’ recommendations to watchlists, ratings and watch plans.', label: 'Features' },
  faq: { path: '/faqs', title: 'Flixie FAQs: Movie Discovery, Accounts & Support', description: 'Find answers about Flixie watchlists, movie ratings, communities, friends, account settings, privacy and deleting your account.', label: 'FAQs' },
  about: { path: '/about', title: 'About Flixie: Discover Films with Friends', description: 'Meet Flixie, a social movie discovery app that brings friends, genre communities, watchlists and watch plans together.', label: 'About Flixie' },
  privacy: { path: '/privacy', title: 'Privacy Policy | Flixie', description: 'Read how Flixie handles account information, optional analytics, social sharing and your choices about privacy and account deletion.', label: 'Privacy Policy' },
  contact: { path: '/contact', title: 'Contact Flixie: App Support & Account Help', description: 'Contact Flixie for app support, feedback, bug reports or help deleting your account and associated data.', label: 'Contact & Support' },
  invite: { path: '/invite', title: 'You’ve Been Invited to Flixie', description: 'Open your Flixie invitation to discover films with friends.', label: 'Invitation', noindex: true },
  mediaShare: { path: '/media-share', title: 'Open a Shared Title in Flixie', description: 'Open the shared movie or show in Flixie, or download the app for iPhone or Android.', label: 'Shared title', noindex: true },
  notFound: { path: '/404', title: 'Page Not Found | Flixie', description: 'This page could not be found. Discover Flixie or contact support for help.', label: 'Page not found', noindex: true },
} as const;

export type PageId = keyof typeof pages;
export const isIndexable = (page: PageId) => !('noindex' in pages[page]);
export function pageFromPath(pathname: string): PageId {
  const normalized = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
  if (/^\/(movies|shows)\/[1-9][0-9]*$/.test(normalized)) return 'mediaShare';
  return (Object.keys(pages) as PageId[]).find(key => pages[key].path === normalized) ?? 'notFound';
}
