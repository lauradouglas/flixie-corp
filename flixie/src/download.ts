import { sharedMediaStore } from './mediaShare';
import { site } from './site';

export function downloadDestination(userAgent: string, platform: string, maxTouchPoints: number, _search = ''): string | null {
  // Campaign tags never change the store destination or block mobile routing.
  const device = sharedMediaStore(userAgent, platform, maxTouchPoints);
  return device === 'ios' ? site.iosUrl : device === 'android' ? site.androidUrl : null;
}
