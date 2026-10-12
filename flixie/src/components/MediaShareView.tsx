import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { sharedMediaOpenLink, sharedMediaStore } from '../mediaShare';
import DownloadLinks from './DownloadLinks';

export default function MediaShareView() {
  const [appLink, setAppLink] = useState<string | null>(null);
  const [isShow, setIsShow] = useState(false);
  useEffect(() => {
    const device = sharedMediaStore(navigator.userAgent, navigator.platform, navigator.maxTouchPoints);
    setAppLink(sharedMediaOpenLink(window.location.pathname, device));
    setIsShow(window.location.pathname.startsWith('/shows/'));
  }, []);
  return <section className="max-w-3xl mx-auto px-6 pt-28 pb-16 sm:pt-32 sm:pb-24">
    <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight mb-5">A {isShow ? 'show' : 'movie'} to enjoy on Flixie</h1>
    <p className="text-text-secondary text-lg leading-relaxed max-w-xl mb-8">Someone’s shared a title with you. Open it in Flixie to explore it and save it to your watchlist.</p>
    {appLink && <a href={appLink} className="inline-flex min-h-12 items-center gap-3 px-6 py-3 rounded-xl bg-flixie-purple text-bg-darkest font-bold hover:bg-flixie-light mb-10">Open in Flixie <ArrowUpRight size={20} aria-hidden="true" /></a>}
    <h2 className="font-display text-2xl font-bold mb-4">Need the app?</h2>
    <DownloadLinks />
    <p className="text-text-secondary mt-6 leading-relaxed">Already have Flixie? Tap Open in Flixie above. If your browser blocks it, open this page in Safari or Chrome. After installing, tap the original shared link again to open this title.</p>
    <noscript><p className="mt-6">Download Flixie, then tap the shared link again to open the movie or show.</p></noscript>
  </section>;
}
