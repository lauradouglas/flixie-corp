/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clapperboard, Menu, X, Download } from 'lucide-react';
import { PageId } from '../types';

interface NavbarProps {
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  onDownloadClick: () => void;
}

export default function Navbar({ currentPage, setCurrentPage, onDownloadClick }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll to style the navbar beautifully with background blurring
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: { id: PageId; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'faq', label: 'FAQs' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (pageId: PageId) => {
    setCurrentPage(pageId);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled 
          ? 'bg-bg-nav/90 backdrop-blur-md border-b border-border-custom py-3 shadow-lg' 
          : 'bg-transparent py-5'
      }`}
      id="main-navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-flixie-purple rounded-lg px-2 py-1"
            id="logo-button"
            aria-label="Flixie Home"
          >
            <div className="p-2 bg-gradient-to-tr from-flixie-deep to-flixie-purple rounded-xl shadow-lg shadow-flixie-purple/20 group-hover:scale-105 transition-transform">
              <Clapperboard className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight bg-gradient-to-r from-white via-text-primary to-flixie-purple bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              Flixie
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Desktop menu">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-flixie-purple/50 ${
                    isActive
                      ? 'text-flixie-purple font-semibold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-1 left-4 right-4 h-0.5 bg-flixie-purple rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Download CTA Button */}
          <div className="hidden md:block">
            <button
              onClick={onDownloadClick}
              className="px-5 py-2.5 bg-gradient-to-r from-flixie-purple to-flixie-deep text-white font-semibold text-sm rounded-xl hover:brightness-110 active:scale-98 shadow-lg shadow-flixie-purple/20 hover:shadow-flixie-purple/30 transition-all cursor-pointer flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-flixie-purple"
              id="desktop-download-cta"
            >
              <Download className="h-4 w-4" />
              Download App
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-flixie-purple rounded-lg transition-colors cursor-pointer"
              aria-expanded={isOpen}
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-bg-nav border-b border-border-custom overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
              {navLinks.map((link) => {
                const isActive = currentPage === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all ${
                      isActive
                        ? 'bg-flixie-purple/10 text-flixie-purple font-semibold'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
              <div className="pt-4 px-4">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onDownloadClick();
                  }}
                  className="w-full py-3 bg-gradient-to-r from-flixie-purple to-flixie-deep text-white font-semibold text-center rounded-xl hover:brightness-110 transition-all shadow-lg shadow-flixie-purple/20 flex items-center justify-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  Download App
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
