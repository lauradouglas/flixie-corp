import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { sharedMediaAppLink, sharedMediaStore } from '../mediaShare';
import { site } from '../site';
import DownloadLinks from './DownloadLinks';

export default function MediaShareView() {
  const [appLink, setAppLink] = useState<string | null>(null);
  const [isShow, setIsShow] = useState(false);
  const [autoStore, setAutoStore] = useState<'ios' | 'android' | null>(null);
  const [cancelled, setCancelled] = useState(false);
  useEffect(() => {
    const link = sharedMediaAppLink(window.location.pathname);
    setAppLink(link);
    if (link) setAutoStore(sharedMediaStore(navigator.userAgent, navigator.platform, navigator.maxTouchPoints));
    setIsShow(window.location.pathname.startsWith('/shows/'));
  }, []);
  useEffect(() => {
    if (!autoStore || cancelled) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const stop = () => { clearTimeout(timer); timer = undefined; };
    const onHide = () => { if (document.visibilityState !== 'visible') { stop(); setCancelled(true); } };
    timer = setTimeout(() => {
      if (document.visibilityState === 'visible') window.location.replace(autoStore === 'ios' ? site.iosUrl : site.androidUrl);
    }, 2000);
    document.addEventListener('visibilitychange', onHide);
    return () => { stop(); document.removeEventListener('visibilitychange', onHide); };
  }, [autoStore, cancelled]);
  return <section className="max-w-3xl mx-auto px-6 pt-28 pb-16 sm:pt-32 sm:pb-24">
    <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight mb-5">A {isShow ? 'show' : 'movie'} to enjoy on Flixie</h1>
    <p className="text-text-secondary text-lg leading-relaxed max-w-xl mb-8">Someone’s shared a title with you. Open it in Flixie to explore it and save it to your watchlist.</p>
    {appLink && <a href={appLink} onClick={() => setCancelled(true)} className="inline-flex min-h-12 items-center gap-3 px-6 py-3 rounded-xl bg-flixie-purple text-bg-darkest font-bold hover:bg-flixie-light mb-10">Open in Flixie <ArrowUpRight size={20} aria-hidden="true" /></a>}
    {autoStore && !cancelled && <div className="mb-8" role="status">
      <p className="text-text-secondary">Opening {autoStore === 'ios' ? 'the App Store' : 'Google Play'} for Flixie…</p>
      <button type="button" onClick={() => setCancelled(true)} className="min-h-11 py-2 text-flixie-light underline">Stay on this page</button>
    </div>}
    <h2 className="font-display text-2xl font-bold mb-4">Need the app?</h2>
    <DownloadLinks />
    <p className="text-text-secondary mt-6 leading-relaxed">After installing Flixie, tap the shared link again to open this title. If the Open button doesn’t launch the app, download it using the links above.</p>
    <noscript><p className="mt-6">Download Flixie, then tap the shared link again to open the movie or show.</p></noscript>
  </section>;
}
