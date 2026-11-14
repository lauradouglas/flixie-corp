# Flixie in the browser

This extends the existing React/TypeScript/Vite marketing website and Azure static routes. It uses the same Firebase identity and Flixie backend. No second database, hosting migration, production seed or deployment is part of this change.

## Local preview

Start the existing backend/database/Firebase emulators following the backend’s local guide. Auth is on 9099, API on 3000, project `demo-flixie-local`. From the backend run `npm exec tsx scripts/seed-dev-web-app.ts` (or `-- --dry-run` for preflight). It refuses production and identity collisions; reruns preserve fixture activity, removals and Auth sessions.

From this website run `npm ci` then `npm run dev`. Open http://127.0.0.1:5174/app and use the fictional `dev_web_alex` / `FlixieLocal1!` account. Jamie shares publicly; Robin is a private friend. Fixture changes stay local. Development refuses a non-loopback API and uses the emulator, independently of production environment variables.

## Connected scope

- Email/username password sign-in; existing Google/Apple Firebase providers; registration, reset email, current terms acceptance and sign-out.
- Home, movie/TV watchlist save/remove, private film diary logging with date/rating/recommendation/notes/cinema, mood/time picks, next aired TV episode progress, friends’ activity and read-only Watch Plans.
- Public movie/show metadata, separately projected public reviews, spoiler reveal, regional stream/rent/buy options and existing app deep links.
- Mobile choices/confirmations use bounded, scrollable native dialog bottom sheets. Full 2:3 posters, Manrope, 14px body, wordmark/Pip and each user’s awarded/selected badge border are retained.

The plan page shows existing plans; editing plans, chat, games, full native-app parity and profile editing remain outside this first browser slice. Existing native app routes and association files are retained.

## Download prompts

Desktop Home and title pages have “Download Flixie on your phone” with both official store destinations. The prompt is shared with the marketing site. iOS Safari uses `apple-itunes-app` Smart App Banner metadata. Android and non-Safari iOS get a compact custom banner after scrolling 160px on screens up to 820px. Dismissal lasts for the tab session. It links to the correct store and does not redirect automatically, block content or claim that the website can install the native app. Native banner presentation ultimately belongs to Safari. Physical iPhone/Android verification is still needed before release.

## Search discovery

`/films` links eight initial public movie/show pages under existing `/movies/:id` and `/shows/:id` URLs. Their actual synopsis, portrait, date, genre and useful Flixie actions are prerendered into HTML. Each has unique title/description, canonical, Movie/TVSeries schema, app banner metadata and related-film links. Exact Azure rules precede generic media fallbacks. The generated sitemap now has 24 public URLs. Private `/app/*`, invite links and uncurated shared-title fallbacks stay noindex.

The checked-in snapshot is a finite public metadata projection, not private activity or provider availability. Refresh deliberately with `FLIXIE_CATALOG_API_URL=<backend> npm run sync:catalog`, review the metadata/selection, then build. The script requests no reviews or user IDs and fails rather than shipping incomplete titles. Add verified titles to its selected list to expand coverage. Viewing availability remains live and country-specific, so no static streaming claims or fabricated review aggregates are included in schema.

After an authorized deployment: verify real Azure response headers/canonicals, submit the sitemap in the site’s Google Search Console property, inspect representative title/feature URLs and monitor indexing/clicks. Neither sitemap submission nor ranking is guaranteed by this local change. Google’s guidance supports prerendered public content and unobtrusive app banners: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics and https://developers.google.com/search/docs/appearance/avoid-intrusive-interstitials .

## Backend and privacy

New GET `/guest/titles/:kind/:id/reviews` validates the title, bounds results to six, selects only public review/person fields, retains profile badges, excludes deactivated/private authors, applies both-direction blocks when signed in, and uses no-store. An invalid supplied token fails authentication rather than silently falling back to anonymous. The older general movie response can contain reviews; the browser always requests `includeReviews=false` and reads reviews from this new projection.

Account IDs come from the Firebase token-owner profile, not URL input. API requests refresh an expired token once, discard responses after account switches, and never retry a network-failed diary mutation automatically. Cached component data is scoped to the current account. Private notes are rendered only in the owner diary. Public static output includes no reviews, credentials, friends or user profiles.

## Production build configuration

Use the existing project’s PUBLIC Firebase web-app values in the build environment: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_AUTH_DOMAIN`; see `.env.example`. The existing client configuration has been copied to ignored `.env.production.local` for this local build only. Configure the same values in the deployment workflow before releasing this branch; no admin/service-account key belongs in the browser. `VITE_FLIXIE_API_URL` optionally overrides the existing HTTPS backend. Confirm the website domain is authorized for the existing Firebase providers. Social-provider popups, reset email delivery and production account operations have not been exercised against real users.

The backend public-review endpoint must be released before the website uses it in production. No schema migration is required by these additions. Preserve unrelated backend working-tree changes when preparing a release.

## Checks

`npx tsc --noEmit`, `npm run build`, `npm run check:web`, `npm run check:seo`, `npm run check:analytics`. Backend: `npm run typecheck` and `npm test -- src/services/webPublicReviews.test.ts`. Browser checks use only fictional local accounts. Do not run the full Flutter regression suite for these website changes.

Assets under `public/web` are existing Flixie assets from the Flutter repository (Manrope, Pip, F icon and Christmas frame). `terms.html` preserves the six sections of `lib/core/legal/terms_of_use_screen.dart` (effective 16 September 2026). TMDB portrait URLs are supplied by public catalogue metadata; no generated poster artwork is used.

### Browser regression: save before sign-in

Using only a fictional local account: sign out, open `/shows/15621`, choose Save to watchlist, and sign in as Alex in the sheet. Expected: the sheet shows account loading while the profile resolves, stays on The Newsroom, closes after authentication and changes the title action to In your watchlist. The watchlist must include the show after a reload. Verified locally; this guards the pending-save handoff across the Firebase identity change. Also verify sign-out removes the diary, friends and plans from view, and that a public spoiler review renders its body only after Show review.

Final local evidence: the guest-save journey added The Newsroom to Alex’s watchlist (6 → 7) while retaining `/shows/15621`; it returned to the same page with In your watchlist. The final Home preview includes the saved show and the diary/episode changes. Runtime auth module edits caused a transient Vite hot-refresh context error and a development backend restart interrupted one request; a full reload recovered, and the completed journeys above were then verified. These are local development events, not passing production-device tests.
