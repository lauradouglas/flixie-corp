import { useEffect, type ComponentType } from 'react';
import { MotionConfig } from 'motion/react';
import { type PageId } from './site';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function App({ page, year, View }: { page: PageId; year: number; View: ComponentType }) {
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!('IntersectionObserver' in window) || preference.matches) return;
    const animations = new Set<Animation>();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        // A single product-detail reveal connects the hero to friends' opinions.
        // Default HTML remains visible if scripts or animation APIs fail.
        if (typeof entry.target.animate !== 'function') continue;
        const animation = entry.target.animate([
          { opacity: 0.65, transform: 'translateY(18px) scale(.985)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' },
        ], { duration: 560, easing: 'cubic-bezier(.16,1,.3,1)' });
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      }
    }, { threshold: 0.15 });
    document.querySelectorAll('[data-motion="friends"]').forEach(node => observer.observe(node));
    const stop = () => {
      if (!preference.matches) return;
      observer.disconnect();
      animations.forEach(animation => animation.cancel());
      animations.clear();
    };
    preference.addEventListener('change', stop);
    return () => {
      observer.disconnect();
      animations.forEach(animation => animation.cancel());
      preference.removeEventListener('change', stop);
    };
  }, [page]);

  return <MotionConfig reducedMotion="user">
    <div className="min-h-screen bg-bg-main flex flex-col text-text-primary antialiased">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navbar currentPage={page} />
      <main id="main-content" tabIndex={-1} className="flex-1"><View /></main>
      <Footer year={year} />
    </div>
  </MotionConfig>;
}
