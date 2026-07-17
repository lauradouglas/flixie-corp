/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, ChevronUp, Search, Info, MessageSquare, ShieldAlert, Settings, ShieldCheck, AlertTriangle, Mail } from 'lucide-react';
import { FaqCategory, FaqItem } from '../types';

export default function FaqView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Track open state of accordions by 'category-index' or 'question-id'
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    'get-started-0': true, // Keep first open by default
  });

  const faqData: FaqCategory[] = [
    {
      id: 'get-started',
      name: 'Getting Started',
      items: [
        {
          id: 'what-is-flixie',
          question: 'What is Flixie?',
          answer: 'Flixie is a social movie discovery companion app designed to bring film lovers together. With Flixie, you can search thousands of titles, build lists, track what you’ve watched, save your favourites, rate and review movies, and easily connect with friends to coordinate virtual or in-person movie watches.'
        },
        {
          id: 'registration-required',
          question: 'Is registration required to use Flixie?',
          answer: 'Yes. You must register and sign in to use Flixie, including browsing and searching for titles. Registration is free and gives you access to watchlists, watch history, ratings, reviews, friends, and social watch invitations.'
        },
        {
          id: 'data-source',
          question: 'Where does Flixie’s data come from?',
          answer: 'Flixie uses the TMDB API for movie details, synopses, ratings, cast information, and streaming availability. TMDB’s watch-provider data is powered by JustWatch; Flixie does not connect to JustWatch directly and is not endorsed or certified by TMDB or JustWatch.'
        },
        {
          id: 'content-updates',
          question: 'How frequently is content updated?',
          answer: 'Flixie refreshes movie metadata and watch-provider availability through TMDB. Availability can change, so confirm the current listing with the relevant streaming service before watching.'
        }
      ]
    },
    {
      id: 'lists',
      name: 'Watchlist, Watched & Favourites',
      items: [
        {
          id: 'add-watchlist',
          question: 'How do I add a movie to my watchlist?',
          answer: 'To add any movie or TV series to your watchlist, tap the bookmark icon or click the "+ Watchlist" button on the film’s details page. To review your full watchlist, go to your Profile and select the Watchlist tab.'
        },
        {
          id: 'mark-watched',
          question: 'How do I mark a movie as watched?',
          answer: 'When viewing a movie card or details screen, tap the checkmark icon or click "Mark as Watched". Doing this will automatically log the title into your Watched History tab with the current date, and remove it from your pending watchlist.'
        },
        {
          id: 'add-favourites',
          question: 'How do I add a movie to my favourites?',
          answer: 'Tap the heart icon on any movie details page. Favourites are showcased as a featured carousel on the header of your personal profile, making it easy to share your top cinematic tastes with visitors.'
        }
      ]
    },
    {
      id: 'friends',
      name: 'Friends & Requests',
      items: [
        {
          id: 'add-friend',
          question: 'How do I add a friend?',
          answer: 'Navigate to the social Search tab, enter your friend’s email, or username, and tap "Send Friend Request". Once they accept, you’ll be able to view each other’s watched histories and active watchlists.'
        },
        {
          id: 'invite-watch',
          question: 'How do I invite someone to watch a movie?',
          answer: 'From any movie details page, tap the "Send Invitation" button, choose which friend or Film Circle you want to invite, specify a proposed date, time, and whether it’s virtual or in-person, and hit send. They will receive a pending request notification instantly.'
        },
        {
          id: 'see-requests',
          question: 'Where can I see my sent and received watch requests?',
          answer: 'All your social activity is centralized in the "Invitations Center" tab under your Social menu. Here, you will see separate columns for received requests awaiting your confirmation, sent requests, and accepted/upcoming movie schedules.'
        }
      ]
    },
    {
      id: 'account',
      name: 'Account & Settings',
      items: [
        {
          id: 'change-password',
          question: 'How do I change my password?',
          answer: 'Go to your Profile tab, click the Settings gear icon, select "Account Security", and click "Change Password". Enter your current password followed by your chosen new password to update security.'
        },
        {
          id: 'forgot-password',
          question: 'What should I do if I forget my password?',
          answer: 'On the login page of the application, tap "Forgot Password?". Enter your registered email address and we will send you a secure password reset link containing instructions to choose a new credential safely.'
        },
        {
          id: 'sign-out',
          question: 'How do I sign out?',
          answer: 'To sign out of the Flixie app, go to Settings and scroll to the bottom. Tap the "Sign Out" button, and confirm your action. Your local offline cache will remain secure, but social features will suspend until you sign back in.'
        },
        {
          id: 'delete-account',
          question: 'How do I request deletion of my account?',
          answer: 'Open Flixie, go to Profile → Settings → Delete Account, and confirm deletion. Deleting your account permanently removes your profile, email address, username, ratings, reviews, watchlists, lists, friend connections, watch history, and other associated account data. Some information may be retained for a limited period where required by law, to prevent fraud, or for legitimate security purposes. If you cannot access the app, email flixieadmin@gmail.com from your registered email address and include your Flixie username. Never include your password.'
        }
      ]
    },
    {
      id: 'ratings',
      name: 'Ratings & Reviews',
      items: [
        {
          id: 'rate-movie',
          question: 'How do I rate a movie?',
          answer: 'On any movie details page, select your rating out of 10 and save it. Your rating will be added to the movie and reflected in your Flixie activity.'
        },
        {
          id: 'see-reviews',
          question: 'Where can I see all my reviews?',
          answer: 'All the written reviews you submit are archived on your profile under the "Reviews" tab. Here, you can edit, update, delete, or share links to individual reviews with other social networks.'
        }
      ]
    }
  ];

  const toggleItem = (itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Filter FAQs based on search query and category tab
  const getFilteredFaqs = () => {
    return faqData.map(category => {
      // If we are filtering by a specific category, check it
      if (activeCategory !== 'all' && category.id !== activeCategory) {
        return { ...category, items: [] };
      }

      // Filter items in category based on search query
      const filteredItems = category.items.filter(item => {
        const query = searchQuery.toLowerCase();
        return item.question.toLowerCase().includes(query) || item.answer.toLowerCase().includes(query);
      });

      return {
        ...category,
        items: filteredItems
      };
    }).filter(category => category.items.length > 0);
  };

  const filteredFaqs = getFilteredFaqs();

  return (
    <div id="faq-view" className="relative overflow-hidden pt-24 pb-16">
      {/* Background radial highlight */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-flixie-purple/5 rounded-full blur-[120px] pointer-events-none" />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="p-2 bg-flixie-purple/10 border border-flixie-purple/20 text-flixie-purple w-fit rounded-xl mx-auto mb-2">
            <HelpCircle className="h-6 w-6" />
          </div>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-white tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-text-secondary text-base">
            Find quick, comprehensive answers regarding watchlists, social requests, account setup, and data sources below.
          </p>
        </div>

        {/* Search Bar Block */}
        <div className="max-w-xl mx-auto mb-10 relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search questions or keywords (e.g. watchlist, TMDB)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-bg-card border border-border-custom hover:border-flixie-purple/40 focus:border-flixie-purple text-text-primary rounded-2xl outline-none transition-all placeholder:text-text-muted text-sm shadow-inner"
              id="faq-search-input"
            />
            <Search className="h-5 w-5 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-flixie-purple hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Filters Tab Row */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide border cursor-pointer transition-all ${
              activeCategory === 'all'
                ? 'bg-flixie-purple border-flixie-purple text-white shadow-lg shadow-flixie-purple/20'
                : 'bg-bg-card border-border-custom text-text-secondary hover:text-white hover:border-flixie-purple/50'
            }`}
          >
            All Questions
          </button>
          {faqData.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide border cursor-pointer transition-all ${
                activeCategory === cat.id
                  ? 'bg-flixie-purple border-flixie-purple text-white shadow-lg shadow-flixie-purple/20'
                  : 'bg-bg-card border-border-custom text-text-secondary hover:text-white hover:border-flixie-purple/50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List Grid */}
        <div className="max-w-3xl mx-auto space-y-8" id="faq-accordions-container">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 bg-bg-card border border-border-custom rounded-2xl space-y-3">
              <ShieldAlert className="h-10 w-10 text-flixie-peach mx-auto" />
              <h3 className="text-white font-bold">No Matching FAQs Found</h3>
              <p className="text-text-secondary text-xs max-w-xs mx-auto leading-relaxed">
                We couldn't find any questions matching "{searchQuery}". Try typing generic terms like "password" or "watchlist".
              </p>
            </div>
          ) : (
            filteredFaqs.map((category) => (
              <div key={category.id} className="space-y-3" id={`faq-group-${category.id}`}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-flixie-teal font-mono border-b border-border-custom pb-2">
                  {category.name}
                </h3>
                
                <div className="space-y-3">
                  {category.items.map((item, index) => {
                    const uniqueId = `${category.id}-${index}`;
                    const isOpen = !!expandedItems[uniqueId];
                    return (
                      <div
                        key={item.id}
                        className="bg-bg-card border border-border-custom hover:border-flixie-purple/30 rounded-xl overflow-hidden transition-colors"
                        id={`faq-item-${item.id}`}
                      >
                        <button
                          onClick={() => toggleItem(uniqueId)}
                          className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 text-white font-semibold text-sm hover:bg-white/5 cursor-pointer focus:outline-none focus:bg-white/5"
                          aria-expanded={isOpen}
                        >
                          <span className="font-display tracking-wide">{item.question}</span>
                          {isOpen ? (
                            <ChevronUp className="h-4 w-4 text-flixie-purple flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-text-muted flex-shrink-0" />
                          )}
                        </button>
                        
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: 'easeInOut' }}
                              className="overflow-hidden border-t border-border-custom/40 bg-bg-nav/30"
                            >
                              {item.id === 'delete-account' ? (
                                <div className="p-5 space-y-4 text-xs sm:text-sm">
                                  <div className="bg-bg-card border border-border-custom rounded-xl p-4">
                                    <div className="flex items-center gap-2.5 mb-3">
                                      <span className="p-2 bg-flixie-purple/10 text-flixie-purple rounded-lg"><Settings className="h-4 w-4" /></span>
                                      <h4 className="font-display font-bold text-white">Delete your account in the app</h4>
                                    </div>
                                    <ol className="space-y-2.5">
                                      {['Open Flixie.', 'Go to Profile → Settings → Delete Account.', 'Confirm deletion.'].map((step, stepIndex) => (
                                        <li key={step} className="flex items-center gap-2.5 text-text-secondary">
                                          <span className="h-6 w-6 shrink-0 rounded-full bg-flixie-purple/15 text-flixie-purple font-bold text-[10px] flex items-center justify-center">{stepIndex + 1}</span>
                                          {step}
                                        </li>
                                      ))}
                                    </ol>
                                  </div>

                                  <div className="bg-bg-card border border-status-error/25 rounded-xl p-4">
                                    <div className="flex items-center gap-2.5 mb-3">
                                      <span className="p-2 bg-status-error/10 text-status-error rounded-lg"><ShieldCheck className="h-4 w-4" /></span>
                                      <h4 className="font-display font-bold text-white">Deleting your account permanently removes</h4>
                                    </div>
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-text-secondary">
                                      {['Your profile', 'Email address', 'Username', 'Ratings', 'Reviews', 'Watchlists', 'Lists', 'Friend connections', 'Watch history', 'Other associated account data'].map((data) => (
                                        <li key={data} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-status-error shrink-0" />{data}</li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div className="flex gap-2.5 bg-status-warning/10 border border-status-warning/25 p-3.5 rounded-xl text-text-secondary leading-relaxed">
                                    <AlertTriangle className="h-4 w-4 text-status-warning shrink-0 mt-0.5" />
                                    <p>Some information may be retained for a limited period where required by law, to prevent fraud, or for legitimate security purposes.</p>
                                  </div>

                                  <div className="bg-bg-card border border-flixie-purple/30 rounded-xl p-4 text-center space-y-2.5">
                                    <h4 className="font-display font-bold text-white">Unable to access the app?</h4>
                                    <p className="text-text-secondary leading-relaxed">Email us from your registered address and include your Flixie username. Never include your password.</p>
                                    <a
                                      href="mailto:flixieadmin@gmail.com?subject=Flixie%20account%20deletion%20request"
                                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-flixie-purple/15 hover:bg-flixie-purple/25 border border-flixie-purple/40 text-flixie-light font-semibold rounded-xl transition-colors"
                                    >
                                      <Mail className="h-4 w-4" /> flixieadmin@gmail.com
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <p className="px-5 py-4 text-text-secondary text-xs sm:text-sm leading-relaxed">
                                  {item.answer}
                                </p>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Support Callout Card */}
        {/* <div className="max-w-3xl mx-auto mt-16 bg-gradient-to-r from-bg-card to-bg-darkest border border-border-custom p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-flixie-teal/15 text-flixie-teal rounded-xl flex-shrink-0">
              <Info className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-white font-bold text-sm">Still have questions?</h4>
              <p className="text-text-secondary text-xs leading-relaxed max-w-md">
                Our support desk is operational 24/7. Reach out to report technical bugs, recommend features, or seek account deletion.
              </p>
            </div>
          </div>
          <a
            href="#contact"
            className="px-5 py-2.5 bg-flixie-purple/15 hover:bg-flixie-purple/25 border border-flixie-purple/40 hover:border-flixie-purple text-flixie-light hover:text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 flex-shrink-0"
          >
            Contact Support
          </a>
        </div> */}
      </section>
    </div>
  );
}
