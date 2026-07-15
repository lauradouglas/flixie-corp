/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Mail, HelpCircle, Terminal, ArrowRight } from 'lucide-react';
import { PageId } from '../types';

interface ContactViewProps {
  setCurrentPage: (page: PageId) => void;
}

export default function ContactView({ setCurrentPage }: ContactViewProps) {
  return (
    <div id="contact-view" className="relative overflow-hidden pt-24 pb-20">
      <div className="absolute top-24 right-1/4 w-[400px] h-[300px] bg-flixie-teal/5 rounded-full blur-[120px] pointer-events-none" />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="p-2 bg-flixie-teal/10 border border-flixie-teal/20 text-flixie-teal w-fit rounded-xl mx-auto mb-2">
            <Mail className="h-6 w-6" />
          </div>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-white tracking-tight">Contact & Support</h1>
          <p className="text-text-secondary text-base">
            Have a question, suggestion, or technical issue? You can contact Flixie directly by email.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-bg-card border border-border-custom p-6 rounded-2xl space-y-4">
            <div className="p-2 bg-flixie-purple/10 text-flixie-purple w-fit rounded-xl"><HelpCircle className="h-5 w-5" /></div>
            <h2 className="font-display font-bold text-lg text-white">Check the FAQs</h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              Common questions about watchlists, ratings, friends, and account features may already be answered.
            </p>
            <button
              onClick={() => {
                setCurrentPage('faq');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 text-xs text-flixie-purple font-semibold hover:text-flixie-light transition-colors group cursor-pointer focus:outline-none"
            >
              Go to FAQs <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="bg-bg-card border border-border-custom p-6 rounded-2xl space-y-4">
            <div className="p-2 bg-flixie-teal/10 text-flixie-teal w-fit rounded-xl"><Terminal className="h-5 w-5" /></div>
            <h2 className="font-display font-bold text-lg text-white">Reporting a bug?</h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              Include your device and operating system, your Flixie username, what you were doing, and any error message you saw.
            </p>
          </div>
        </div>

        <div className="mt-6 bg-bg-card border border-flixie-purple/30 p-8 rounded-2xl text-center space-y-3 shadow-xl shadow-flixie-purple/5">
          <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider block">Email Flixie</span>
          <a
            href="mailto:flixieadmin@gmail.com"
            className="inline-flex items-center gap-2 text-white hover:text-flixie-teal font-display font-bold text-lg sm:text-xl transition-colors outline-none focus:underline"
          >
            <Mail className="h-5 w-5" /> flixieadmin@gmail.com
          </a>
          <p className="text-xs text-text-muted">This opens your preferred email app so you can send your message directly.</p>
        </div>
      </section>
    </div>
  );
}
