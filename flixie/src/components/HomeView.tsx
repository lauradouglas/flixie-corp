/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Tv, 
  Bookmark, 
  CheckCircle, 
  Heart, 
  Star, 
  Users, 
  Send, 
  ArrowRight, 
  Download, 
  ChevronRight, 
  Smartphone, 
  Clock, 
  Film, 
  Check, 
  Plus,
  Home,
  Search,
  Bell,
  UserRound,
  Settings,
  CalendarDays,
  Play,
  MessageCircle
} from 'lucide-react';
import { PageId, FeatureItem } from '../types';
// @ts-ignore
import cinemaGlow from '../assets/images/flixie_cinema_glow_1784148911237.jpg';
// @ts-ignore
import flixieLogo from '../assets/brand/flixie_text_1024.png';

interface HomeViewProps {
  setCurrentPage: (page: PageId) => void;
  onDownloadClick: () => void;
}

export default function HomeView({ setCurrentPage, onDownloadClick }: HomeViewProps) {
  // Mock Swipe state for the interactive CSS smartphone mockup
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [watchlistCount, setWatchlistCount] = useState(3);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasAddedToWatchlist, setHasAddedToWatchlist] = useState(false);

  const mockMoviesForMockup = [
    {
      title: 'Echoes of Orion',
      genre: 'Sci-Fi • Epic Space',
      duration: '2h 14m',
      rating: '8.7',
      synopsis: 'A deep-space surveyor discovers an ancient signal on a dying planet that could save humanity, but uncovers a terrifying secret instead.',
      color: 'from-[#2e1d6e] to-[#0d072a]',
      accentColor: '#9B6BFF'
    },
    {
      title: 'Midnight Café',
      genre: 'Indie • Drama • Romance',
      duration: '1h 48m',
      rating: '7.9',
      synopsis: 'Two strangers with contrasting philosophies meet in a 24-hour Paris café and engage in an intense, night-long dialogue that transforms their lives.',
      color: 'from-[#5a2e37] to-[#1c0e12]',
      accentColor: '#F1A77A'
    },
    {
      title: 'Chronicles of Neon',
      genre: 'Cyberpunk • Action Thriller',
      duration: '2h 05m',
      rating: '8.4',
      synopsis: 'In a dystopian city ruled by digital minds, an outlaw archivist must smuggle the last physical hard drive before corporate syndicates erase history.',
      color: 'from-[#0e4e52] to-[#041618]',
      accentColor: '#00D1C7'
    }
  ];

  const activeMovie = mockMoviesForMockup[currentMovieIndex];

  const handleNextMovie = () => {
    setCurrentMovieIndex((prev) => (prev + 1) % mockMoviesForMockup.length);
    setHasLiked(false);
    setHasAddedToWatchlist(false);
  };

  const handleLike = () => {
    setHasLiked(!hasLiked);
  };

  const handleToggleWatchlist = () => {
    if (!hasAddedToWatchlist) {
      setWatchlistCount(prev => prev + 1);
      setHasAddedToWatchlist(true);
    } else {
      setWatchlistCount(prev => prev - 1);
      setHasAddedToWatchlist(false);
    }
  };

  const coreFeatures: FeatureItem[] = [
    {
      id: 'discover',
      title: 'Discover Movies & TV Shows',
      description: 'Explore curated movie collections, popular trending titles, and hidden indie treasures spanning all genres.',
      iconName: 'Tv',
      colorClass: 'text-flixie-teal bg-flixie-teal/10'
    },
    {
      id: 'watchlist',
      title: 'Build a Personal Watchlist',
      description: 'Save films you intend to watch. Organise and filter them dynamically based on platform, duration, or genre.',
      iconName: 'Bookmark',
      colorClass: 'text-flixie-purple bg-flixie-purple/10'
    },
    {
      id: 'tracker',
      title: 'Track Watched Titles',
      description: 'Maintain a complete visual diary of your cinematic journey, sorted chronologically with custom dates.',
      iconName: 'CheckCircle',
      colorClass: 'text-status-success bg-status-success/10'
    },
    {
      id: 'favourites',
      title: 'Save Favourites',
      description: 'Pin your all-time masterpieces to your profile page to showcase your distinct tastes to your community.',
      iconName: 'Heart',
      colorClass: 'text-flixie-peach bg-flixie-peach/10'
    },
    {
      id: 'rate',
      title: 'Rate and Review Movies',
      description: 'Write authentic, spoiler-free reviews and give star ratings. Share your perspective with film circles.',
      iconName: 'Star',
      colorClass: 'text-status-warning bg-status-warning/10'
    },
    {
      id: 'connect',
      title: 'Connect with Friends',
      description: 'Follow friends and family to see their real-time watch history, written reviews, and active recommendations.',
      iconName: 'Users',
      colorClass: 'text-flixie-light bg-flixie-light/10'
    },
    {
      id: 'invite',
      title: 'Invite to Watch Together',
      description: 'Send elegant Watch Invitations for virtual or in-person cinema meetups. Vote on movie choices collaboratively.',
      iconName: 'Send',
      colorClass: 'text-flixie-purple bg-flixie-purple/15'
    },
    {
      id: 'recommend',
      title: 'Personalised Recommendations',
      description: 'Receive custom recommendations powered by our shared preference matching engine with your friends.',
      iconName: 'Sparkles',
      colorClass: 'text-flixie-teal bg-flixie-teal/15'
    }
  ];

  // Helper to render lucide icon dynamically
  const renderIcon = (name: string) => {
    switch (name) {
      case 'Tv': return <Tv className="h-6 w-6" />;
      case 'Bookmark': return <Bookmark className="h-6 w-6" />;
      case 'CheckCircle': return <CheckCircle className="h-6 w-6" />;
      case 'Heart': return <Heart className="h-6 w-6" />;
      case 'Star': return <Star className="h-6 w-6" />;
      case 'Users': return <Users className="h-6 w-6" />;
      case 'Send': return <Send className="h-6 w-6" />;
      case 'Sparkles': return <Sparkles className="h-6 w-6" />;
      default: return <Sparkles className="h-6 w-6" />;
    }
  };

  return (
    <div id="home-view" className="relative overflow-hidden pt-16">
      {/* Cinematic Hero Background */}
      <div className="absolute top-0 left-0 right-0 h-[650px] overflow-hidden -z-10 select-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-main/80 to-bg-main" />
        <img
          src={cinemaGlow}
          alt="Cinematic Background Glow"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-35 scale-105 filter blur-xs"
        />
        {/* Subtle radial purple flare */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-flixie-purple/10 rounded-full blur-[140px] pointer-events-none" />
      </div>

      {/* Hero Content Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:py-24 lg:py-32" id="hero-section">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Text */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-flixie-purple/15 border border-flixie-purple/30 rounded-full text-xs font-semibold text-flixie-purple tracking-wide"
            >
              <Sparkles className="h-3.5 w-3.5 text-flixie-teal animate-pulse" />
              Introducing Flixie v1.0 • Social Movie Discovery
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-tight text-white"
            >
              Discover movies. <br />
              <span className="bg-gradient-to-r from-flixie-purple via-flixie-light to-flixie-teal bg-clip-text text-transparent">
                Share the experience.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-text-secondary text-base sm:text-lg lg:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Discover your next favourite movie with Flixie. Build your watchlist, track what you’ve watched, rate your favourites, and invite friends to watch together—all in one place. Spend less time scrolling and more time enjoying great films.
            </motion.p>

            {/* Hero CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4"
            >
              <button
                onClick={onDownloadClick}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-flixie-purple to-flixie-deep text-white font-bold rounded-xl hover:brightness-110 active:scale-98 transition-all shadow-xl shadow-flixie-purple/30 hover:shadow-flixie-purple/40 flex items-center justify-center gap-2 cursor-pointer"
                id="hero-download-btn"
              >
                <Download className="h-5 w-5" />
                Download App Free
              </button>
              
              <button
                onClick={() => {
                  setCurrentPage('features');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-6 py-4 bg-bg-card hover:bg-bg-elevated border border-border-custom hover:border-flixie-purple/50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                id="hero-features-btn"
              >
                Explore Features
                <ArrowRight className="h-4 w-4 text-text-muted group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            {/* Traction stats are intentionally hidden until Flixie has verified public metrics.
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="grid grid-cols-3 gap-4 pt-8 border-t border-border-custom max-w-md mx-auto lg:mx-0"
            >
              <div>
                <div className="text-xl sm:text-2xl font-bold font-display text-white">4.9/5</div>
                <div className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">App Rating</div>
              </div>
              <div className="border-x border-border-custom px-4">
                <div className="text-xl sm:text-2xl font-bold font-display text-flixie-teal">12M+</div>
                <div className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">Movies Rated</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-display text-flixie-purple">250K+</div>
                <div className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">Film Circles</div>
              </div>
            </motion.div>
            */}
          </div>

          {/* Hero Right - Interactive CSS Smartphone Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="relative w-72 sm:w-80 h-[580px] bg-bg-darkest rounded-[40px] p-3 shadow-[0_0_50px_rgba(155,107,255,0.15)] border-4 border-border-custom"
              id="interactive-mockup"
            >
              {/* Speaker & Sensor Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-32 bg-bg-darkest rounded-b-2xl z-30 flex items-center justify-center">
                <div className="w-12 h-1 bg-neutral-800 rounded-full mb-1" />
              </div>

              {/* A compact recreation of the real Flixie home screen */}
              <div className="relative w-full h-full rounded-[30px] overflow-hidden bg-gradient-to-b from-bg-card via-bg-main to-bg-darkest flex flex-col">
                <div className="pt-6 px-4 pb-2 flex items-center justify-between z-20">
                  <span className="relative block h-7 w-20 overflow-hidden">
                    <img src={flixieLogo} alt="Flixie" className="absolute w-24 max-w-none -left-1.5 -top-[34px]" />
                  </span>
                  <div className="flex items-center gap-3 text-text-secondary">
                    <Search className="h-4 w-4" />
                    <span className="relative"><Bell className="h-4 w-4" /><span className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-flixie-peach" /></span>
                  </div>
                </div>

                <div className="flex-1 px-4 pb-2 overflow-hidden">
                  <p className="text-[10px] text-text-muted mt-1">Good evening</p>
                  <h3 className="text-base font-extrabold text-white">What are we watching?</h3>

                  <div className="grid grid-cols-4 gap-2 mt-3 text-center">
                    {[
                      [Search, 'Search'], [Bookmark, 'Watchlist'], [Users, 'Friends'], [MessageCircle, 'Requests']
                    ].map(([Icon, label]) => (
                      <div key={label as string} className="flex flex-col items-center gap-1 text-[8px] text-text-secondary">
                        <span className="h-8 w-8 rounded-xl bg-bg-elevated border border-white/5 flex items-center justify-center text-flixie-purple"><Icon className="h-3.5 w-3.5" /></span>
                        {label as string}
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 rounded-xl bg-bg-card border border-flixie-purple/40 p-2.5 flex items-center gap-2">
                    <span className="h-8 w-8 shrink-0 rounded-lg bg-flixie-purple/15 text-flixie-purple flex items-center justify-center"><CalendarDays className="h-4 w-4" /></span>
                    <span className="min-w-0 flex-1"><strong className="block text-[11px] text-white">Watch plans</strong><span className="block text-[8px] text-text-secondary truncate">2 upcoming watches with friends</span></span>
                    <ChevronRight className="h-4 w-4 text-text-secondary" />
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <strong className="text-[11px] text-white">Featured for you</strong>
                    <button onClick={handleNextMovie} className="text-[8px] text-flixie-purple cursor-pointer">Next</button>
                  </div>

                  <div className="mt-2 h-[218px] rounded-2xl overflow-hidden border border-white/10 relative shadow-xl">
                    <img src={cinemaGlow} alt="" className="absolute inset-0 w-full h-full object-cover transition-all duration-500" style={{ filter: `hue-rotate(${currentMovieIndex * 45}deg)` }} />
                    <div className={`absolute inset-0 bg-gradient-to-t ${activeMovie.color} opacity-55`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
                    <span className="absolute top-3 right-3 bg-black/70 border border-status-warning/50 rounded-full px-2 py-1 text-[9px] font-bold text-status-warning flex items-center gap-1"><Star className="h-2.5 w-2.5 fill-current" />{activeMovie.rating}</span>
                    <div className="absolute left-3 right-3 bottom-3">
                      <h4 className="text-base font-extrabold text-white">{activeMovie.title}</h4>
                      <p className="text-[9px] text-text-secondary">{activeMovie.genre} • {activeMovie.duration}</p>
                      <div className="flex gap-2 mt-2">
                        <button onClick={handleToggleWatchlist} aria-label="Toggle watchlist" className={`h-8 w-8 rounded-full flex items-center justify-center border cursor-pointer ${hasAddedToWatchlist ? 'bg-flixie-purple border-flixie-purple text-white' : 'bg-black/60 border-white/20 text-flixie-purple'}`}>{hasAddedToWatchlist ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}</button>
                        <button onClick={handleLike} aria-label="Toggle favourite" className={`h-8 w-8 rounded-full flex items-center justify-center border cursor-pointer ${hasLiked ? 'bg-status-error border-status-error text-white' : 'bg-black/60 border-white/20 text-white'}`}><Heart className={`h-4 w-4 ${hasLiked ? 'fill-current' : ''}`} /></button>
                        <button onClick={handleNextMovie} className="ml-auto px-3 rounded-full bg-flixie-purple text-white text-[9px] font-bold flex items-center gap-1 cursor-pointer"><Play className="h-3 w-3 fill-current" /> Explore</button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-1 mt-2">{mockMoviesForMockup.map((_, index) => <span key={index} className={`h-1 rounded-full transition-all ${index === currentMovieIndex ? 'w-4 bg-flixie-purple' : 'w-1 bg-text-muted/50'}`} />)}</div>
                </div>

                <div className="h-14 px-2 bg-bg-nav/95 border-t border-white/5 grid grid-cols-5 items-center">
                  {[[Home, 'Home'], [Bookmark, 'Watchlist'], [Users, 'Social'], [UserRound, 'Profile'], [Settings, 'Settings']].map(([Icon, label], index) => (
                    <div key={label as string} className={`flex flex-col items-center gap-0.5 text-[7px] ${index === 0 ? 'text-flixie-purple' : 'text-text-muted'}`}><Icon className={`h-3.5 w-3.5 ${index === 0 ? 'fill-current' : ''}`} />{label as string}</div>
                  ))}
                </div>
              </div>

              {/* Float badge 1 */}
              <div className="absolute -left-10 top-20 bg-bg-card border border-border-custom p-2.5 rounded-xl flex items-center gap-2 shadow-2xl backdrop-blur-md bg-opacity-95 z-30">
                <div className="p-1.5 bg-flixie-purple/15 rounded-lg text-flixie-purple">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] text-text-muted">Watch request</div>
                  <div className="text-xs font-bold text-white">Movie night with Leo</div>
                </div>
              </div>

              {/* Float badge 2 */}
              <div className="absolute -right-12 bottom-32 bg-bg-card border border-border-custom p-2.5 rounded-xl flex items-center gap-2 shadow-2xl backdrop-blur-md bg-opacity-95 z-30">
                <div className="p-1.5 bg-flixie-teal/15 rounded-lg text-flixie-teal">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] text-text-muted">Your friends are watching</div>
                  <div className="text-xs font-bold text-white">See latest activity</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature section covering user requirements */}
      <section className="bg-bg-darkest py-20 border-y border-border-custom" id="features-grid-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              A Complete Social Movie Ecosystem
            </h2>
            <p className="text-text-secondary text-base sm:text-lg">
              Flixie transforms cinema watching from a passive solo routine into a vibrant, communal playground. Discover why thousands of film buffs love Flixie.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreFeatures.map((feat) => (
              <div
                key={feat.id}
                className="bg-bg-card border border-border-custom hover:border-flixie-purple/40 p-6 rounded-2xl hover:shadow-[0_4px_25px_rgba(155,107,255,0.06)] transition-all flex flex-col justify-between group"
                id={`feature-card-${feat.id}`}
              >
                <div className="space-y-4">
                  <div className={`p-3.5 rounded-xl w-fit ${feat.colorClass} group-hover:scale-105 transition-transform`}>
                    {renderIcon(feat.iconName)}
                  </div>
                  <h3 className="font-display font-bold text-lg text-white tracking-wide">
                    {feat.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {feat.description}
                  </p>
                </div>
                <div className="pt-4 flex items-center text-xs text-flixie-purple font-semibold hover:text-flixie-light transition-colors cursor-pointer group-hover:gap-1.5 gap-1"
                  onClick={() => {
                    setCurrentPage('features');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Learn details <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* "How Flixie Works" section */}
      <section className="py-20 bg-bg-main" id="how-it-works-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              Get Started In Minutes
            </h2>
            <p className="text-text-secondary text-base">
              Setting up your profile on Flixie is fast, fun, and immediately syncs you to your friends' watch behaviors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting decorative dotted vector line (desktop only) */}
            <div className="hidden md:block absolute top-1/4 left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-border-custom z-0" />

            {/* Step 1 */}
            <div className="bg-bg-card border border-border-custom p-8 rounded-2xl relative z-10 flex flex-col items-center text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-flixie-purple text-white font-display font-bold text-lg flex items-center justify-center shadow-lg shadow-flixie-purple/25">
                1
              </div>
              <h3 className="font-display font-bold text-lg text-white">Install & Register</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Download the companion application on iOS or Android. Register a secure account, select your preferred genres, and get recommendations instantly.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-bg-card border border-border-custom p-8 rounded-2xl relative z-10 flex flex-col items-center text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-flixie-teal text-bg-darkest font-display font-bold text-lg flex items-center justify-center shadow-lg shadow-flixie-teal/25">
                2
              </div>
              <h3 className="font-display font-bold text-lg text-white">Add Friends & Sync</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Find people by their Flixie username, connect with friends, and see the watchlists, favourites, reviews, and activity they choose to share.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-bg-card border border-border-custom p-8 rounded-2xl relative z-10 flex flex-col items-center text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-flixie-peach text-bg-darkest font-display font-bold text-lg flex items-center justify-center shadow-lg shadow-flixie-peach/25">
                3
              </div>
              <h3 className="font-display font-bold text-lg text-white">Rate, Request, Watch</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Log watched movies, give ratings, compile collections, and tap "Watch Invitation" to coordinate movie meetups with friends with real sync times.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social movie-watching section */}
      <section className="bg-bg-darkest py-20 border-t border-border-custom" id="social-watching-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual Chat / Request Dialog Container on Left */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="bg-bg-card border border-border-custom rounded-2xl p-6 shadow-2xl relative max-w-sm mx-auto">
                {/* Visual Header */}
                <div className="flex items-center gap-3 border-b border-border-custom pb-4 mb-4">
                  <div className="p-2 bg-flixie-purple/15 text-flixie-purple rounded-xl">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Watch Invitation Party</h4>
                    <p className="text-[10px] text-flixie-teal font-mono">Sync Room #4010</p>
                  </div>
                </div>

                {/* Simulated Chat Bubble 1 */}
                <div className="space-y-4 text-xs">
                  <div className="flex gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-flixie-purple text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                      LE
                    </div>
                    <div className="bg-bg-elevated p-3 rounded-xl rounded-tl-none border border-border-custom max-w-[80%] text-text-secondary leading-relaxed">
                      Hey! Any movie recommendations for tonight? Something fast-paced maybe?
                    </div>
                  </div>

                  {/* Simulated App matching block */}
                  <div className="ml-9 p-3 bg-flixie-purple/10 border border-flixie-purple/30 rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5 text-flixie-purple text-[10px] font-bold uppercase tracking-wider">
                      <Sparkles className="h-3 w-3 text-flixie-teal" /> 97% Social Match
                    </div>
                    <p className="text-white font-bold font-display">Chronicles of Neon</p>
                    <p className="text-text-muted text-[10px] line-clamp-1">Both you and Leo have this in your Watchlist!</p>
                  </div>

                  {/* Simulated Chat Bubble 2 */}
                  <div className="flex gap-2.5 justify-end">
                    <div className="bg-flixie-purple/20 p-3 rounded-xl rounded-tr-none border border-flixie-purple/30 max-w-[80%] text-white leading-relaxed">
                      "Chronicles of Neon" looks incredible! I just sent a Watch Invitation to you for 8:30 PM.
                    </div>
                    <div className="h-7 w-7 rounded-full bg-flixie-teal text-bg-darkest flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                      YOU
                    </div>
                  </div>

                  {/* Visual Watch Request Invite Card */}
                  <div className="ml-9 border border-border-custom bg-bg-darkest p-3.5 rounded-xl space-y-3 shadow-inner">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-flixie-purple" />
                        <span className="font-semibold text-white">Watch Invitation</span>
                      </div>
                      <span className="text-[9px] bg-status-warning/20 text-status-warning px-1.5 py-0.5 rounded font-bold uppercase">
                        Pending
                      </span>
                    </div>
                    <div className="text-[11px] text-text-secondary">
                      <div className="font-bold text-white">Chronicles of Neon</div>
                      <div className="flex items-center gap-1 mt-1 text-text-muted">
                        <Clock className="h-3 w-3" /> Today at 8:30 PM (Virtual Invite)
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex-1 py-1.5 bg-flixie-purple hover:bg-flixie-deep text-white font-semibold rounded-lg text-[10px] text-center transition-all">
                        Accept Request
                      </button>
                      <button className="px-3 py-1.5 bg-bg-card hover:bg-white/5 border border-border-custom text-text-secondary rounded-lg text-[10px] text-center transition-all">
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Explanatory text on Right */}
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight leading-tight">
                Collaborative Movie Coordination. No Spoilers, All Fun.
              </h2>
              <p className="text-text-secondary text-base leading-relaxed">
                Tired of the constant back-and-forth deciding what to watch? Flixie features an automated <strong>compatibility match engine</strong>. By scanning what movies overlap on your social circles' watchlists, we instantly surface titles with high compatibility ratings.
              </p>
              
              <ul className="space-y-3.5 text-sm">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 bg-flixie-purple/15 text-flixie-purple rounded-lg">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <strong className="text-white">Active Social Circles:</strong> Group friends into circles (e.g. "Horror Enthusiasts", "Family Movie Night") for segmented, targeted notifications.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 bg-flixie-teal/15 text-flixie-teal rounded-lg">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <strong className="text-white">Interactive Voting Polls:</strong> Can't agree on a title? Drop up to 4 candidate movies in a circular friend chat room and let the votes settle the selection.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 bg-flixie-peach/15 text-flixie-peach rounded-lg">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <strong className="text-white">Push Reminders:</strong> Keep everyone in sync. Receive standard device notifications when a watch invitation is accepted or when a movie is starting.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final registration/download Call To Action section */}
      <section className="relative overflow-hidden py-24 bg-gradient-to-br from-bg-card to-bg-darkest" id="cta-bottom-section">
        {/* Decorative backdrop elements */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-flixie-purple/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-flixie-teal/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
            Elevate Your Cinematic Experience Today
          </h2>
          <p className="text-text-secondary text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Join thousands of active movie lovers curating watchlists, writing spoiler-free reviews, and matching films with friends on Flixie. Free to download, ad-free experience.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onDownloadClick}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-flixie-purple to-flixie-deep text-white font-bold rounded-xl hover:brightness-110 shadow-xl shadow-flixie-purple/30 hover:shadow-flixie-purple/45 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Download className="h-5 w-5" />
              Download Flixie App
            </button>
            <button
              onClick={() => {
                setCurrentPage('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 py-4 bg-transparent hover:bg-white/5 border border-border-custom hover:border-flixie-purple text-text-secondary hover:text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Contact Support
            </button>
          </div>

          <div className="text-xs text-text-muted pt-4 font-mono">
            Requires iOS 15.0+ or Android 10+ • Regular updates monthly
          </div>
        </div>
      </section>
    </div>
  );
}
