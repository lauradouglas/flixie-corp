/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Shield, Lock, FileText, CheckCircle } from 'lucide-react';

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
            Last Updated: July 15, 2026 • Version 2.0
          </p>
        </div>

        {/* Warning Badge for Legal Review */}
        <div className="bg-status-warning/10 border border-status-warning/30 p-4 rounded-xl flex items-start gap-3 mb-10">
          <Lock className="h-5 w-5 text-status-warning mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Note for Legal Review</h4>
            <p className="text-text-secondary text-xs leading-relaxed">
              This document serves as an official draft policy for Flixie. Specific corporate entities, jurisdictional contacts, and address fields are marked in high-contrast <span className="text-status-warning font-bold">[BRACKET PLACEHOLDERS]</span> and must be fully audited by qualified legal counsel prior to commercial deployment.
            </p>
          </div>
        </div>

        {/* Structured Legal Content */}
        <div className="space-y-8 text-text-secondary text-xs sm:text-sm leading-relaxed" id="privacy-policy-document">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-white">1. Information Flixie Collects</h2>
            <p>
              We collect information to provide, personalize, and improve your social movie discovery experiences on Flixie. The sources of data are categorized as follows:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="bg-bg-card border border-border-custom p-4 rounded-xl space-y-2">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">Information You Provide Directly</h4>
                <ul className="list-disc pl-4 space-y-1 text-xs text-text-secondary">
                  <li><strong>Account Information:</strong> Your registration credentials, including name, email address, password, profile picture, and user biography.</li>
                  <li><strong>Ratings & Reviews:</strong> Self-generated star ratings, reviews, synopses feedback, and written forum interactions.</li>
                  <li><strong>Watchlists & Favourites:</strong> Customized collections, list priorities, and items marked as watched.</li>
                  <li><strong>Communications:</strong> Support emails, feedback form submittals, and troubleshooting logs.</li>
                </ul>
              </div>

              <div className="bg-bg-card border border-border-custom p-4 rounded-xl space-y-2">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">Information Collected Automatically</h4>
                <ul className="list-disc pl-4 space-y-1 text-xs text-text-secondary">
                  <li><strong>Device Information:</strong> Brand, operating system version, unique identifiers, IP address, and system settings.</li>
                  <li><strong>Analytics Data:</strong> Action timestamps, feature usage counts, navigation paths, and scroll logs.</li>
                  <li><strong>Cookies:</strong> Small tracking pixels and identifiers used strictly for session security and state storage.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-white">2. How Information is Used</h2>
            <p>
              Flixie utilizes your collected data to fulfill our commitments to you under our Terms of Service. Specifically, information is used to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Manage your account registration, secure your log-ins, and authorize access.</li>
              <li>Power the mutual match engine to find overlapping movies in your social circle watchlists.</li>
              <li>Provide personalized recommended titles and collections based on your history.</li>
              <li>Notify you of watch party invitations, accepting friend requests, or forum mentions.</li>
              <li>Respond to support inquiries, fix code exceptions, and prevent fraudulent activity.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-white">3. Friends and Social Activity</h2>
            <p>
              By default, Flixie is a social space. Connecting with friends means they will be able to see:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Your public profile name, bio, and designated top 4 pinned movie favourites.</li>
              <li>Your active written reviews and public star ratings.</li>
              <li>Mutual watchlist matches which allow the app to suggest movie nights.</li>
            </ul>
            <p className="italic text-text-muted">
              Note: You can toggle account privacy to "Strict Private" within settings, which limits profile visibility to accepted connections only.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-white">4. Cookies and Analytical Trackers</h2>
            <p>
              We utilize cookies and local storage to keep you signed in, preserve search settings, and gather anonymous analytics regarding app crashes. We do not use third-party advertising cookies, and we do not sell or trade your personal analytical records.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-white">5. Third-Party Services</h2>
            <p>
              Our app retrieves movie information using TMDB API endpoints, and streaming details via JustWatch data feeds. Some outgoing links may redirect you to external platforms (Netflix, Prime Video, etc.). We are not responsible for the privacy practices, content, or cookie tracking implemented on these third-party websites.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-white">6. Data Storage and Security</h2>
            <p>
              Your data is stored securely on servers operated by our cloud hosting providers, utilizing industry-standard Transport Layer Security (TLS) encryption. Access is strictly confined to authorised team members responding to database bugs or technical performance audits.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-white">7. Data Retention</h2>
            <p>
              We retain your account credentials and list history for as long as your account remains active. If you wish to delete your account or withdraw consent, you can do so directly within Settings or by submitting a request to our support email.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-white">8. User Rights</h2>
            <p>
              Depending on your location, you may have legal rights regarding your data (such as GDPR in Europe or CCPA in California). These include:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>The right to request copies of your stored personal information.</li>
              <li>The right to ask that we rectify inaccurate or incomplete records.</li>
              <li>The right to demand complete erasure of your data ("Right to be Forgotten").</li>
              <li>The right to object to or restrict processing of specific parameters.</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-white">9. Children’s Privacy</h2>
            <p>
              Flixie is not intended for use by individuals under the age of 13. We do not knowingly collect personal identifiers from children. If you believe your child has registered an account, contact us immediately to trigger complete data erasure.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-3 bg-bg-card border border-border-custom p-5 rounded-2xl">
            <h2 className="font-display font-bold text-base text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-flixie-purple" /> 10. Contact and Legal Representation
            </h2>
            <p className="mt-2 text-xs">
              For privacy queries, data export requests, or to report a security vulnerability, please write to our legal team:
            </p>
            
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-bg-elevated p-3.5 rounded-xl border border-border-custom space-y-1">
                <div className="text-text-muted">LEGAL ENTITY</div>
                <div className="text-white font-bold">[FLIXIE_LEGAL_ENTITY_NAME_PLACEHOLDER]</div>
              </div>
              <div className="bg-bg-elevated p-3.5 rounded-xl border border-border-custom space-y-1">
                <div className="text-text-muted">REPRESENTATIVE EMAIL</div>
                <div className="text-flixie-purple font-bold">privacy@flixie-app-placeholder.com</div>
              </div>
              <div className="bg-bg-elevated p-3.5 rounded-xl border border-border-custom space-y-1">
                <div className="text-text-muted">REGISTERED OFFICE</div>
                <div className="text-text-secondary">[STREET_ADDRESS_PLACEHOLDER], [JURISDICTION_PLACEHOLDER]</div>
              </div>
              <div className="bg-bg-elevated p-3.5 rounded-xl border border-border-custom space-y-1">
                <div className="text-text-muted">DATA PROTECTION OFFICER</div>
                <div className="text-text-secondary">[DPO_NAME_AND_CREDENTIALS_PLACEHOLDER]</div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
