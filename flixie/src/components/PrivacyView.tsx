/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Shield } from 'lucide-react';

export default function PrivacyView() {
  return (
    <div id="privacy-view" className="relative overflow-hidden pt-24 pb-16">
      {/* Background radial highlight */}
      <div className="absolute top-24 left-1/3 w-[450px] h-[300px] bg-flixie-purple/5 rounded-full blur-[100px] pointer-events-none" />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
        {/* Header Block */}
        <div className="border-b border-border-custom pb-8 mb-10 space-y-4">
          <div className="flex items-center gap-2.5 text-flixie-purple text-xs font-bold uppercase tracking-wider font-mono">
            <Shield className="h-4 w-4" /> Legal Documents
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-text-muted text-xs font-mono">
            Last Updated: July 26, 2026
          </p>
        </div>

        {/* Structured Legal Content */}
        <div className="space-y-8 text-text-secondary text-xs sm:text-sm leading-relaxed" id="privacy-policy-document">
          
          <section className="space-y-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-white">1. Information Flixie Collects</h2>
            <p>
              We collect information needed to create your account, provide Flixie’s movie and social features, keep the service safe, and respond to support requests.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="bg-bg-card border border-border-custom p-4 rounded-xl space-y-2">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">Account and profile information</h4>
                <ul className="list-disc pl-4 space-y-1 text-xs text-text-secondary">
                  <li><strong>Account details:</strong> Your name, email address, username, selected country, account identifiers, and authentication status.</li>
                  <li><strong>Profile details:</strong> Your avatar, biography, profile badges, favourite movies, shows, people, genres, and watch providers.</li>
                  <li><strong>Authentication:</strong> Firebase Authentication manages your login credentials. Flixie does not receive or store your password in its application database.</li>
                </ul>
              </div>

              <div className="bg-bg-card border border-border-custom p-4 rounded-xl space-y-2">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">Activity and content</h4>
                <ul className="list-disc pl-4 space-y-1 text-xs text-text-secondary">
                  <li><strong>Movie and TV activity:</strong> Watchlists, viewing history and progress, ratings, reviews, recommendations, favourites, custom lists, and list contributions.</li>
                  <li><strong>Social activity:</strong> Friends, groups, collaborative lists, watch requests, responses, group activity, chat messages, and watch-request messages.</li>
                  <li><strong>Safety and support:</strong> Reports, blocked-user records, moderation decisions, and information you include in support communications.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-white">2. Notifications and Technical Information</h2>
            <p>
              If you enable notifications, Flixie stores a Firebase Cloud Messaging push token associated with your account so it can deliver friend, group, list, and watch-request notifications. This token is not used for advertising or cross-app tracking.
            </p>
            <p>
              Our hosting and authentication providers may process limited technical information, such as request timestamps, IP addresses, and security or error logs, as necessary to operate, secure, and troubleshoot their services. Flixie does not use advertising trackers or sell personal information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-white">3. Analytics</h2>
            <p>
              If you choose to allow analytics, Flixie uses Google Analytics for Firebase to understand how the app is used and improve its features and reliability. This may collect app interactions, session information, device and operating-system information, an anonymous app-instance identifier, and approximate location derived from a masked IP address.
            </p>
            <p>
              Flixie does not send Firebase Analytics your name, email address, username, reviews, messages, watch history, or the titles of movies and television programmes you interact with. We do not use Firebase Analytics for advertising or cross-app tracking, and we do not link analytics data to your Flixie account.
            </p>
            <p>
              Analytics is disabled unless you choose to allow it. You can change your choice at any time under Settings → Share anonymous analytics. Data already processed may remain in aggregated reports in accordance with Google’s retention and deletion practices.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-white">4. How Information is Used</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Create, authenticate, and manage your account and profile.</li>
              <li>Save your movie and television activity, preferences, lists, and viewing progress.</li>
              <li>Provide recommendations and show relevant activity from friends and groups.</li>
              <li>Enable friends, groups, collaborative lists, chat, and watch requests.</li>
              <li>Deliver notifications you have allowed.</li>
              <li>Investigate reports, enforce safety rules, prevent abuse, and respond to support requests.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-white">5. Profile Visibility and Social Sharing</h2>
            <p>
              Flixie is a social service. Your username, avatar, badges, and information you make public may be visible to other Flixie users. Friends may see additional profile and activity information, including your first name, according to the app’s visibility rules.
            </p>
            <p>
              Lists can be private, friends-only, or public. Private lists are visible only to their members, friends-only lists are visible to eligible friends, and public lists may be visible to anyone viewing a profile. Messages and group content are visible to the relevant conversation or group participants. Reviews may be visible to other users, with spoiler content hidden until they choose to reveal it.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-white">6. Third-Party Services</h2>
            <p>
              Flixie uses Firebase Authentication, Firebase Cloud Messaging, Firebase Firestore and Storage, and cloud hosting providers to provide authentication, notifications, chat, image storage, and application services. These providers process only the information needed to perform those functions.
            </p>
            <p>
              Movie, television, cast, artwork, and watch-provider information is retrieved from The Movie Database (TMDB). TMDB’s watch-provider data is powered by JustWatch; Flixie does not integrate with JustWatch directly. Flixie may submit ratings to TMDB using anonymous guest sessions. External links open third-party services under their own privacy practices.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-white">7. Sharing and Sale of Information</h2>
            <p>
              Flixie does not sell your personal information. Information is shared with service providers only where needed to operate Flixie, with other users according to the social and visibility choices described above, or where disclosure is required by law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-white">8. Storage and Security</h2>
            <p>
              Information is stored using Flixie’s database and cloud service providers. Flixie uses reasonable technical and organisational safeguards, including encrypted network connections and access controls. No online service can guarantee absolute security.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-white">9. Data Retention and Account Deletion</h2>
            <p>
              Flixie retains your account and associated information while your account is active or as needed to provide the service. You can permanently delete your account in the app from Profile → Settings → Delete Account.
            </p>
            <p>
              Account deletion removes your profile, login, email address, username, avatars, favourites, ratings, reviews, lists, watch activity, friendships, group memberships, messages, watch requests, notifications, and other associated account data from Flixie’s active systems. Limited redacted safety-report information may be retained where necessary to investigate abuse, prevent repeated misuse, comply with legal obligations, or establish or defend legal claims. Temporary provider backups and operational logs may remain until they expire under the relevant provider’s normal retention cycle.
            </p>
            <p>
              If you cannot access the app, email <a href="mailto:flixieadmin@gmail.com?subject=Flixie%20account%20deletion%20request" className="text-flixie-purple hover:text-flixie-light underline underline-offset-2">flixieadmin@gmail.com</a> from your registered email address and include your Flixie username. Never send your password. We may ask you to verify account ownership.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-white">10. Your Rights and Choices</h2>
            <p>
              Depending on where you live, you may have rights to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Access or obtain a copy of your personal information.</li>
              <li>Correct inaccurate or incomplete information.</li>
              <li>Request deletion of your information.</li>
              <li>Object to or restrict certain processing.</li>
            </ul>
            <p>
              You can edit profile information in the app, control list visibility, manage blocked users, disable notifications in your device settings, or contact us about another privacy request.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-white">11. Children’s Privacy</h2>
            <p>
              Flixie is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has created an account, contact us so that we can investigate and delete the information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-white">12. Changes to this Policy</h2>
            <p>
              We may update this Privacy Policy when Flixie’s features or legal obligations change. We will update the date shown above and provide additional notice where required.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-white">13. Contact Us</h2>
            <p>
              For privacy questions, safety concerns, or data requests, email <a href="mailto:flixieadmin@gmail.com" className="text-flixie-purple hover:text-flixie-light underline underline-offset-2">flixieadmin@gmail.com</a>.
            </p>
          </section>

        </div>
      </section>
    </div>
  );
}
