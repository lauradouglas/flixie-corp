import { useEffect, useState } from 'react';
import DownloadLinks from './DownloadLinks';
import { downloadDestination } from '../download';

export default function DownloadView() {
  const [opening, setOpening] = useState(false);
  useEffect(() => {
    const destination = downloadDestination(navigator.userAgent, navigator.platform, navigator.maxTouchPoints);
    if (!destination) return;
    setOpening(true);
    window.location.replace(destination);
  }, []);

  return <section className="pt-36 pb-24 px-6 max-w-3xl mx-auto" aria-labelledby="download-title">
    <p className="text-flixie-light font-bold mb-4">Your next film night starts here</p>
    <h1 id="download-title" className="text-4xl sm:text-5xl font-bold mb-6">Get Flixie.</h1>
    <p className="text-text-secondary text-lg leading-relaxed mb-8" role="status">{opening ? 'Opening your app store. If nothing happens, choose your store below.' : 'Keep your film diary, save your next watch and discover films with friends. Choose your app store below.'}</p>
    <DownloadLinks />
    <p className="text-sm text-text-secondary leading-relaxed mt-8">If Instagram won’t open the store, use its menu to open this page in Safari or Chrome, then tap your store button.</p>
    <a href="/" className="inline-block mt-8 underline text-flixie-light">Explore Flixie</a>
  </section>;
}
