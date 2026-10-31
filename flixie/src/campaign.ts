export type Campaign = { utm_source: string; utm_medium: string; utm_campaign: string; utm_content: string };
const sources = new Set(['instagram', 'facebook', 'tiktok', 'google', 'youtube', 'newsletter']);
const mediums = new Set(['paid_social', 'social', 'organic_social', 'cpc', 'email', 'referral']);
const campaigns = new Set(['launch', 'instagram_launch', 'diary', 'diary_first_boost', 'watchlist', 'friends']);
const creatives = new Set(['bio', 'story', 'reel', 'feed', 'diary_video', 'watchlist_video', 'friends_video', 'ad_1', 'ad_2', 'ad_3']);
const label = (value: string | null, allowed: Set<string>) => allowed.has(value?.trim().toLowerCase() ?? '') ? value!.trim().toLowerCase() : 'unknown';
export function campaignFromSearch(search: string): Campaign | null {
  const params = new URLSearchParams(search);
  const source = label(params.get('utm_source'), sources);
  if (source === 'unknown') return null;
  return { utm_source: source, utm_medium: label(params.get('utm_medium'), mediums), utm_campaign: label(params.get('utm_campaign'), campaigns), utm_content: label(params.get('utm_content'), creatives) };
}
export function hasCampaignTags(search: string): boolean {
  return [...new URLSearchParams(search).keys()].some(key => key.startsWith('utm_'));
}
