/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Clapperboard, Film, Github, Twitter, Youtube, MessageSquare } from 'lucide-react';
import { PageId } from '../types';

interface FooterProps {
  setCurrentPage: (page: PageId) => void;
}

export default function Footer({ setCurrentPage }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (pageId: PageId) => {
    setCurrentPage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialLinks = [
    { label: 'Twitter', icon: <Twitter className="h-5 w-5" />, href: '#', id: 'twitter-link' },
    { label: 'YouTube', icon: <Youtube className="h-5 w-5" />, href: '#', id: 'youtube-link' },
    { label: 'Github', icon: <Github className="h-5 w-5" />, href: '#', id: 'github-link' },
    { label: 'Discord', icon: <MessageSquare className="h-5 w-5" />, href: '#', id: 'discord-link' },
  ];

  const quickLinks: { label: string; id: PageId }[] = [
    { label: 'Home', id: 'home' },
    { label: 'Features', id: 'features' },
    { label: 'FAQs', id: 'faq' },
    { label: 'Privacy Policy', id: 'privacy' },
    { label: 'Terms of Service', id: 'terms' },
    { label: 'Contact & Support', id: 'contact' },
  ];

  return (
    <footer className="bg-bg-darkest border-t border-border-custom text-text-secondary pt-16 pb-8" id="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-12 md:col-span-5 space-y-4">
            <button
              onClick={() => handleLinkClick('home')}
              className="flex items-center gap-2 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-flixie-purple rounded-lg px-2 py-1"
              id="footer-logo-button"
            >
              <div className="p-2 bg-gradient-to-tr from-flixie-deep to-flixie-purple rounded-xl shadow-lg shadow-flixie-purple/20">
                <Clapperboard className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-2xl tracking-tight text-white group-hover:text-flixie-purple transition-colors">
                Flixie
              </span>
            </button>
            
            <p className="text-text-secondary text-sm max-w-sm leading-relaxed">
              Flixie is the modern social platform built for cinema lovers. Discover trending movies, curate custom watchlists, connect with friends, and schedule movie watch requests seamlessly.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  id={social.id}
                  className="p-2.5 bg-bg-card hover:bg-flixie-purple/20 border border-border-custom hover:border-flixie-purple text-text-muted hover:text-white rounded-xl transition-all"
                  aria-label={`Follow Flixie on ${social.label}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="col-span-6 md:col-span-3">
            <h4 className="text-white font-display font-bold text-base mb-4 tracking-wide">Sitemap</h4>
            <ul className="space-y-2.5 text-sm">
              {quickLinks.slice(0, 3).map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleLinkClick(link.id)}
                    className="hover:text-flixie-purple transition-colors text-left cursor-pointer focus:outline-none focus:underline"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              {quickLinks.slice(3).map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleLinkClick(link.id)}
                    className="hover:text-flixie-purple transition-colors text-left cursor-pointer focus:outline-none focus:underline"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Download App Store Badges (Editable Placeholders) */}
          <div className="col-span-6 md:col-span-4 space-y-4">
            <h4 className="text-white font-display font-bold text-base tracking-wide">Get the App</h4>
            <p className="text-text-muted text-sm leading-relaxed">
              Available on iOS and Android. Start your social movie discovery experience today.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5">
              {/* App Store Placeholder Button */}
              <a
                href="#download-ios"
                className="flex items-center justify-center gap-2.5 px-4 py-2.5 bg-bg-card hover:bg-bg-elevated border border-border-custom hover:border-flixie-purple/50 rounded-xl transition-all cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-flixie-purple"
                id="ios-download-btn"
              >
                <div className="text-white">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,22C14.32,22.05 13.89,21.24 12.37,21.24C10.84,21.24 10.37,21.97 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.1,16.67C20.08,16.74 19.67,18.11 18.71,19.5M15.97,4.17C16.63,3.37 17.07,2.28 16.95,1C16,1.04 14.9,1.6 14.25,2.38C13.68,3.04 13.19,4.14 13.34,5.39C14.39,5.47 15.4,4.88 15.97,4.17Z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Download on the</span>
                  <span className="text-sm font-bold text-white -mt-1">App Store</span>
                </div>
              </a>

              {/* Google Play Placeholder Button */}
              <a
                href="#download-android"
                className="flex items-center justify-center gap-2.5 px-4 py-2.5 bg-bg-card hover:bg-bg-elevated border border-border-custom hover:border-flixie-purple/50 rounded-xl transition-all cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-flixie-purple"
                id="android-download-btn"
              >
                <div className="text-white">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M3,5.27V18.73L16.55,12L3,5.27M17.87,11.33L19.5,12.13L17.87,12.93L12,15.82L10.26,12L12,8.18L17.87,11.33M3,3.15L20.26,11.72C21.25,12.21 21.25,13.22 20.26,13.71L3,22.28C2,22.77 1,22.14 1,21.03V4.4C1,3.29 2,2.66 3,3.15Z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Get it on</span>
                  <span className="text-sm font-bold text-white -mt-1">Google Play</span>
                </div>
              </a>
            </div>
          </div>
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
              &copy; {currentYear} Flixie App. All rights reserved. Made for film lovers around the globe.
            </p>
            <div className="flex items-center gap-4">
              <button onClick={() => handleLinkClick('privacy')} className="hover:text-flixie-purple transition-colors cursor-pointer">
                Privacy Policy
              </button>
              <button onClick={() => handleLinkClick('terms')} className="hover:text-flixie-purple transition-colors cursor-pointer">
                Terms of Service
              </button>
              <button onClick={() => handleLinkClick('contact')} className="hover:text-flixie-purple transition-colors cursor-pointer">
                Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
