import type { ComponentType } from 'react';
import { MotionConfig } from 'motion/react';
import { type PageId } from './site';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function App({ page, year, View }: { page: PageId; year: number; View: ComponentType }) {
  return <MotionConfig reducedMotion="user">
    <div className="min-h-screen bg-bg-main flex flex-col text-text-primary antialiased">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navbar currentPage={page} />
      <main id="main-content" tabIndex={-1} className="flex-1"><View /></main>
      <Footer year={year} />
    </div>
  </MotionConfig>;
}
