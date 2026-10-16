import { site } from './site';

// The app checks ownership, expiry and claim state. The landing page only builds
// a safe destination and never claims an invite or creates somebody's watch.
export function watchInviteOpenLink(search: string, device: 'ios' | 'android' | null): string | null {
  const tokens = new URLSearchParams(search).getAll('watch');
  if (tokens.length !== 1 || !/^[A-Za-z0-9_-]{43}$/.test(tokens[0])) return null;
  const appLink = `flixie:///invite?watch=${encodeURIComponent(tokens[0])}`;
  if (device !== 'android') return appLink;
  return appLink.replace('flixie:', 'intent:') +
    '#Intent;scheme=flixie;package=com.flixie.app;S.browser_fallback_url=' +
    encodeURIComponent(site.androidUrl) + ';end';
}
