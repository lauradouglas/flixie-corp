import { featureContent } from './featureContent';
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
  home: { path: '/', title: 'Flixie: Social Movie App, Film Diary & TV Tracker', description: 'Find films through friends, share recommendations and plan movie nights. Keep your own film diary, TV episode progress and watchlist in Flixie.', label: 'Home' },
  features: { path: '/features', title: 'Flixie Features: Friends, Film Diary & TV Tracking', description: 'Explore Flixie’s film diary, episode and season tracking, watchlists, ratings, recommendations, watch-provider information and movie-night planning.', label: 'Features' },
  diary: { path: featureContent.diary.path, title: featureContent.diary.title, description: featureContent.diary.description, label: featureContent.diary.label },
  watchlist: { path: featureContent.watchlist.path, title: featureContent.watchlist.title, description: featureContent.watchlist.description, label: featureContent.watchlist.label },
  tvTracker: { path: featureContent.tvTracker.path, title: featureContent.tvTracker.title, description: featureContent.tvTracker.description, label: featureContent.tvTracker.label },
  planner: { path: featureContent.planner.path, title: featureContent.planner.title, description: featureContent.planner.description, label: featureContent.planner.label },
  recommendations: { path: featureContent.recommendations.path, title: featureContent.recommendations.title, description: featureContent.recommendations.description, label: featureContent.recommendations.label },
  reviews: { path: featureContent.reviews.path, title: featureContent.reviews.title, description: featureContent.reviews.description, label: featureContent.reviews.label },
  whereToWatch: { path: featureContent.whereToWatch.path, title: featureContent.whereToWatch.title, description: featureContent.whereToWatch.description, label: featureContent.whereToWatch.label },
  friends: { path: featureContent.friends.path, title: featureContent.friends.title, description: featureContent.friends.description, label: featureContent.friends.label },
  communities: { path: featureContent.communities.path, title: featureContent.communities.title, description: featureContent.communities.description, label: featureContent.communities.label },
  faq: { path: '/faqs', title: 'Flixie FAQs: Movie Discovery, Accounts & Support', description: 'Find answers about Flixie watchlists, movie ratings, communities, friends, account settings, privacy and deleting your account.', label: 'FAQs' },
  about: { path: '/about', title: 'About Flixie: Discover Films with Friends', description: 'Meet Flixie, a social movie discovery app that brings friends, genre communities, watchlists and watch plans together.', label: 'About Flixie' },
  privacy: { path: '/privacy', title: 'Privacy Policy | Flixie', description: 'Read how Flixie handles account information, optional analytics, social sharing and your choices about privacy and account deletion.', label: 'Privacy Policy' },
  contact: { path: '/contact', title: 'Contact Flixie: App Support & Account Help', description: 'Contact Flixie for app support, feedback, bug reports or help deleting your account and associated data.', label: 'Contact & Support' },
  download: { path: '/download', title: 'Download Flixie for iPhone or Android', description: 'Get Flixie from the App Store or Google Play.', label: 'Download Flixie', noindex: true },
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
