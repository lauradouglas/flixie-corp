import MobileAppPrompt from './web/MobileAppPrompt';
import {InitialTitle} from './web/PublicTitleShell';
import {catalogTitle} from './catalog';
import type { ComponentType } from 'react';
import { useSectionMotion } from './useSectionMotion';
import { MotionConfig } from 'motion/react';
import { type PageId } from './site';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WebsiteAnalyticsChoice from './components/WebsiteAnalyticsChoice';

export default function App({ page, year, View }: { page: PageId; year: number; View: ComponentType }) {
  useSectionMotion(page);

  if (page === 'webApp' || page === 'mediaShare' || page.startsWith('title-')) return <InitialTitle.Provider value={catalogTitle(page)}><View /></InitialTitle.Provider>;

  return <MotionConfig reducedMotion="user">
    <div className="min-h-screen bg-bg-main flex flex-col text-text-primary antialiased">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navbar currentPage={page} />
      <main id="main-content" tabIndex={-1} className="flex-1"><View /></main>
      <Footer year={year} />
      <WebsiteAnalyticsChoice page={page} />
      <MobileAppPrompt/>
    </div>
  </MotionConfig>;
}
