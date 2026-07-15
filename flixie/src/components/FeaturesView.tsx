/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
  Download, 
  Search, 
  Filter, 
  Share2, 
  Calendar, 
  ThumbsUp, 
  Lock 
} from 'lucide-react';

interface FeaturesViewProps {
  onDownloadClick: () => void;
}

export default function FeaturesView({ onDownloadClick }: FeaturesViewProps) {
  return (
    <div id="features-view" className="relative overflow-hidden pt-24 pb-16">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-20 left-10 w-[300px] h-[300px] bg-flixie-purple/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-40 right-10 w-[400px] h-[400px] bg-flixie-teal/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 text-center">
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-white tracking-tight">
          Crafted to Elevate <br />
          <span className="bg-gradient-to-r from-flixie-purple via-flixie-light to-flixie-teal bg-clip-text text-transparent">
            Your Cinema Discovery
          </span>
        </h1>
        <p className="text-text-secondary text-base sm:text-lg max-w-2xl mx-auto mt-4 leading-relaxed">
          Flixie replaces chaotic notebooks, infinite bookmarks, and messy group chats with a single cohesive, high-performance visual dashboard designed specifically for film enthusiasts.
        </p>
      </section>

      {/* Alternating Feature Sections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 md:space-y-36">
        
        {/* Feature 1: Discover & JustWatch Integration */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center" id="feature-detail-discover">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-flixie-teal/10 border border-flixie-teal/30 rounded-full text-xs font-semibold text-flixie-teal">
              <Tv className="h-3.5 w-3.5" /> Curated Discovery Engine
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Discover Content Tailored To Your Mood and Provider
            </h2>
            <p className="text-text-secondary text-base leading-relaxed">
              No more scrolling through five different streaming services to decide what to watch. Flixie searches and aggregates a vast index of movies and television series, detailing release years, cast listings, and synopses.
            </p>
            
            <div className="bg-bg-card border border-border-custom p-4 rounded-xl flex items-center gap-3">
              <span className="text-flixie-teal font-bold font-mono text-xs">JUSTWATCH POWERED</span>
              <div className="h-4 w-px bg-border-custom" />
              <p className="text-xs text-text-muted leading-relaxed">
                Check instant streaming availability, rental prices, and subscription channels (Netflix, Prime, Disney+, etc.) directly within the app, kept current daily.
              </p>
            </div>

            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5 text-text-secondary">
                <div className="h-1.5 w-1.5 rounded-full bg-flixie-teal" />
                Advanced search with genre and actor filters
              </li>
              <li className="flex items-center gap-2.5 text-text-secondary">
                <div className="h-1.5 w-1.5 rounded-full bg-flixie-teal" />
                Personalised mood-based collection lists
              </li>
              <li className="flex items-center gap-2.5 text-text-secondary">
                <div className="h-1.5 w-1.5 rounded-full bg-flixie-teal" />
                JustWatch direct deeplinks to official stream sites
              </li>
            </ul>
          </div>

          {/* Feature 1 Visual Card Placeholder */}
          <div className="lg:col-span-6 bg-bg-card border border-border-custom rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-flixie-teal/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-border-custom pb-4 mb-6">
              <div className="flex items-center gap-2 bg-bg-elevated px-3 py-1.5 rounded-lg border border-border-custom">
                <Search className="h-4 w-4 text-flixie-teal" />
                <span className="text-xs text-text-secondary font-mono">Query: "Sci-Fi Thriller"</span>
              </div>
              <div className="flex gap-1">
                <span className="text-[10px] bg-flixie-purple/20 text-flixie-purple px-2 py-0.5 rounded font-bold uppercase">Netflix</span>
                <span className="text-[10px] bg-flixie-teal/20 text-flixie-teal px-2 py-0.5 rounded font-bold uppercase">Prime</span>
              </div>
            </div>

            {/* Simulated movie lists with JustWatch tags */}
            <div className="space-y-3">
              <div className="p-3 bg-bg-elevated border border-border-custom rounded-xl flex items-center justify-between hover:border-flixie-teal/50 transition-colors">
                <div>
                  <h4 className="text-sm font-bold text-white">Echoes of Orion</h4>
                  <p className="text-xs text-text-muted">Sci-Fi • 2024 • 8.7 ★</p>
                </div>
                <span className="text-xs text-flixie-teal font-bold bg-flixie-teal/10 px-2 py-1 rounded-lg">Stream Now</span>
              </div>

              <div className="p-3 bg-bg-elevated border border-border-custom rounded-xl flex items-center justify-between hover:border-flixie-teal/50 transition-colors">
                <div>
                  <h4 className="text-sm font-bold text-white">The Nebula Horizon</h4>
                  <p className="text-xs text-text-muted">Sci-Fi • 2023 • 7.5 ★</p>
                </div>
                <span className="text-xs text-text-secondary bg-white/5 px-2 py-1 rounded-lg">Rent / Buy</span>
              </div>

              <div className="p-3 bg-bg-elevated border border-border-custom rounded-xl flex items-center justify-between hover:border-flixie-teal/50 transition-colors">
                <div>
                  <h4 className="text-sm font-bold text-white">Sub-Zero Drift</h4>
                  <p className="text-xs text-text-muted">Thriller • 2025 • 8.1 ★</p>
                </div>
                <span className="text-xs text-flixie-teal font-bold bg-flixie-teal/10 px-2 py-1 rounded-lg">Stream Now</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Watchlist & Tracking */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center" id="feature-detail-watchlist">
          <div className="lg:col-span-6 order-2 lg:order-1 bg-bg-card border border-border-custom rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -left-20 -top-20 w-80 h-80 bg-flixie-purple/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-border-custom pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Bookmark className="h-4.5 w-4.5 text-flixie-purple" />
                <h4 className="text-sm font-bold text-white">My Watchlist (14)</h4>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <Filter className="h-3.5 w-3.5" /> Sort: Added Date
              </div>
            </div>

            {/* Custom Interactive Checklist items representation */}
            <div className="space-y-3">
              <div className="p-3.5 bg-bg-elevated/70 border border-border-custom rounded-xl flex items-center gap-3">
                <div className="h-5 w-5 rounded-md border-2 border-flixie-purple flex items-center justify-center cursor-pointer hover:bg-flixie-purple/10">
                  {/* Empty check for watchlist item */}
                </div>
                <div className="flex-1">
                  <h5 className="text-xs font-bold text-white">Midnight Café</h5>
                  <p className="text-[10px] text-text-muted">Drama • 1h 48m • Added 2d ago</p>
                </div>
                <span className="text-[10px] bg-flixie-peach/10 text-flixie-peach font-semibold px-2 py-0.5 rounded-full">High Priority</span>
              </div>

              <div className="p-3.5 bg-flixie-purple/5 border border-flixie-purple/30 rounded-xl flex items-center gap-3">
                <div className="h-5 w-5 rounded-md bg-flixie-purple text-white flex items-center justify-center cursor-pointer">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h5 className="text-xs font-bold text-text-secondary line-through">Echoes of Orion</h5>
                  <p className="text-[10px] text-text-muted">Marked as Watched • Yesterday</p>
                </div>
                <span className="text-[10px] bg-status-success/10 text-status-success font-semibold px-2 py-0.5 rounded-full">Watched</span>
              </div>

              <div className="p-3.5 bg-bg-elevated/70 border border-border-custom rounded-xl flex items-center gap-3">
                <div className="h-5 w-5 rounded-md border-2 border-border-custom flex items-center justify-center cursor-pointer">
                  {/* Empty */}
                </div>
                <div className="flex-1">
                  <h5 className="text-xs font-bold text-white">Velocity</h5>
                  <p className="text-[10px] text-text-muted">Action • 2h 10m • Added 1w ago</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-flixie-purple/15 border border-flixie-purple/30 rounded-full text-xs font-semibold text-flixie-purple">
              <Bookmark className="h-3.5 w-3.5" /> List Curation
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Compile Custom Watchlists & Chronological History
            </h2>
            <p className="text-text-secondary text-base leading-relaxed">
              Curate your list of movies to watch next and check them off easily. Flixie automatically logs your completions, maintaining a chronological watched history that you can organize, review, and export.
            </p>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-2.5">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-flixie-purple" />
                <p className="text-text-secondary">
                  <strong className="text-white">Smart Watchlist:</strong> Filters items based on running duration (e.g., "Under 90 minutes") to fit your exact schedules.
                </p>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-flixie-purple" />
                <p className="text-text-secondary">
                  <strong className="text-white">Chronological Diary:</strong> Visualise your month-by-month movie achievements, genres watched, and statistics.
                </p>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-flixie-purple" />
                <p className="text-text-secondary">
                  <strong className="text-white">Custom Tags:</strong> Organise watchlists using dynamic folders (e.g. "Halloween Nights", "Oscar Nominees").
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Feature 3: Favourites & Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center" id="feature-detail-social">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-flixie-peach/15 border border-flixie-peach/30 rounded-full text-xs font-semibold text-flixie-peach">
              <Heart className="h-3.5 w-3.5" /> Self Expression
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Express Your Tastes: Favourites, Star Ratings & Custom Reviews
            </h2>
            <p className="text-text-secondary text-base leading-relaxed">
              Your profile represents your unique movie identity. Pin your ultimate all-time masterpieces, rate movies out of five stars, and publish descriptive, spoiler-free reviews to help your community find gems.
            </p>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-2.5">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-flixie-peach" />
                <p className="text-text-secondary">
                  <strong className="text-white">Pin Favourites:</strong> Choose your top 4 all-time favourite films to display prominently as a header showcase on your social profile.
                </p>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-flixie-peach" />
                <p className="text-text-secondary">
                  <strong className="text-white">Spoiler Protection:</strong> Hide sensitive paragraphs behind a hover-to-reveal "Spoiler Warning" badge.
                </p>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-flixie-peach" />
                <p className="text-text-secondary">
                  <strong className="text-white">Review Interactions:</strong> Friends can like, comment, or ask questions on your reviews to start a dialogue.
                </p>
              </li>
            </ul>
          </div>

          {/* Feature 3 Visual Card Placeholder */}
          <div className="lg:col-span-6 bg-bg-card border border-border-custom rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-flixie-peach/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-border-custom pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Heart className="h-4.5 w-4.5 text-flixie-peach fill-current" />
                <h4 className="text-sm font-bold text-white">Your Showcase Favourite</h4>
              </div>
              <span className="text-xs text-status-warning flex items-center gap-1 font-bold">
                <Star className="h-3 w-3 fill-current" /> 5.0 Rated
              </span>
            </div>

            {/* Simulated Published Review card inside app */}
            <div className="bg-bg-elevated p-4 rounded-xl border border-border-custom space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-flixie-peach text-bg-darkest flex items-center justify-center font-bold text-xs">
                    LA
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Laura Douglas</h5>
                    <p className="text-[9px] text-text-muted">Reviewed yesterday</p>
                  </div>
                </div>
                <div className="flex text-status-warning">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-current" />
                  ))}
                </div>
              </div>

              <div className="text-xs text-text-secondary leading-relaxed">
                <p className="font-bold text-white mb-1">“Echoes of Orion is a visual masterpiece!”</p>
                The cinematography of the third act was absolute bliss. The score stayed in my head for hours after the credits rolled. Highly recommended!
              </div>

              {/* Review metrics */}
              <div className="flex items-center gap-4 text-[10px] text-text-muted border-t border-border-custom/50 pt-2.5">
                <span className="flex items-center gap-1 hover:text-white cursor-pointer">
                  <ThumbsUp className="h-3 w-3" /> 18 Likes
                </span>
                <span className="flex items-center gap-1 hover:text-white cursor-pointer">
                  <Share2 className="h-3 w-3" /> Share
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 4: Friends & Requests (Invitations) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center" id="feature-detail-circles">
          {/* Feature 4 Visual Card Placeholder */}
          <div className="lg:col-span-6 order-2 lg:order-1 bg-bg-card border border-border-custom rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-flixie-purple/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-border-custom pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-flixie-purple" />
                <h4 className="text-sm font-bold text-white">Active Social Requests</h4>
              </div>
              <span className="text-[10px] bg-flixie-purple/20 text-flixie-purple px-2 py-0.5 rounded font-bold font-mono">
                3 Pending
              </span>
            </div>

            {/* List of custom invites and connections */}
            <div className="space-y-3">
              <div className="p-3 bg-bg-elevated border border-border-custom rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-flixie-purple text-white flex items-center justify-center font-bold text-xs">
                    AM
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Austin Miller</h5>
                    <p className="text-[10px] text-text-muted">Wants to connect as Friends</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button className="px-2.5 py-1 bg-flixie-purple hover:bg-flixie-deep text-white font-bold text-[10px] rounded-md transition-all cursor-pointer">
                    Accept
                  </button>
                  <button className="px-2.5 py-1 bg-white/5 border border-border-custom hover:bg-white/10 text-text-secondary text-[10px] rounded-md transition-all cursor-pointer">
                    Ignore
                  </button>
                </div>
              </div>

              <div className="p-3 bg-bg-elevated border border-border-custom rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-flixie-teal text-bg-darkest flex items-center justify-center font-bold text-xs">
                    SO
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Sophia Owens</h5>
                    <p className="text-[10px] text-text-muted">Sent you a Watch Invitation</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button className="px-2.5 py-1 bg-flixie-teal text-bg-darkest font-bold text-[10px] rounded-md hover:brightness-110 transition-all cursor-pointer">
                    Review
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-flixie-purple/15 border border-flixie-purple/30 rounded-full text-xs font-semibold text-flixie-purple">
              <Users className="h-3.5 w-3.5" /> Connections
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Connect With Friends & Coordinate Movie Meetups
            </h2>
            <p className="text-text-secondary text-base leading-relaxed">
              Cinema is meant to be shared. Flixie lets you follow friends, create dedicated film circles, and easily send official watch request invitations. You can schedule virtual watch parties or organize structured offline theater meetups.
            </p>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-2.5">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-flixie-purple" />
                <p className="text-text-secondary">
                  <strong className="text-white">Watch Invitations:</strong> Invite friends to watch specified movies. Set dates, times, and streaming/theater options. Keep tracking records of responses.
                </p>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-flixie-purple" />
                <p className="text-text-secondary">
                  <strong className="text-white">Sent & Received Center:</strong> A structured, dedicated folder where you can view historical sent or pending received movie invitations, accepts, or declines.
                </p>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-flixie-purple" />
                <p className="text-text-secondary">
                  <strong className="text-white">Mutual Matches:</strong> Click "Mutual Match" when looking at a friend's profile to instantly generate a listing of titles you both have in your Watchlists.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Trust, Security & Performance Features Overview */}
      <section className="bg-bg-darkest mt-24 py-16 border-t border-border-custom">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="p-3 bg-flixie-purple/10 border border-flixie-purple/20 text-flixie-purple w-fit rounded-xl">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-lg text-white">Strict Privacy Standards</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                We safeguard your watch habits. You control which reviews, collections, and ratings are public, shared with friends, or completely private.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-flixie-teal/10 border border-flixie-teal/20 text-flixie-teal w-fit rounded-xl">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-lg text-white">Direct Calendar Integration</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Accepted watch invitations can sync directly with Apple Calendar or Google Calendar to ensure you never miss your scheduled movie night.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-flixie-peach/10 border border-flixie-peach/20 text-flixie-peach w-fit rounded-xl">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-lg text-white">Smart Match Engine</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Our recommendation algorithms run strictly on client devices or encrypted secure servers. We never sell your data or movie preferences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Block */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 text-center">
        <div className="bg-gradient-to-br from-bg-card to-bg-darkest border border-border-custom p-8 sm:p-12 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
          {/* Subtle colored glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-flixie-purple/10 rounded-full blur-[80px]" />
          
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            Ready to upgrade your movie routines?
          </h2>
          <p className="text-text-secondary text-base max-w-xl mx-auto leading-relaxed">
            Get the Flixie companion application today and experience collaborative movie watching with friends. Discover movies together.
          </p>
          <div className="pt-2 flex justify-center">
            <button
              onClick={onDownloadClick}
              className="px-8 py-4 bg-gradient-to-r from-flixie-purple to-flixie-deep text-white font-bold rounded-xl hover:brightness-110 shadow-xl shadow-flixie-purple/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="h-5 w-5" />
              Download Free Companion App
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
