import { sharedMediaStore } from './mediaShare';
import { site } from './site';

export function downloadDestination(userAgent: string, platform: string, maxTouchPoints: number): string | null {
  const device = sharedMediaStore(userAgent, platform, maxTouchPoints);
  return device === 'ios' ? site.iosUrl : device === 'android' ? site.androidUrl : null;
}
