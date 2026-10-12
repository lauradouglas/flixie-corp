export function sharedMediaPath(pathname: string): string | null {
  const match = /^\/(movies|shows)\/([1-9][0-9]*)\/?$/.exec(pathname);
  if (!match || !Number.isSafeInteger(Number(match[2])) || Number(match[2]) > 2147483647) return null;
  return `/${match[1]}/${match[2]}`;
}
export function sharedMediaAppLink(pathname: string): string | null {
  const path = sharedMediaPath(pathname);
  return path ? `flixie://${path}?source=shared_link` : null;
}

export function sharedMediaStore(userAgent: string, platform: string, maxTouchPoints: number): 'ios' | 'android' | null {
  if (/Android/i.test(userAgent)) return 'android';
  if (/iPhone|iPad|iPod/i.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1)) return 'ios';
  return null;
}

// Android Chrome resolves the installed app; its fallback is handled by the browser.
// iOS receives an explicit app-opening action, never a guessed store timeout.
export function sharedMediaOpenLink(pathname: string, device: 'ios' | 'android' | null): string | null {
  const appLink = sharedMediaAppLink(pathname);
  if (!appLink) return null;
  if (device !== 'android') return appLink;
  return appLink.replace('flixie:', 'intent:') +
    '#Intent;scheme=flixie;package=com.flixie.app;S.browser_fallback_url=' +
    encodeURIComponent('https://play.google.com/store/apps/details?id=com.flixie.app') + ';end';
}
