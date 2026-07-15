/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, ChevronUp, Search, Info, MessageSquare, ShieldAlert } from 'lucide-react';
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
          answer: 'While you can browse trending movies and search titles anonymously, registration is required to save watchlists, compile a personal watched history, write reviews, add friends, and participate in social watch invitations. Registration is free and takes less than a minute.'
        },
        {
          id: 'data-source',
          question: 'Where does Flixie’s data come from?',
          answer: 'Flixie leverages the industry-leading TMDB API for standard metadata, movie details, synopses, ratings, and cast structures. For streaming availability, we rely on JustWatch data. Note: Flixie is not directly endorsed or certified by TMDB or JustWatch.'
        },
        {
          id: 'content-updates',
          question: 'How frequently is content updated?',
          answer: 'Our database syncs with TMDB and JustWatch several times throughout the day, ensuring that release calendars, cast information, user metrics, and streaming availability on major channels are kept accurate and up-to-date.'
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
          answer: 'Navigate to the social Search tab, enter your friend’s unique Flixie User ID, email, or username, and tap "Send Friend Request". Once they accept, you’ll be able to view each other’s watched histories and active watchlists.'
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
          answer: 'On any movie details sheet, you will see a 5-star rating matrix. Simply tap the stars corresponding to your rating (supports half-star adjustments). Your updated average rating will then be calculated and saved immediately.'
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
                              <p className="px-5 py-4 text-text-secondary text-xs sm:text-sm leading-relaxed">
                                {item.answer}
                              </p>
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
        <div className="max-w-3xl mx-auto mt-16 bg-gradient-to-r from-bg-card to-bg-darkest border border-border-custom p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
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
        </div>
      </section>
    </div>
  );
}
