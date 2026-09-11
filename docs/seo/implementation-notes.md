# Implemented SEO fixes

Implemented in the repository; not deployed. The existing GitHub Actions workflow now checks types, builds the static output and runs SEO/HTTP checks before its existing Azure deployment step.

## What changed

- All existing public pages plus About and a useful 404 page are rendered to full HTML at build time. Invitations render a generic, noindex shell; personal data is fetched only in the browser.
- A central page registry generates distinct titles/descriptions, canonical URLs, Open Graph/X cards, WebSite/WebPage/SoftwareApplication/BreadcrumbList data, sitemap and Azure route rules.
- Normal anchors replace History API buttons. Mobile navigation and FAQ disclosures use native HTML and work without JavaScript. Download options are visible in the footer instead of a modal.
- Removed placeholder social links, inaccurate App Store badge wording and unverified homepage popularity claims. Marked sample film/activity mockups as illustrative. Added an About page using supported product facts.
- Missing URLs no longer use the homepage fallback. Canonical aliases redirect; invite pages are noindex. The Android association file now contains the supplied Play signing fingerprint for `com.flixie.app`. The Apple association file authorises `4T69VPQXW6.com.flixie.flixieApp` for `/invite`, with an explicit JSON content type. Both website associations require deployment and device verification.
- Added keyboard focus treatment, a skip link, corrected headings, visible initial content and reduced-motion handling.
- Optimised image variants: main cinema JPEG 664,564 → 131,463 bytes (about 80% smaller); wordmark 155,188 → 21,651 bytes (about 86% smaller). Values are approximate build-reported bytes, not a field-performance score. Original assets remain intact.
- Page code is split, so homepage visits do not load the FAQ/privacy/contact content bundles. Removed the third font family and the CSS font-import chain.
- Added a committed 1200×630 social image. Its optional Swift regeneration helper runs on macOS; production builds require only Node/npm.

## Build and review

From `flixie/`:

```sh
npm run lint
npm run build
npm run check:seo
npm run preview
```

Preview runs at `http://127.0.0.1:4173`. It serves the generated static route configuration, including real 404s. It is a local check of the rules used by this project, not a complete Azure emulator. Development remains `npm run dev`; development HTML is client-rendered, so use the production preview to inspect SEO output.

`src/site.ts` owns routes, descriptions, store links and platform availability. `scripts/prerender.mjs` writes HTML, robots.txt, sitemap.xml and the final `dist/staticwebapp.config.json`. Do not deploy the incomplete public config by itself: deploy the built `dist/` directory, as the existing workflow does. The `.ssr/` build directory is temporary and ignored.

Checks cover eight complete HTML documents, six indexable URLs, one H1/title/description per page, canonical ownership, JSON-LD parsing, valid local assets/links/fragments, visible initial content, native FAQ answer markup, no placeholder links, invite noindex, social image dimensions and HTTP responses on the local preview. The routing changes still need a real Azure staging check. No browser was available in this session for rendered mobile/keyboard or hydration testing. No Core Web Vitals results are claimed.

## External work still required

1. **Bare-domain redirect (P0):** The service currently answering `flixie.co.uk` must replace its `/lander` behaviour with HTTP 301/308 to `https://www.flixie.co.uk`, preserving path/query. The www repository cannot control a different hostname's hosting. Confirm the domain/edge provider, configure both HTTP and HTTPS, and test `/features` and `/invite?code=...` without dropping query parameters. Never send real referral codes to logs/analytics for testing.
2. **Deploy and verify:** The existing workflow deploys after a push to main or publishes a PR preview. No commit, push or deployment was performed in this task. In the Azure preview verify `/robots.txt`, `/sitemap.xml`, `/features`, `/invite?code=TEST_ONLY`, a nonexistent URL, and `.html`/trailing-slash redirects. Confirm real 404 status and query preservation; check native mobile menu, FAQ, download anchors and invitation hydration on devices.
3. **Search Console/analytics:** Need property access and a verified GA4 measurement ID plus a consent design matching the existing privacy policy. No trackers or fake measurement IDs were added. Submit the sitemap after deployment. Store clicks must be labelled as clicks, not installs; an attribution implementation also needs store-console/app access.
4. **App associations and Smart App Banner:** Android website association is implemented in `flixie/public/.well-known/assetlinks.json` using the supplied Play signing SHA-256 fingerprint. After deployment, verify HTTPS 200 with `application/json` and no redirect at `https://www.flixie.co.uk/.well-known/assetlinks.json`. The inspected Flutter source already has a verified Android intent filter and referral handling; test the distributed Play-installed build. Apple website association now uses Team ID `4T69VPQXW6` and bundle ID `com.flixie.flixieApp`. The inspected Flutter source already has Associated Domains (`applinks:www.flixie.co.uk`) and referral handling; verify the distributed TestFlight build contains this configuration. Verify the signed app’s application-identifier matches the association ID. A public numeric App Store ID is needed for the Smart App Banner. No placeholder association JSON is published.
5. **Brand/legal information:** Confirm the legal operator, official social profile URLs, and which support email should be canonical (website currently uses `flixieadmin@gmail.com`; the audited Play result showed another address). About does not invent a legal company identity. Minimal Organization schema now uses the confirmed Flixie brand name, website and existing logo. Legal identity, social profiles, legal terms and business-registration details remain pending verified information.
6. **Platform status:** Current shared copy accurately notes TestFlight and possible Android test eligibility without claiming a public iOS App Store release. Confirm Google Play production availability and update `src/site.ts` once verified.
7. **Content growth:** The four landing-page briefs and 30 content ideas remain in the audit as planned growth work, not thin automatically generated pages. Real app screenshots, feature verification and original comparison research are needed before publication. Licensing and attribution review remain required before publishing programmatic movie-data pages.


## Mobile source inspection follow-up

Located the Flutter project at `/Users/lauradouglas/Development/FLIXIE/Flixie-App-Code/flixie-app` and inspected its existing configuration without changing its in-progress work:

- `ios/Runner/Runner.entitlements` already includes `applinks:www.flixie.co.uk`.
- Xcode app configurations reference that entitlement file and use Team ID `4T69VPQXW6` and bundle ID `com.flixie.flixieApp`.
- `android/app/src/main/AndroidManifest.xml` already declares an exported MainActivity and an auto-verified HTTPS filter for `www.flixie.co.uk` with `/invite` path prefix.
- The Flutter router already reads invitation `code`, preserves referral attribution during unauthenticated startup and passes it into signup. Existing-account behaviour is separate; this is a signup referral flow, not a group-watch invitation screen.

This supersedes earlier statements that native configuration was necessarily missing. Both website files are now ready and local HTTP checks pass. Deploy the website, then test a Play-installed Android build and a TestFlight build containing this existing mobile configuration by tapping an HTTPS invitation in Notes/email. Confirm cold launch, warm launch and signed-out signup. Signing/provisioning and released-build contents have not been verified on devices. Upload new mobile builds only if the distributed versions do not yet contain the inspected configuration. The Apple Smart App Banner remains off for the TestFlight-only release.
