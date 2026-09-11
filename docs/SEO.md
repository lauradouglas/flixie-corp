# Flixie SEO strategy

Updated: 11 September 2026. Changes described here are implemented locally, not deployed. This is the maintenance guide and prioritised roadmap; the [original audit](seo/flixie-seo-audit-2026-09-11.md) contains deeper analysis and the [implementation notes](seo/implementation-notes.md) include hosting and app-link instructions.

## Positioning and search intent

Flixie is a movie-first social discovery and tracking app: discover what to watch through friends, track watched movies, save watchlists, share ratings and reviews, and make Watch Plans. TV tracking is a supporting feature. Organic acquisition should bring people with these needs to an accurate product explanation and a clearly labelled platform download or beta link.

The homepage owns the broad combination of movie tracking and social discovery. `/features` explains the product in depth; `/faqs` addresses practical questions; `/about` explains the product's purpose; `/contact` and `/privacy` support trust and account help. `/invite` is a private referral entry point and is deliberately noindex. Error pages are noindex and return 404. There are six canonical indexable routes, not a separate page for every keyword variation.

## Implemented changes

These include the earlier implementation and the current follow-up. Expected impacts are hypotheses, not measured traffic or ranking gains.

| Change | Why and expected SEO impact | Relevant files |
| --- | --- | --- |
| Build-time rendering of all eight pages | Makes content, links and metadata available in initial HTML, reducing dependence on crawler JavaScript execution | `flixie/src/entry-server.tsx`, `src/views.ts`, `src/App.tsx`, `src/main.tsx`, `scripts/prerender.mjs` |
| Unique page metadata; homepage title now explicitly says Movie Tracker and Social Movie App for Friends | Clarifies search relevance and gives search engines useful title/description candidates | `flixie/src/site.ts`, `src/seo.ts` |
| Canonicals and exact route rules; redirects for trailing slashes and HTML aliases | Consolidates duplicate routes while preserving useful query parameters | `flixie/scripts/prerender.mjs`, `public/staticwebapp.config.json` |
| Generated sitemap and robots.txt | Keeps crawl discovery aligned with the central indexability registry | `flixie/src/site.ts`, `scripts/prerender.mjs` |
| Real 404 output and generic noindex invitation HTML | Prevents unknown URLs appearing as valid homepage copies and keeps referral entry pages out of search | `flixie/src/components/NotFoundView.tsx`, `InviteView.tsx`, `scripts/prerender.mjs` |
| Open Graph/X metadata and 1200×630 social card | Gives shared links a consistent descriptive preview | `flixie/src/seo.ts`, `public/og/flixie-social.png` |
| WebSite, WebPage, SoftwareApplication and breadcrumb JSON-LD | Describes the site, app and page relationships without invented ratings or pricing | `flixie/src/seo.ts` |
| Minimal Organization entity, linked as WebSite publisher | Identifies the Flixie brand with its existing public logo and URL; no legal name, registration details or unverified social accounts asserted | `flixie/src/seo.ts`, `public/flixie-icon.png` |
| Clearer homepage copy, illustrative demo labels, About page | Explains real product value and removes unsupported popularity signals | `flixie/src/components/HomeView.tsx`, `AboutView.tsx` |
| HTML navigation, visible download links and native FAQ disclosures | Makes important destinations and answers available without JavaScript and improves usability | `flixie/src/components/Navbar.tsx`, `Footer.tsx`, `DownloadLinks.tsx`, `FaqView.tsx` |
| Focus styles, skip link, heading corrections and reduced-motion handling | Supports keyboard access and understandable page structure | `flixie/src/index.css`, `src/components/` |
| Smaller hero/wordmark assets, image dimensions, page code splitting and fewer font dependencies | Reduces transfer and rendering costs; field performance impact remains unmeasured | `flixie/src/assets/`, `src/components/BrandLogo.tsx`, `src/views.ts`, `index.html` |
| Apple/Android website association files | Connects installed app invitation handling to the website; supports acquisition continuity rather than a direct ranking boost | `flixie/public/.well-known/`, `public/staticwebapp.config.json` |
| Build and HTTP regression checks in CI | Catches broken metadata, references, links, assets, crawl files and routing before the existing deployment step | `flixie/scripts/check-seo.mjs`, `check-http.mjs`, `.github/workflows/build.yml` |

The organization uses only brand-level facts. Google's [Organization documentation](https://developers.google.com/search/docs/appearance/structured-data/organization) allows relevant properties without requiring legal or registration fields. Structured data does not guarantee enhanced search results. No aggregate ratings, invented offers, FAQ rich-result promises or fake public App Store listing were added.

## Target keyword themes

No search volumes or difficulty scores have been researched or claimed.

| Cluster | Themes | Initial ownership |
| --- | --- | --- |
| Core | movie tracker app; movie tracking app; movie watchlist app; social movie app | Homepage, supported by features |
| Social differentiation | movie app with friends; track movies with friends; movie recommendations from friends; movies to watch with friends; movie night app | Homepage and features; later a substantial friends page |
| Discovery | movie recommendation app; personalised movie recommendations; discover movies to watch | Features; later one discovery page until distinct intent is established |
| Supporting | rate movies app; movie lists; TV tracker | Existing features/FAQs; dedicated pages only with enough evidence and distinct intent |

Use these themes naturally. Preserve readable headings and CTAs. Before creating a new page, record its primary intent, how it differs from existing pages, its original supporting material and its conversion action.

## Validation and maintenance

Run from `flixie/`:

```sh
npm run lint
npm run build
npm run check:seo
npm run preview
```

`lint` currently runs TypeScript checking; there is no separate ESLint or formatting command. Build produces the browser bundle, server rendering bundle and complete static output. SEO checks cover eight documents, six sitemap entries, metadata, JSON-LD parsing and entity references, local assets, internal links/fragments, headings, FAQ content and noindex. HTTP checks start a temporary local server and verify crawl-file MIME, 404s, association responses and invitation redirects with synthetic codes.

The preview server models this project's routing rules, not all Azure behaviour. Validate the deployed output separately. Browser/device QA, Google Rich Results Test, Search Console rendering, Lighthouse and field Core Web Vitals remain external verification tasks; no scores or successful device tests are claimed. A live web fetch in this follow-up still surfaced the older homepage title; robots/sitemap could not be retrieved by that browsing tool, so their present production status is unconfirmed.

Change routes and metadata in `src/site.ts`; do not hand-edit generated `dist` files. Keep invitations and errors out of the sitemap. Add `lastmod` only when a reliable substantive content-change date is available; do not set every page to each build's date. Keep synthetic referral codes out of real attribution reporting.

## High-priority roadmap

| Task | Why / target topic or URL | Required work | Expected benefit |
| --- | --- | --- | --- |
| Deploy and verify all local fixes | Technical foundation; all public routes | Deploy built `flixie/dist` through the existing workflow; check original HTML, response codes, MIME, canonicals, aliases, mobile navigation and invitation hydration on Azure | Makes implemented improvements available to crawlers and users |
| Finish apex/HTTPS canonicalisation | `flixie.co.uk` → `https://www.flixie.co.uk` | Confirm GoDaddy/Azure ownership and edge configuration; test HTTP and HTTPS with `/features` and a synthetic invitation query; retain query parameters and avoid loops | Consolidates hosts and prevents broken acquisition links |
| Establish Search Console baseline | All six sitemap URLs and branded/nonbranded queries | Verify domain property, submit sitemap after deployment, inspect key URLs and save pre/post deployment snapshots | Finds indexing problems and enables evidence-based prioritisation |
| Verify app availability and installed-app links | iOS/Android acquisition and `/invite` | Confirm current Play eligibility; tap links with distributed Play/TestFlight builds in cold/warm/signed-out states; inspect resulting signup attribution | Reduces loss between website visits and app onboarding |
| Capture authentic product evidence | All feature themes | Approved current app screenshots, accurate captions, supported feature descriptions and a privacy-safe demo account | Enables persuasive original content and credible landing pages |
| Verify trust and product claims | About, features, contact, privacy | Confirm operator, canonical support email, social profiles, availability and technical/privacy claims with the owner | Keeps brand information consistent and avoids unsupported claims |
| Define consent-aware conversion measurement | Platform download/beta clicks | Agree consent behaviour and verified analytics configuration; exclude referral codes and personal information; separate store clicks from confirmed installs | Measures acquisition without pretending clicks are installs |

## Medium-priority roadmap

The URLs below are proposals, not published routes. Prioritise from observed queries and real product evidence. Every page needs a worked product example, relevant screenshots, limitations, useful internal links and a platform CTA before launch.

| Task / proposed URL | Target intent and why | Required work | Expected benefit |
| --- | --- | --- | --- |
| Movie Tracker — `/movie-tracker` | movie tracker app; keeping a watched history | Demonstrate logging, ratings and history with authentic screens; differentiate from homepage | Captures users actively seeking a tracking tool |
| Movies With Friends — `/movies-with-friends` | movie app with friends; social discovery | Show following, friend activity and a concrete recommendation-to-plan journey | Explains the main product differentiator |
| Watchlist — `/watchlist-app` | movie watchlist app | Document saving, finding and organising titles; confirm whether any shared-list functionality actually exists | Addresses a specific practical need |
| Movie Recommendations — `/movie-recommendations` | personalised recommendations and discovery | Explain available inputs and friend suggestions accurately without inventing algorithm details | Converts discovery intent into a product trial |
| Recommendations From Friends — possible `/movie-recommendations-from-friends` | trust in friends' film choices | Initially cover on the friends/discovery pages; split only after distinct search intent and substantial examples are demonstrated | Avoids competing near-duplicate pages |
| Watch Plans — `/watch-plans` | movie night app; planning films with friends | Show a real plan, invitations, responses and supported timing/location options | Connects social discovery to a concrete group activity |
| Movie Lists — `/movie-lists` | movie lists; organising films | Verify distinction from watchlists, permissions and sharing; provide original list examples | Captures organisation intent without duplicating watchlists |
| TV Tracking — `/tv-show-tracker` | supporting TV tracker intent | Verify episode/progress behaviour and capture screenshots; keep movie-first navigation and branding | Adds a secondary audience without diluting positioning |
| Where to Watch — possible `/where-to-watch` | finding title availability | Confirm regions, provider coverage, update freshness and attribution/licensing | Publish only if users can get reliable actionable availability |
| Fair comparison — `/letterboxd-alternative` | Letterboxd alternative; apps like Letterboxd; Flixie vs Letterboxd | Research current first-party features/pricing; date claims, cite sources, disclose Flixie authorship and acknowledge competitors' strengths | Helps high-intent evaluators make an informed choice |

Start with one comparison page. Create a separate versus page only when it serves a distinct need. Never imply an endorsement or fabricate superiority.

## Longer-term opportunities

| Task | Topic / proposed destination | Required work | Expected benefit |
| --- | --- | --- | --- |
| Practical editorial guides | `/blog/`; how to keep track of watched movies, find movies with friends, and plan a movie night | Original walkthroughs and app screenshots; choose whether a guide or feature page best serves each query before publishing | Reaches people solving a problem before choosing an app |
| Shared-watchlist guide | How to make a shared movie watchlist | Verify Flixie's supported workflow; explain alternatives honestly if collaborative editing is unavailable | Earns trust and qualifies product fit |
| Researched app roundups | Best movie tracking apps; best movie recommendation apps; apps like Letterboxd | Hands-on comparisons, disclosed authorship, consistent criteria, first-party citations and scheduled updates | Supports evaluation intent with useful original research |
| Programmatic pilot | Possible movie, TV, people, genre, movies-like-X and recommendation pages | Confirm data/image licences; add original licensed value beyond API descriptions; validate uniqueness, moderation, privacy, demand and maintenance capacity | Potential long-tail discovery only where pages independently help users |
| Editorial outreach | App-review sites, film communities, entertainment blogs, indie app directories, tech publications and UK/Northern Ireland tech press | Build a factual press kit and real product story; follow community rules and obtain approval before sending outreach | Relevant coverage, referral traffic and earned links |
| Original research | Aggregated Flixie movie-discovery insights | Sufficient representative data, consent/privacy review, reproducible methods and honest limitations | Creates material worth citing without purchased or spam links |
| Performance iteration | Core Web Vitals across mobile landing pages | Collect field data and reproducible lab baselines; prioritise demonstrated LCP/INP/CLS bottlenecks | Improves real usability rather than chasing an unmeasured score |

Do not bulk index API-fed movie/TV/people pages. Begin with a small editorially reviewed pilot only if licensing and unique usefulness are established. Check duplicate metadata, crawl growth, sitemap coverage and low-value URLs before expansion. Keep private activity and personal lists out of public indexing by default. Search scale is not a reason to publish thin content.

## Search Console operating rhythm

1. After deployment, submit `/sitemap.xml`, inspect home/features and a sample support page, and verify rendered content, selected canonical and mobile experience. Confirm invitations and unknown URLs are excluded for the intended reasons.
2. Weekly, inspect indexing changes, sitemap errors and unexpected excluded/duplicate URLs. Review clicks, impressions, CTR and average position by page, query, device and country; separate branded from nonbranded demand.
3. Monthly, compare equivalent periods and note release dates/seasonality. Look for growing queries and pages with meaningful impressions in positions 5–20. Improve relevance and product evidence before creating another overlapping page. Average position is a diagnostic, not a stable rank guarantee.
4. Review low CTR in the context of the actual result and intent; refine titles/descriptions where warranted. Check whether multiple pages compete for the same query and consolidate intent when needed.
5. Review Core Web Vitals when enough field data exists. Pair search traffic with consented store-click measures and app-side outcomes where available; label each metric accurately.
6. Maintain this document and the changelog with every release. Recheck store availability, comparison claims, screenshots and broken links regularly.
