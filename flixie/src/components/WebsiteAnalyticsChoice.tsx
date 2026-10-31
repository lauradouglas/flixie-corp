import { useEffect, useRef, useState } from 'react';
import { websiteAnalytics, type AnalyticsChoice } from '../websiteAnalytics';
import type { PageId } from '../site';
export default function WebsiteAnalyticsChoice({ page }: { page: PageId }) {
  const [choice, setChoice] = useState<AnalyticsChoice | null>(null);
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState(0);
  const panel = useRef<HTMLElement>(null);
  const settings = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const analytics = websiteAnalytics();
    setChoice(analytics.choice);
    setOpen(analytics.choice === 'unknown');
    void analytics.start(page);
    const click = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest('a') : null;
      if (anchor) analytics.storeClicked(anchor.href);
    };
    document.addEventListener('click', click);
    return () => document.removeEventListener('click', click);
  }, [page]);
  useEffect(() => {
    if (!open || !panel.current) { setHeight(0); return; }
    const measure = () => setHeight(panel.current?.getBoundingClientRect().height ?? 0);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(panel.current);
    return () => observer.disconnect();
  }, [open]);
  const choose = (next: 'accepted' | 'declined') => {
    void websiteAnalytics().choose(next);
    setChoice(next); setOpen(false);
    settings.current?.focus({ preventScroll: true });
  };
  return <>
    <div className="px-6 pb-8 text-center text-sm text-text-secondary">
      <button ref={settings} type="button" onClick={() => setOpen(true)} className="min-h-11 underline underline-offset-4 hover:text-white">Analytics choices</button>
      {choice && choice !== 'unknown' && <span className="ml-3" role="status">Analytics {choice === 'accepted' ? 'allowed' : 'off'}</span>}
    </div>
    {open && <aside ref={panel} aria-label="Optional website analytics" className="fixed inset-x-0 bottom-0 z-50 max-h-[70dvh] overflow-y-auto border-t border-border-custom bg-bg-darkest px-6 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-8 gap-y-4">
        <div className="min-w-0 flex-1 basis-80">
          <h2 className="font-display text-base font-bold text-white">Help improve Flixie?</h2>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-text-secondary">Allow optional analytics to measure page visits, campaign links and app-store clicks. You can download Flixie either way. <a href="/privacy" className="text-flixie-light underline">Privacy policy</a></p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => choose('declined')} className="min-h-11 rounded-xl border border-border-custom px-5 py-3 text-sm font-bold text-white hover:bg-bg-elevated">No thanks</button>
          <button type="button" onClick={() => choose('accepted')} className="min-h-11 rounded-xl border border-flixie-purple px-5 py-3 text-sm font-bold text-white hover:bg-bg-elevated">Allow analytics</button>
        </div>
      </div>
    </aside>}
    <div aria-hidden="true" style={{ height }} />
  </>;
}
