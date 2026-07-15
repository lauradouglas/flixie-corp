/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, X } from 'lucide-react';

export default function CookieBanner() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user already consented
    const consent = localStorage.getItem('flixie_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500); // Small delay for premium entry feel
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('flixie_cookie_consent', 'accepted');
    setIsOpen(false);
  };

  const handleDecline = () => {
    localStorage.setItem('flixie_cookie_consent', 'declined');
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md bg-bg-card border border-border-custom p-5 rounded-2xl shadow-2xl z-50 flex flex-col gap-4 backdrop-blur-md bg-opacity-95"
          id="cookie-consent-banner"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="p-2 bg-flixie-purple/15 rounded-lg text-flixie-purple">
              <Cookie className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-text-primary">Cookie Consent</h4>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                We use cookies to personalize movie recommendations, track analytics to improve your experience, and sync social watchlist features securely.
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-text-muted hover:text-text-primary transition-colors p-1"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-3 justify-end text-xs">
            <button
              onClick={handleDecline}
              className="px-3 py-2 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
            >
              Manage Preferences
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 bg-gradient-to-r from-flixie-purple to-flixie-deep text-white font-medium rounded-lg hover:brightness-110 shadow-lg shadow-flixie-purple/20 transition-all cursor-pointer"
            >
              Accept All
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
