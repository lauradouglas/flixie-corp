/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PageId } from '../types';

import { pages } from '../site';
import DownloadLinks from './DownloadLinks';
import { featureContent, featurePageIds } from '../featureContent';

export default function Footer({ year }: { year: number }) {
  const quickLinks: { label: string; id: PageId }[] = [
    { label: 'Home', id: 'home' },
    { label: 'Features', id: 'features' },
    { label: 'FAQs', id: 'faq' },
    { label: 'About Flixie', id: 'about' },
    { label: 'Privacy Policy', id: 'privacy' },
    { label: 'Contact & Support', id: 'contact' },
  ];

  return (
    <footer className="bg-bg-darkest border-t border-border-custom text-text-secondary pt-16 pb-8" id="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-12 md:col-span-5 space-y-4">
            <a
              href={pages['home'].path}
              className="flex items-center gap-2 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-flixie-purple rounded-lg px-2 py-1"
              id="footer-logo-button"
            >
              <span className="font-display font-bold text-2xl tracking-tight" aria-label="Flixie">
                <span className="text-white">flix</span><span className="text-flixie-purple">ie</span>
              </span>
            </a>

            <p className="text-text-secondary text-sm max-w-sm leading-relaxed">
              Keep a film diary, track TV episodes and find your next watch. Bring friends into the story when you want to.
            </p>
            <a
              href="https://www.instagram.com/flixie_co/"
              className="inline-flex min-h-11 items-center gap-2 text-sm text-flixie-light hover:underline focus:outline-none focus:underline"
            >
              Follow us on Instagram <span aria-hidden="true">↗</span>
            </a>
            <p className="text-xs text-text-muted">@flixie_co · Films, TV and what we’re watching.</p>
          </div>

          <nav aria-label="Explore Flixie features" className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-3 pb-6 border-b border-border-custom">
            {featurePageIds.map(key => <a className="text-sm text-text-secondary hover:text-flixie-light py-2" key={key} href={featureContent[key].path}>{featureContent[key].label}</a>)}
          </nav>
          {/* Quick Links Column */}
          <div className="col-span-6 md:col-span-3">
            <h2 className="text-white font-display font-bold text-base mb-4 tracking-wide">Sitemap</h2>
            <ul className="space-y-2.5 text-sm">
              {quickLinks.slice(0, 3).map((link) => (
                <li key={link.id}>
                  <a
                    href={pages[link.id].path}
                    className="hover:text-flixie-purple transition-colors text-left cursor-pointer focus:outline-none focus:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              {quickLinks.slice(3).map((link) => (
                <li key={link.id}>
                  <a
                    href={pages[link.id].path}
                    className="hover:text-flixie-purple transition-colors text-left cursor-pointer focus:outline-none focus:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <section id="download" aria-labelledby="download-heading" className="col-span-12 md:col-span-4 space-y-4">
            <h2 id="download-heading" className="text-white font-display font-bold text-xl">Get Flixie for your next movie night</h2>
            <DownloadLinks />
          </section>
        </div>

        {/* Divider */}
        <div className="border-t border-border-custom my-8" />

        {/* Attribution, Policy, Copyright Section */}
        <div className="space-y-6">
          {/* Important Required Attributions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-text-muted leading-relaxed">
            <div className="flex gap-3 bg-bg-card p-3 rounded-xl border border-border-custom">
              <div className="font-bold text-flixie-purple flex-shrink-0 text-sm tracking-wider">TMDB</div>
              <p>
                This product uses the TMDB API but is not endorsed or certified by TMDB. All movie content, synopses, and release data are provided for discovery purposes.
              </p>
            </div>
            <div className="flex gap-3 bg-bg-card p-3 rounded-xl border border-border-custom">
              <div className="font-bold text-flixie-teal flex-shrink-0 text-sm tracking-wider">JustWatch</div>
              <p>
                Streaming availability is retrieved through the TMDB API. TMDB’s watch-provider data is powered by JustWatch; Flixie does not integrate with JustWatch directly.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted pt-2">
            <p>
              &copy; {year} Flixie App. All rights reserved. Made for film lovers around the globe.
            </p>
            <div className="flex items-center gap-4">
              <a href={pages['privacy'].path} className="hover:text-flixie-purple transition-colors cursor-pointer">
                Privacy Policy
              </a>
              <a href={pages['contact'].path} className="hover:text-flixie-purple transition-colors cursor-pointer">
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
