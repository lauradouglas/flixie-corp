import { sharedMediaStore } from './mediaShare';
import { hasCampaignTags } from './campaign';
import { site } from './site';

export function downloadDestination(userAgent: string, platform: string, maxTouchPoints: number, search = ''): string | null {
  if (hasCampaignTags(search)) return null;
  const device = sharedMediaStore(userAgent, platform, maxTouchPoints);
  return device === 'ios' ? site.iosUrl : device === 'android' ? site.androidUrl : null;
}
