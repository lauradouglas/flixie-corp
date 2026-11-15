import './components/site-footer.css';
import MobileAppPrompt from './web/MobileAppPrompt';
import {InitialTitle} from './web/PublicTitleShell';
import {catalogTitle} from './catalog';
import {catalogPerson} from './peopleCatalog';
import {InitialPerson} from './web/personContext';
import { useEffect, type ComponentType } from 'react';
import { useSectionMotion } from './useSectionMotion';
import { MotionConfig } from 'motion/react';
import { type PageId } from './site';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WebsiteAnalyticsChoice from './components/WebsiteAnalyticsChoice';

export default function App({ page, year, View }: { page: PageId; year: number; View: ComponentType }) {
  useSectionMotion(page);
  useEffect(() => {
    if (page !== 'privacy' && page !== 'contact') return;
    let frame = 0;
    const revealDeletion = () => {
      if (window.location.hash !== '#account-deletion') return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => document.getElementById('account-deletion')?.scrollIntoView({block:'start',behavior:'instant'}));
    };
    revealDeletion();
    window.addEventListener('hashchange', revealDeletion);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('hashchange', revealDeletion); };
  }, [page]);

  if (page === 'home' || page === 'webApp' || page === 'mediaShare' || page === 'personShare' || page.startsWith('title-') || page.startsWith('person-')) return <InitialPerson.Provider value={catalogPerson(page)}><InitialTitle.Provider value={catalogTitle(page)}><View /></InitialTitle.Provider></InitialPerson.Provider>;

  return <MotionConfig reducedMotion="user">
    <div className="corporate-site min-h-screen bg-bg-main flex flex-col text-text-primary antialiased">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navbar currentPage={page} />
      <main id="main-content" tabIndex={-1} className="flex-1"><View /></main>
      <Footer year={year} />
      <WebsiteAnalyticsChoice page={page} />
      {!['privacy', 'terms', 'contact'].includes(page) && <MobileAppPrompt/>}
    </div>
  </MotionConfig>;
}
