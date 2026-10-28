import { useEffect } from 'react';
import type { PageId } from './site';

/** Prepare offscreen content before entry; never dim already-visible content. */
export function useSectionMotion(page: PageId) {
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches || !('IntersectionObserver' in window)) return;
    const prepared: HTMLElement[] = [];
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        entry.target.classList.replace('section-motion-pending', 'section-motion-entered');
      }
    }, { threshold: 0 });
    const prepare = (element: HTMLElement | null, delay = 0) => {
      if (!element || element.getBoundingClientRect().top < window.innerHeight + 24) return;
      element.style.setProperty('--section-motion-delay', `${delay}ms`);
      element.classList.add('section-motion-pending');
      prepared.push(element);
      observer.observe(element);
    };
    document.querySelectorAll(
      '.marketing-social,.marketing-community,.marketing-tracking-grid article,.feature-visual-detail',
    ).forEach(group => {
      prepare(group.querySelector<HTMLElement>(':scope > div'));
      prepare(group.querySelector<HTMLElement>(':scope > figure'), 80);
    });
    prepare(document.querySelector('.marketing-section-heading'));
    // Keep the lavender surface constant: animating its colour looked like a flash.
    const clear = () => {
      observer.disconnect();
      prepared.forEach(element => {
        element.classList.remove('section-motion-pending', 'section-motion-entered');
        element.style.removeProperty('--section-motion-delay');
      });
    };
    const stop = () => { if (preference.matches) clear(); };
    preference.addEventListener('change', stop);
    return () => {
      clear();
      preference.removeEventListener('change', stop);
    };
  }, [page]);
}
