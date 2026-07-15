/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clapperboard, 
  Smartphone, 
  X, 
} from 'lucide-react';

import { PageId } from './types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import FeaturesView from './components/FeaturesView';
import FaqView from './components/FaqView';
import PrivacyView from './components/PrivacyView';
import TermsView from './components/TermsView';
import ContactView from './components/ContactView';
import CookieBanner from './components/CookieBanner';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const handleDownloadClick = () => {
    setShowDownloadModal(true);
  };

  const renderActiveView = () => {
    switch (currentPage) {
      case 'home':
        return <HomeView setCurrentPage={setCurrentPage} onDownloadClick={handleDownloadClick} />;
      case 'features':
        return <FeaturesView onDownloadClick={handleDownloadClick} />;
      case 'faq':
        return <FaqView />;
      case 'privacy':
        return <PrivacyView />;
      case 'terms':
        return <TermsView />;
      case 'contact':
        return <ContactView setCurrentPage={setCurrentPage} />;
      default:
        return <HomeView setCurrentPage={setCurrentPage} onDownloadClick={handleDownloadClick} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex flex-col justify-between text-text-primary selection:bg-flixie-purple/35 selection:text-white antialiased">
      {/* Navigation */}
      <Navbar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        onDownloadClick={handleDownloadClick} 
      />

      {/* Main Page Area */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer setCurrentPage={setCurrentPage} />

      {/* Cookie Consent Banner */}
      <CookieBanner />

      {/* Download Beta Companion App Modal */}
      <AnimatePresence>
        {showDownloadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            id="download-modal"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-bg-card border border-border-custom max-w-lg w-full rounded-3xl p-6 sm:p-8 relative shadow-2xl overflow-hidden"
            >
              {/* Top gradient glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-20 bg-flixie-purple/15 rounded-full blur-[40px] pointer-events-none" />

              <button
                onClick={() => setShowDownloadModal(false)}
                className="absolute right-4 top-4 p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-text-muted hover:text-white transition-all cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="space-y-6">
                <div className="flex gap-4 items-center">
                  <div className="p-3 bg-gradient-to-tr from-flixie-deep to-flixie-purple text-white rounded-2xl shadow-lg shadow-flixie-purple/20">
                    <Clapperboard className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-xl text-white tracking-wide">
                      Download Flixie
                    </h3>
                    <p className="text-xs text-text-muted">Companion App v1.0</p>
                  </div>
                </div>

                <p className="text-text-secondary text-sm leading-relaxed">
                  Flixie is currently running a <strong>Private Beta TestFlight</strong> program. Choose your platform below to view the available testing options.
                </p>

                {/* Simulated App Store badges inside modal */}
                <div className="grid grid-cols-2 gap-3 pb-2 border-b border-border-custom">
                  {/* iOS Badge */}
                  <a
                    href="#testflight-ios"
                    className="flex items-center justify-center gap-2.5 px-4 py-3 bg-bg-darkest hover:bg-bg-elevated border border-border-custom rounded-2xl transition-all cursor-pointer text-left focus:outline-none"
                    id="modal-ios-btn"
                  >
                    <Smartphone className="w-5 h-5 text-flixie-purple" />
                    <div className="flex flex-col">
                      <span className="text-[9px] text-text-muted uppercase tracking-wider font-semibold">TestFlight</span>
                      <span className="text-xs font-bold text-white -mt-0.5">iOS App Store</span>
                    </div>
                  </a>

                  {/* Android Badge */}
                  <a
                    href="#earlyaccess-android"
                    className="flex items-center justify-center gap-2.5 px-4 py-3 bg-bg-darkest hover:bg-bg-elevated border border-border-custom rounded-2xl transition-all cursor-pointer text-left focus:outline-none"
                    id="modal-android-btn"
                  >
                    <Smartphone className="w-5 h-5 text-flixie-teal" />
                    <div className="flex flex-col">
                      <span className="text-[9px] text-text-muted uppercase tracking-wider font-semibold">Early Access</span>
                      <span className="text-xs font-bold text-white -mt-0.5">Google Play</span>
                    </div>
                  </a>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
