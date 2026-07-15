/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOpen, AlertTriangle, Scale, Lock } from 'lucide-react';

export default function TermsView() {
  return (
    <div id="terms-view" className="relative overflow-hidden pt-24 pb-16">
      {/* Background radial highlight */}
      <div className="absolute top-24 left-1/4 w-[450px] h-[300px] bg-flixie-purple/5 rounded-full blur-[100px] pointer-events-none" />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
        {/* Header Block */}
        <div className="border-b border-border-custom pb-8 mb-10 space-y-4">
          <div className="flex items-center gap-2.5 text-flixie-purple text-xs font-bold uppercase tracking-wider font-mono">
            <BookOpen className="h-4 w-4" /> Usage Agreements
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Terms of Service
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
              This is a draft Terms of Service document for Flixie. Important variables regarding the official operating entity, governing courts, liability ceilings, and contact addresses are marked in high-contrast <span className="text-status-warning font-bold">[BRACKET PLACEHOLDERS]</span> and must be fully approved by legal counsel before publication.
            </p>
          </div>
        </div>

        {/* Structured Legal Content */}
        <div className="space-y-8 text-text-secondary text-xs sm:text-sm leading-relaxed" id="terms-of-service-document">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-white">1. Agreement to Terms</h2>
            <p>
              By downloading, registering, or accessing Flixie, you represent that you have read, understood, and agreed to be bound by these Terms of Service. If you do not agree, you must immediately suspend use of the application and uninstall any companion client files.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-white">2. Account Responsibilities</h2>
            <p>
              To access certain social discovery modules, you must create a registered account. You represent and warrant that:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>All profile identifiers and registration emails you provide are truthful and kept updated.</li>
              <li>You are solely responsible for maintaining the confidentiality of your log-in credentials.</li>
              <li>You will notify support immediately of any unauthorised breach or security exploit.</li>
              <li>You are at least 13 years of age, or have reached the age of majority in your location.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-white">3. Acceptable Use Policy</h2>
            <p>
              Your right to access Flixie is subject to your absolute adherence to our community standards. You are strictly prohibited from:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Using scrapers, spiders, or automated bots to extract movie metadata, reviews, or profiles.</li>
              <li>Interfering with, disabling, or bypassing built-in network security configurations or firewalls.</li>
              <li>Harassing, threatening, or impersonating other movie fans, artists, or support staff.</li>
              <li>Uploading malicious scripts, computer viruses, or spam links into comment zones or reviews.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-white">4. User-Generated Content (UGC)</h2>
            <p>
              You retain full ownership rights to any reviews, ratings, and custom collection descriptions you submit on Flixie. However, by publishing content, you grant Flixie a perpetual, irrevocable, worldwide, royalty-free license to host, format, distribute, and display your UGC on our platform for discovery purposes.
            </p>
            <p>
              We reserve the absolute right, without prior warning, to remove, edit, or filter any UGC that we determine breaches our Acceptable Use standards, contains spoilers without proper toggle tags, or violates third-party copyright.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-white">5. Intellectual Property</h2>
            <p>
              All software, database structures, graphic interfaces, brand logos, and layouts are the exclusive property of Flixie and are protected by international trademark and copyright laws. You may not copy, reverse-engineer, or distribute any proprietary assets without our express written consent.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 bg-bg-card border border-border-custom p-4 rounded-xl space-y-2">
            <h4 className="font-display font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 text-flixie-teal">
              <Scale className="h-4.5 w-4.5" /> TMDB & JustWatch Data Attributions
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Flixie retrieves movie metadata and watch-provider information through the TMDB API. TMDB’s watch-provider data is powered by JustWatch; Flixie does not access JustWatch directly. All respective trademarks, movie titles, descriptions, and promotional names belong to their owners.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-white">7. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account and block your IP address from accessing Flixie at our sole discretion, without notice or liability, if we determine you have violated these Terms or engaged in conduct detrimental to the platform.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-white">8. Disclaimers</h2>
            <p className="italic">
              Flixie is provided on an "as-is" and "as-available" basis. We disclaim all warranties of any kind, whether express or implied, including merchantability, fitness for a particular purpose, or non-infringement. We do not warrant that our servers will run uninterrupted, free of bugs, or that the aggregated movie data is completely error-free.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-white">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Flixie and its founders shall not be liable for any indirect, incidental, special, or punitive damages, including loss of profits, data, or reputation, arising from your use or inability to use our application.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-white">10. Changes to the Terms</h2>
            <p>
              We may revise these Terms from time to time. If we make material adjustments, we will notify you by posting a banner in the app or updating the revision date on this page. Your continued use of the application after amendments constitute acceptance of the updated Terms.
            </p>
          </section>

          {/* Section 11 */}
          <section className="space-y-3 bg-bg-card border border-border-custom p-5 rounded-2xl">
            <h2 className="font-display font-bold text-base text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-flixie-purple" /> 11. Governing Law & Jurisdiction
            </h2>
            <p className="mt-2 text-xs">
              These Terms and your relationship with Flixie shall be governed by and construed in accordance with the laws of the specified jurisdiction below, without giving effect to conflict of laws principles.
            </p>
            
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-bg-elevated p-3.5 rounded-xl border border-border-custom space-y-1">
                <div className="text-text-muted">OPERATING COMPANY</div>
                <div className="text-white font-bold">[FLIXIE_OPERATING_COMPANY_PLACEHOLDER]</div>
              </div>
              <div className="bg-bg-elevated p-3.5 rounded-xl border border-border-custom space-y-1">
                <div className="text-text-muted">GOVERNING LAW</div>
                <div className="text-flixie-purple font-bold">[GOVERNING_LAW_JURISDICTION_PLACEHOLDER]</div>
              </div>
              <div className="bg-bg-elevated p-3.5 rounded-xl border border-border-custom space-y-1">
                <div className="text-text-muted">LEGAL ARBITRATION PLACE</div>
                <div className="text-text-secondary">[CITY_AND_STATE_OR_PROVINCE_PLACEHOLDER]</div>
              </div>
              <div className="bg-bg-elevated p-3.5 rounded-xl border border-border-custom space-y-1">
                <div className="text-text-muted">CONTACT ADDRESS</div>
                <div className="text-text-secondary">flixieadmin@gmail.com</div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
