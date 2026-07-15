/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, HelpCircle, AlertCircle, Send, CheckCircle, Smartphone, Terminal, ArrowRight } from 'lucide-react';
import { SupportFormInput, PageId } from '../types';

interface ContactViewProps {
  setCurrentPage: (page: PageId) => void;
}

export default function ContactView({ setCurrentPage }: ContactViewProps) {
  const [formData, setFormData] = useState<SupportFormInput>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState<Partial<SupportFormInput>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Partial<SupportFormInput> = {};
    if (!formData.name.trim()) newErrors.name = 'Please enter your name.';
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Please choose a subject.';
    if (!formData.message.trim()) {
      newErrors.message = 'Please write your message or report.';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message should be at least 10 characters.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate server request delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1800);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear field-specific error as user types
    if (errors[name as keyof SupportFormInput]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  return (
    <div id="contact-view" className="relative overflow-hidden pt-24 pb-16">
      {/* Background highlight */}
      <div className="absolute top-24 right-1/4 w-[400px] h-[300px] bg-flixie-teal/5 rounded-full blur-[120px] pointer-events-none" />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="p-2 bg-flixie-teal/10 border border-flixie-teal/20 text-flixie-teal w-fit rounded-xl mx-auto mb-2">
            <Mail className="h-6 w-6" />
          </div>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-white tracking-tight">
            Contact & Support Center
          </h1>
          <p className="text-text-secondary text-base">
            Reach out regarding technical feedback, list synchronization, or custom questions. Our desk is open 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Guides and Info */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* FAQ Helper Card */}
            <div className="bg-bg-card border border-border-custom p-6 rounded-2xl space-y-4">
              <div className="p-2 bg-flixie-purple/10 text-flixie-purple w-fit rounded-xl">
                <HelpCircle className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-lg text-white">Have you checked our FAQs?</h3>
              <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
                Most general inquiries regarding watchlist synchronisation, rating procedures, or friend additions are answered instantly in our Frequently Asked Questions directory.
              </p>
              <button
                onClick={() => {
                  setCurrentPage('faq');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 text-xs text-flixie-purple font-semibold hover:text-flixie-light transition-colors group cursor-pointer focus:outline-none"
              >
                Go to FAQ Directory
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Technical Bug Reporting Guide */}
            <div className="bg-bg-card border border-border-custom p-6 rounded-2xl space-y-4">
              <div className="p-2 bg-flixie-teal/10 text-flixie-teal w-fit rounded-xl">
                <Terminal className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-lg text-white">How to Report a Technical Bug</h3>
              <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
                To help our engineering squad resolve software anomalies quickly, please include the following diagnostic parameters inside your message body whenever possible:
              </p>
              
              <ul className="space-y-2 text-xs font-mono text-text-muted bg-bg-darkest p-3.5 rounded-xl border border-border-custom">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-flixie-teal rounded-full" />
                  Your device model & OS (e.g. iPhone 15, iOS 17)
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-flixie-teal rounded-full" />
                  Your active Flixie Username or ID
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-flixie-teal rounded-full" />
                  Step-by-step actions leading to the bug
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-flixie-teal rounded-full" />
                  Details of error popups or codes
                </li>
              </ul>
            </div>

            {/* Direct Email Placement */}
            <div className="bg-bg-card border border-border-custom p-6 rounded-2xl text-center space-y-2">
              <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider block">Official Support Email</span>
              <a 
                href="mailto:support@flixie-app-placeholder.com"
                className="text-white hover:text-flixie-teal font-display font-bold text-lg sm:text-xl transition-colors outline-none focus:underline"
              >
                support@flixie-app-placeholder.com
              </a>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Direct emails are checked hourly. Average response duration: &lt; 2 hours.
              </p>
            </div>

          </div>

          {/* Right Column: Dynamic Form Zone */}
          <div className="lg:col-span-7 bg-bg-card border border-border-custom p-6 sm:p-8 rounded-3xl shadow-2xl relative">
            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.form
                  key="contact-form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-5"
                  noValidate
                >
                  <h3 className="font-display font-extrabold text-xl text-white tracking-wide border-b border-border-custom pb-3">
                    Send Support Message
                  </h3>

                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label htmlFor="name-input" className="block text-xs font-semibold text-text-secondary">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      id="name-input"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full bg-bg-darkest border px-4 py-3 rounded-xl text-text-primary text-sm outline-none transition-all ${
                        errors.name ? 'border-status-error/60 focus:border-status-error' : 'border-border-custom focus:border-flixie-purple'
                      }`}
                      placeholder="e.g. Laura Douglas"
                    />
                    {errors.name && (
                      <p className="text-status-error text-xs flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3.5 w-3.5" /> {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email field */}
                  <div className="space-y-1.5">
                    <label htmlFor="email-input" className="block text-xs font-semibold text-text-secondary">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email-input"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full bg-bg-darkest border px-4 py-3 rounded-xl text-text-primary text-sm outline-none transition-all ${
                        errors.email ? 'border-status-error/60 focus:border-status-error' : 'border-border-custom focus:border-flixie-purple'
                      }`}
                      placeholder="e.g. laura@example.com"
                    />
                    {errors.email && (
                      <p className="text-status-error text-xs flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3.5 w-3.5" /> {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Subject field */}
                  <div className="space-y-1.5">
                    <label htmlFor="subject-select" className="block text-xs font-semibold text-text-secondary">
                      Inquiry Subject
                    </label>
                    <select
                      id="subject-select"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className={`w-full bg-bg-darkest border px-4 py-3 rounded-xl text-text-primary text-sm outline-none transition-all cursor-pointer ${
                        errors.subject ? 'border-status-error/60 focus:border-status-error' : 'border-border-custom focus:border-flixie-purple'
                      }`}
                    >
                      <option value="">-- Choose Subject Category --</option>
                      <option value="General Question">General Inquiry / Feedback</option>
                      <option value="Technical Issue">Technical Problem / Software Bug</option>
                      <option value="Watchlist Synchronization">Watchlist / Friends Sync Error</option>
                      <option value="Account Deletion">Account Management / Data Deletion</option>
                      <option value="Other">Other Issues</option>
                    </select>
                    {errors.subject && (
                      <p className="text-status-error text-xs flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3.5 w-3.5" /> {errors.subject}
                      </p>
                    )}
                  </div>

                  {/* Message field */}
                  <div className="space-y-1.5">
                    <label htmlFor="message-input" className="block text-xs font-semibold text-text-secondary">
                      Your Message
                    </label>
                    <textarea
                      id="message-input"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleInputChange}
                      className={`w-full bg-bg-darkest border px-4 py-3 rounded-xl text-text-primary text-sm outline-none transition-all resize-none ${
                        errors.message ? 'border-status-error/60 focus:border-status-error' : 'border-border-custom focus:border-flixie-purple'
                      }`}
                      placeholder="Describe your question or technical problem in details..."
                    />
                    {errors.message && (
                      <p className="text-status-error text-xs flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3.5 w-3.5" /> {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-gradient-to-r from-flixie-purple to-flixie-deep disabled:from-flixie-purple/50 disabled:to-flixie-deep/50 text-white font-bold rounded-xl hover:brightness-110 active:scale-98 transition-all shadow-lg shadow-flixie-purple/20 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                      id="contact-submit-btn"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending Report...
                        </>
                      ) : (
                        <>
                          <Send className="h-4.5 w-4.5" />
                          Submit Secure Report
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="success-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 px-6 text-center space-y-6"
                >
                  <div className="p-4 bg-status-success/15 border border-status-success/30 text-status-success rounded-full w-fit mx-auto shadow-lg shadow-status-success/10">
                    <CheckCircle className="h-10 w-10 animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display font-extrabold text-2xl text-white tracking-wide">
                      Report Submitted Successfully!
                    </h3>
                    <p className="text-text-secondary text-sm max-w-md mx-auto leading-relaxed">
                      Thank you for contacting Flixie support. Your ticket has been logged inside our tracking ledger. An email with follow-up information has been dispatched.
                    </p>
                  </div>

                  <div className="bg-bg-darkest p-4 rounded-xl border border-border-custom max-w-sm mx-auto text-xs space-y-1 font-mono text-left">
                    <div className="flex justify-between">
                      <span className="text-text-muted">TICKET ID:</span>
                      <span className="text-white font-bold">#FLX-{Math.floor(100000 + Math.random() * 900000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">STATUS:</span>
                      <span className="text-status-success font-bold">Received (High Priority)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">EXPECTED RESPONSE:</span>
                      <span className="text-text-secondary">&lt; 2 Hours</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsSuccess(false)}
                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-border-custom hover:border-flixie-purple text-text-secondary hover:text-white rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer"
                  >
                    Submit New Report
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </section>
    </div>
  );
}
