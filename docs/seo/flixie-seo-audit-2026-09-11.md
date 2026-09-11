# Flixie SEO audit and implementation plan

Audit date: 11 September 2026. Website: https://www.flixie.co.uk/. Scope: live HTTP responses, deployed HTML and JavaScript, the local Vite/React codebase, public search results and competitor pages. Deliverable: recommendations and implementation examples; no application changes or deployment were made.

## Decision in brief

Fix crawling, canonicalisation and the download journey before investing in a large content library. The homepage currently returns an empty React mount point; navigation is implemented with buttons; robots.txt and sitemap.xml return HTML; nonexistent URLs return 200; and the bare domain executes JavaScript to `/lander` instead of redirecting to www. These are concrete infrastructure problems, not a shortage of keywords.

Position Flixie around **discovering a film through friends and turning that recommendation into a watch plan**. Social ratings and watchlists alone are already well served. Start with the homepage and three distinct feature landing pages, then a fourth once there is enough original evidence. Publish six excellent guides during the first three months; the 30-topic backlog below is a research and commissioning queue, not a bulk publishing target.

### Evidence and limits

Raw responses are saved in [evidence](evidence/urls.json), with each URL mapped to its corresponding headers/body files. The live homepage is [saved here](evidence/flixie-live.html). Production's JavaScript contains the inspected homepage wording, beta messaging, support email and compatibility-engine claims; this corroborates key local findings, but does not prove every local line matches production.

No Search Console, GA4, Firebase, store-console or paid keyword/backlink data was available. Actual index coverage, Google-selected canonicals, traffic, rankings, conversion rates and competitor traffic cannot be reported from this audit. Keyword difficulty and business value below are qualitative estimates, not measured keyword-tool scores. Search results establish discoverability for the sampled queries, not fixed Google UK positions.

The browser tool reported no available browser. The PageSpeed API returned HTTP 429/quota exhaustion ([response](evidence/flixie-psi.json)). No visual mobile test, Lighthouse score, field Core Web Vitals or rendered-Google test is claimed. Inspecting raw production HTML and source still establishes the technical findings below.

## 1. Technical SEO: findings and precise changes

Impact is expected benefit relative to Flixie's current state. Effort: Low roughly hours; Medium roughly 1–3 working days; High several days or ongoing work. Estimates include implementation and verification but depend on existing hosting access.

| ID / priority | Verified evidence | Exact recommendation | Impact | Effort |
|---|---|---|---|---|
| T1 / P0 | `/robots.txt` returns 200, `text/html`, 563 bytes: identical homepage shell | Publish an actual text file; exempt crawl files from fallback; verify body and MIME type | High | Low |
| T2 / P0 | `/sitemap.xml` returns the same 563-byte HTML | Generate XML from the canonical route registry; submit after routes work | High | Low |
| T3 / P0 | `/seo-audit-missing-page` returns the same shell with 200; `pageFromPath` in `src/App.tsx` defaults unknown paths to home | Return a real 404 from the host, with a useful error page; give the client router a not-found state too | High | Medium |
| T4 / P0 | Both HTTP and HTTPS bare-domain roots return 200 and `window.location.href="/lander"` | Replace the bare-domain landing/forwarding setup with a host-level 301/308 to `https://www.flixie.co.uk`, preserving path/query | High | Medium |
| T5 / P0 | `Navbar.tsx`, `Footer.tsx` and homepage route CTAs use buttons plus History API | Use real `<a href>` navigation; keep buttons for actions such as opening a modal | High | Low |
| T6 / P1, start immediately | Initial HTML has only `<div id="root"></div>`; every sampled public route has the homepage title | Statically render marketing routes, including content, navigation and route-specific head metadata | High | High |
| T7 / P0 | No meta description or canonical in live HTML; source only changes `document.title` | Add route-specific metadata now, emitted in initial HTML with T6; never canonicalise every page to home | High | Medium |
| T8 / P1 | No Open Graph, X-card or JSON-LD in initial HTML; no JSON-LD marker found in deployed bundle | Add per-page social metadata and a restrained entity graph | Medium | Low |
| T9 / P1 | `/invite` loads personal referral information client-side; association endpoints both return HTML | Serve `noindex` on invite route, omit from sitemap, and implement real association JSON when app identifiers are confirmed | Medium | Medium |
| T10 / P1 | Footer social links all have `href="#"` | Replace with verified official profiles, or remove until available; never put placeholders in `sameAs` | Medium | Low |
| T11 / P1 | Download modal calls iOS TestFlight “iOS App Store”; invite page says Android closed test | Centralise platform availability and truthful labels; test eligibility on an ordinary UK account | High | Low |
| T12 / P1 | Local cinema image ~652 KiB, logo ~152 KiB; live JS 439,891 bytes uncompressed | Optimise imagery and fonts, then measure bundle/render costs; see performance plan | Medium | Medium |
| T13 / P1 | All main views imported eagerly; entrance motion starts content at opacity zero | Keep initial marketing content visible without JS; hydrate only useful interactivity and honour reduced motion | Medium | Medium |
| T14 / P1 | No web analytics integration found in inspected source; privacy page describes opt-in app analytics | Add consent-aware website events, keep app and website policies aligned; see measurement plan | High | Medium |
| T15 / P1 | No About/Terms/Press routes in the inspected route map; contact uses Gmail | Publish operator identity and accurate product status; build trust pages, not local doorway pages | Medium | Medium |

### HTTP and indexability findings

| URL | Observed result | Interpretation |
|---|---|---|
| `https://www.flixie.co.uk/` | 200 HTML; empty application shell | Available, but content needs rendering |
| `/features`, `/faqs`, `/privacy`, `/contact` | 200; byte-identical initial shell | Routes resolve; unique content/title depend on JS |
| `/robots.txt`, `/sitemap.xml` | 200 HTML | Neither is a valid published crawl file |
| Invented missing page | 200 HTML | Duplicate-home/soft-404 risk; Google's actual classification unverified |
| `http://www.flixie.co.uk/` | 301 to HTTPS www | Correct at root; verify path/query preservation too |
| `http://flixie.co.uk/`, `https://flixie.co.uk/` | 200; JS to `/lander` | Broken canonical-host journey; final lander content not inspected |
| `/.well-known/assetlinks.json`, `/.well-known/apple-app-site-association` | 200 HTML | Invalid app association responses |

HTTPS www has a valid TLS connection in the fetch and sends HSTS. No `noindex` directive was present in the sampled homepage HTML/headers. An absent/invalid robots file does **not** establish that Google is blocked; here the bigger issues are link discovery, rendering dependence, invalid sitemap and URL duplication. These checks are a representative sample, not an exhaustive crawl.

Google can render JavaScript, but explicitly recommends crawlable links and supports server/prerendered content. This site should not depend on clicking navigation buttons for URL discovery. [Google's JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

### Rendering and routing implementation

Keep Azure Static Web Apps and existing branding. A runtime server migration is unnecessary for this small marketing site. Prefer build-time rendering of `/`, `/features`, `/faqs`, `/privacy` and `/contact`, followed by new landing pages. A static-first framework or a deliberate Vite prerender build can both work; select whichever the maintainer can support. This is a recommended architecture, not a completed build integration.

For a Vite implementation:

1. Extract route definitions, metadata and page content into one registry used by rendering and sitemap generation.
2. Make the initial route a component prop. `App.tsx` currently reads `window.location` during initial state, and `InviteView.tsx` reads it in `useMemo`; these need refactoring before server rendering.
3. Render a public page shell at build time using React's server renderer. Keep referral fetching in the client-only invite island. Never fetch personal referral data during builds.
4. Emit a full HTML document for each route, including head tags and visible content. Use `hydrateRoot` only where matching server markup exists; current `main.tsx` uses a client mount. Remove initial opacity-zero animation from prerendered content so disabled JS does not hide it.
5. Use direct anchor navigation first; it is sufficient for this site. If client navigation stays, preserve modified clicks, focus, scroll restoration, head updates and back/forward behaviour.
6. Remove blanket navigation fallback only once all public documents and explicit invite routing exist. Have Azure return 404 for unknown routes.

Example replacement for a navigation button:

```tsx
<a href="/features" aria-current={currentPage === 'features' ? 'page' : undefined}>
  Features
</a>
```

This is fully functional with normal page navigation and eliminates dependence on `pushState` callbacks. Apply to header, logo, footer and in-copy page links. Keep the download action a button only if it still opens a properly accessible modal; visible direct platform anchors are preferable.

Example **post-prerender** Azure configuration fragment; integrate explicit rewrites with the actual build output, preserve other required settings, and remove the old `navigationFallback`. The example assumes route HTML files such as `dist/features.html` exist:

```json
{
  "routes": [
    { "route": "/features/", "redirect": "/features", "statusCode": 301 },
    { "route": "/features", "rewrite": "/features.html" },
    { "route": "/faqs", "rewrite": "/faqs.html" },
    { "route": "/privacy", "rewrite": "/privacy.html" },
    { "route": "/contact", "rewrite": "/contact.html" },
    { "route": "/invite", "rewrite": "/invite.html", "headers": { "X-Robots-Tag": "noindex" } },
    { "route": "/.well-known/apple-app-site-association", "headers": { "Content-Type": "application/json" } }
  ],
  "responseOverrides": {
    "404": { "rewrite": "/404.html" }
  },
  "mimeTypes": {
    ".xml": "application/xml",
    ".txt": "text/plain",
    ".json": "application/json"
  }
}
```

Generate trailing-slash redirects and `.html`-alias redirects for every published page from the route registry, so file URLs do not become extra canonical candidates. Do not add entries for unbuilt pages. The above illustrates the routing shape, not a complete drop-in deployment file. Unknown paths must keep status 404 even when `/404.html` is displayed. `404.html` needs ordinary site links, a concise error message and `noindex`. Verify on Azure staging: local Vite preview does not reproduce host routing. [Azure configuration reference](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration).

Bare-domain redirects belong in the service currently handling that hostname, or in an edge service where both names are configured. A www application config alone cannot fix a bare domain pointing elsewhere. Required rule: when host is `flixie.co.uk`, issue 301/308 to `https://www.flixie.co.uk` plus original path and query. Preserve invite codes in routing, but never send them to analytics. If app-association files are needed on both hostnames, serve those files directly on both hosts rather than redirecting them.

`flixie/public/robots.txt`:

```text
User-agent: *
Allow: /

Sitemap: https://www.flixie.co.uk/sitemap.xml
```

Do not disallow `/invite` while relying on Google to read its noindex. Robots rules are not privacy/access controls. Referral endpoints should expose only intended information and enforce normal authorisation where necessary.

Initial `flixie/public/sitemap.xml` after the five pages pass checks:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://www.flixie.co.uk/</loc></url>
  <url><loc>https://www.flixie.co.uk/features</loc></url>
  <url><loc>https://www.flixie.co.uk/faqs</loc></url>
  <url><loc>https://www.flixie.co.uk/privacy</loc></url>
  <url><loc>https://www.flixie.co.uk/contact</loc></url>
</urlset>
```

Include only canonical, indexable, 200 pages. Add genuinely useful trust pages and landing pages when published. Omit invite tokens, query variants, 404s and drafts. `lastmod` is optional; populate it from substantive content changes, not every build.

### Headings, semantics, images and mobile

The source has `header`, `nav`, `main`, `section` and `footer`, a real homepage `motion.h1`, labelled navigation and several labelled controls. Preserve these. Do not mistakenly report the H1 missing just because it is authored as a Motion component. The initial HTTP response, however, has no headings until rendering.

Use one clear page-level H1; H2 for main topics; H3 for cards/subtopics. Features and privacy jump from H2 to H4/H5 in places. Change visual mockup labels to paragraphs when they are not document sections. Heading order is primarily a readability/accessibility improvement, not a standalone ranking trick.

The decorative glow has alt text “Cinematic Background Glow”: change to `alt=""`. The duplicate decorative logo overlay already has empty alt and `aria-hidden`. Keep one meaningful brand label on the home link. Future real screenshots should describe the useful screen, e.g. “Flixie watchlist showing films saved for later”; never use a list of keywords as alt text.

The hero JPEG is used twice but should be network-cached; do not count that as two unique downloads. Create appropriately sized AVIF/WebP variants and `srcset`/`sizes`; use dimensions or reserved aspect ratio. Export a tightly cropped logo at sensible rendered sizes instead of loading and cropping a 1024px asset. Do not lazy-load the above-fold/LCP image; use `fetchpriority="high"` only for the measured LCP candidate. Lazy-load future below-fold screenshots with `loading="lazy" decoding="async"`. [Web Vitals definitions](https://web.dev/articles/vitals).

The stylesheet imports three Google Font families and many weights via CSS `@import`. Reduce weights/families, prefer locally served WOFF2 if licence permits, and avoid the extra import discovery chain. The existing `display=swap` is useful. Measure before adding preloads. Investigate the uncompressed 440 KB JS bundle, eager legal/FAQ views, filters and large blur effects; do not assert that the unused GenAI dependency is shipped merely because it exists in package.json.

Performance acceptance: field p75 LCP ≤2.5s, INP ≤200ms, CLS ≤0.1, separately for mobile and desktop, when enough data exists. Lab testing diagnoses causes and does not replace field data. Run three comparable mobile lab tests on homepage and first landing page; report median and environment. Test widths 320, 375, 390, 768 and 1280px, 200% text zoom, keyboard-only navigation and reduced motion. Validate no horizontal overflow, useful focus and tappable CTAs. Tiny 32px demo controls and 9–11px demo text need scrutiny; 44px touch targets are a useful design goal, not a claimed universal WCAG AA requirement.

`App.tsx` download overlay lacks a dialog role, focus trap/return and Escape handling in inspected code. Address those if retained, preferably using a tested dialog primitive. Motion has no observed reduced-motion handling. Neither colour contrast nor actual mobile overflow was measured.

Impeccable source-audit provisional scores: accessibility 2/4, performance 2/4, responsive 2/4, theming 3/4, integrity 2/4 = **11/20**, a code-review heuristic only. Integrity needs work: simulated films and “97% Social Match” sit alongside strong capability claims, and placeholder social links appear real. Detector found one gradient-text warning ([output](evidence/flixie-detector.json)); this is aesthetic and not itself an SEO defect, so no redesign is warranted. Suggested skill sequence for later work: `$impeccable harden`, `$impeccable optimize`, `$impeccable adapt`, then `$impeccable polish`; re-audit after fixes. These can be run individually or together. No full visual score or compliance certification is implied.

## 2. Homepage: exact positioning and copy

Priority P1; Impact High; Effort Medium. Title and metadata foundation can ship with P0 metadata work.

**SEO title:** Flixie: Social Movie App for Friends & Watchlists

**Meta description:** Discover films through friends, track what you watch and save your next favourites. Flixie brings movie recommendations, reviews and watch plans together.

**H1:** The social movie app for finding your next film together

**Intro:** Flixie helps you discover films through the people you know. See what friends recommend, keep a watchlist, rate what you’ve watched and make plans for your next movie night—all in one app.

**Primary CTA while beta wording remains accurate:** Join the iOS beta

**Android CTA:** Get Flixie on Google Play, if available to the visitor; otherwise “Request Android test access” with a real access process. Never silently send ineligible people to a closed listing. **Secondary CTA:** See how Flixie works → `/features`.

Recommended H2 structure and supporting copy:

| H2 | Draft copy | Contextual link |
|---|---|---|
| Discover films through your friends | A recommendation means more when you know who it comes from. See friends’ ratings and reviews, then save the films you want to try. | `/features#friends` initially; social landing page later |
| Keep your watchlist and watched films in one place | Save the films you want to watch next. Keep a record of what you’ve seen and how you rated it, so a good recommendation doesn’t disappear in a chat. | `/movie-watchlist-app` when live |
| Find recommendations that fit your taste | Explore personalised recommendations alongside suggestions from friends. Build a shortlist for your next film. | `/movie-recommendation-app` when live |
| Turn “we should watch that” into a plan | Talk about your choices in a group chat and make a watch plan with friends. Bring the film, the people and the plan together. | `/movie-night-planner` when live |
| How Flixie works | 1. Find and save films. 2. Connect with friends. 3. Choose your next watch together. Use three real screenshots with short captions. | `/features` |
| Get Flixie for your next movie night | Start your watchlist and discover what your friends recommend. Show accurate platform availability beside direct store links. | TestFlight / Google Play |

Add short visible answers: Is Flixie a streaming service? Is it free? Which platforms are available? Can I control what friends see? Answers must be verified against released app behaviour. Do not imply video streaming, synchronised playback or shared paid subscriptions when the feature is watch planning.

Replace “Elevate Your Cinematic Experience Today” with the concrete download H2 above. Simplify “Collaborative Movie Coordination” to “Plan a movie night with friends.” Check existing claims about automated compatibility, watchlist overlap, four-option voting, calendar integration, push reminders, OS requirements, monthly updates and being ad-free against the shipping app. Label mockups “Illustrative demo” or replace with real permission-cleared screenshots. A made-up 97% match must not be presented as evidence of effectiveness.

Do not hide useful explanatory text inside animated or interactive-only screens. Keep branded styling; this is a clarity and evidence improvement, not a homepage redesign.

## 3. Search intent and keyword ownership

P1 research and mapping; Impact High; Effort Low. Validate demand with Search Console after indexing and a UK keyword dataset if available. No invented monthly volumes. Lower difficulty is relative, not a promise of easy ranking. Each group has one primary destination to reduce cannibalisation.

| Group / keyword cluster | Intent | Estimated difficulty | Business value | Target |
|---|---|---|---|---|
| Brand: Flixie, Flixie app, Flixie movie app, Flixie movies | Find official product | Low–Medium: similar names complicate identity | High | `/` and official app profiles |
| Brand: Flixie download / Android / iPhone | Install or check availability | Low–Medium | High | Homepage download section; FAQs for beta access |
| Brand: Flixie support / privacy | Support/trust | Low | Medium | `/contact`, `/privacy` |
| Transactional: social movie app, movie app for friends, discover movies with friends | Find social discovery tool | Medium | High | `/social-movie-app`; homepage supports broader brand positioning |
| Transactional: movie night planner app, app to choose movies with friends | Solve a group decision | Low–Medium | High | `/movie-night-planner` |
| Transactional: movie watchlist app, shared movie watchlist | Organise future viewing | Medium–High | High | `/movie-watchlist-app`; only claim shared editing if supported |
| Transactional: movie recommendation app, film recommendation app | Get personalised suggestions | High | High | `/movie-recommendation-app`, initially focus friends/group qualifiers |
| Transactional: movie tracking app, track movies watched, app for rating movies | Record viewing and ratings | High | Medium–High | `/features#tracking` first; distinct tracker page only after evidence |
| Transactional: movie app | Broad/ambiguous; may mean streaming | Very High | Medium | Homepage secondary term, not primary near-term KPI |
| Comparison: Letterboxd alternatives for friends | Evaluate a replacement | Medium–High | High | `/guides/letterboxd-alternatives` |
| Comparison: best movie apps for couples | Choose an app by use case | Medium | High | `/guides/movie-apps-for-couples` |
| Comparison: IMDb alternatives for movie recommendations | Discovery vs database needs | High | Medium | `/guides/imdb-alternatives` |
| Comparison: best movie tracking / recommendation apps | Shortlist software | High | High | Two separate tested guides, P2 |
| Informational: how to choose a movie with friends | Practical method | Low–Medium | High | `/guides/choose-a-movie-with-friends` |
| Informational: organise a movie watchlist | Workflow help | Low–Medium | Medium–High | `/guides/organise-movie-watchlist` |
| Informational: how movie recommendations work | Explanation | Medium–High | Medium | `/guides/how-movie-recommendations-work` |
| Long-tail: choose a film when you have different tastes | Reconcile preferences | Low–Medium | High | `/guides/choose-a-film-different-tastes` |
| Long-tail: plan a movie night in a group chat | Planning workflow | Low–Medium | High | `/guides/group-chat-movie-night` |
| Long-tail: spoiler-free movie recommendations | Avoid spoilers | Medium | Medium–High | `/guides/spoiler-free-recommendations` |

Broad “best movies,” individual blockbuster titles, actors and “watch movies online” are poor early targets. They have either overwhelming competitors or the wrong intent. Generic film-title traffic is not automatically install traffic.

## 4. Dedicated landing pages

Publish only pages with distinct workflows and real proof. All should have a self-canonical, BreadcrumbList, original screenshots, platform status, relevant FAQs and direct app links. Link from `/features` and appropriate homepage sections; do not create an isolated SEO directory. CTA labels below describe the section heading; the actionable buttons must identify the real platform/beta status.

### A. `/movie-night-planner` — P1; Impact High; Effort Medium

- Primary: movie night planner app.
- Secondary: movie night app, plan a movie night with friends, app to choose a movie together.
- Intent: practical tool for choosing and coordinating.
- Title: Movie Night Planner App for Friends | Flixie
- Description: Choose a film with friends and turn your shortlist into a watch plan. See how Flixie brings movie recommendations, group chats and planning together.
- H1: Plan your next movie night with friends
- Outline: the endless-chat problem → three-step worked example → real group chat and watch-plan screens → what invitees need → planning vs streaming clarification → platform/access FAQs.
- Unique evidence: a recorded start-to-finish plan, with anonymised participants and an accurate explanation of invitations. Do not promise voting or reminders until confirmed.
- Links: `/social-movie-app`, `/movie-watchlist-app`, `/guides/choose-a-movie-with-friends`, `/faqs`.
- CTA: Start your next movie night with Flixie.

### B. `/social-movie-app` — P1; Impact High; Effort Medium

- Primary: social movie app.
- Secondary: movie app for friends, social movie discovery, discover movies with friends.
- Intent: find a film community based on personal relationships.
- Title: Social Movie App: Discover Films with Friends | Flixie
- Description: Find films through people you know. Explore friends’ ratings and reviews, share recommendations and make your next watch plan with Flixie.
- H1: Discover your next film through friends
- Outline: why a familiar recommendation helps → connect with friends → read ratings/reviews → discuss and save → privacy and audience controls → transition to watch planning → app availability.
- Unique evidence: actual friend recommendation journey, accurate visibility controls and an attributed tester quote with permission.
- Links: `/movie-night-planner`, `/features#ratings`, `/privacy`, `/guides/share-movie-recommendations`.
- CTA: Find your next film with friends.

### C. `/movie-watchlist-app` — P1; Impact High; Effort Medium

- Primary: movie watchlist app.
- Secondary: organise movie watchlist, save movies to watch, track movies to watch.
- Intent: replace scattered notes and forgotten recommendations.
- Title: Movie Watchlist App: Save Your Next Film | Flixie
- Description: Keep the films you want to watch in one place. Save recommendations, revisit your watchlist and choose your next film with friends on Flixie.
- H1: A movie watchlist you’ll actually use
- Outline: capture a recommendation → add a film → organise with supported controls → choose from your list → distinguish watchlist from watched history → screenshots → platform FAQ.
- Unique evidence: real populated list and a tested organisation walkthrough. Do not claim collaborative editing, imports or filters not shipped.
- Links: `/features#tracking`, `/movie-night-planner`, `/guides/organise-movie-watchlist`, `/guides/watchlist-vs-watched-list`.
- CTA: Start your Flixie watchlist.

### D. `/movie-recommendation-app` — P2; Impact High; Effort Medium

- Primary: movie recommendation app.
- Secondary: film recommendation app, personalised movie recommendations, recommendations from friends.
- Intent: find suitable films without endless browsing.
- Title: Movie Recommendation App for Your Taste | Flixie
- Description: Explore personalised movie recommendations and suggestions from friends. Find a film, save it to your watchlist and plan your next watch with Flixie.
- H1: Movie recommendations shaped around you and your friends
- Outline: inputs the app actually uses → example recommendation with an honest explanation → distinguish personal and friend signals → how to improve suggestions → limitations and cold start → save and plan workflow.
- Unique evidence: documented recommendation behaviour and real examples; no invented algorithm details or success rates.
- Links: `/social-movie-app`, `/movie-watchlist-app`, `/guides/how-movie-recommendations-work`, `/privacy`.
- CTA: Find your next film with Flixie.

**Consolidate initially:** `/movie-app-for-friends` would duplicate the social page; `/movie-rating-app` and `/movie-tracker-app` can be useful sections of `/features`. Do not create these merely to match keyword variants. If later launched with separate user needs, mapping and evidence, give them original pages. If duplicate variants were already indexed, use a 301 to the appropriate owner, not multiple thin pages with home canonicals. Prioritisation: P1; Impact Medium; Effort Low.

Existing `/features` title: “Flixie Features: Watchlists, Ratings & Movie Plans”; description: “Explore Flixie’s movie discovery features, from friends’ recommendations and ratings to watchlists, group chats and plans for your next film.” H1: “Find, save and plan films with Flixie.” Add real `id="friends"`, `id="tracking"`, `id="ratings"` anchors before publishing links to them.

## 5. Competitor SEO and differentiation

P1 strategy; Impact High; Effort Low. These are observed page strategies and candidate query families. Without rank/traffic tools, it would be misleading to claim exact keywords, positions or the pages driving the most visits. The “traffic mechanism” column is an inference from public pages. Verify UK results before commissioning each comparison.

| Competitor | Public evidence and landing/content types | Query families / likely traffic mechanism | Flixie response |
|---|---|---|---|
| Letterboxd | Homepage promotes diary, reviews, lists and friends; film pages and public diaries surfaced in search. [Homepage](https://letterboxd.com/), [FAQ](https://letterboxd.com/about/faq/) | Brand, film reviews, movie diary, user lists, social film discovery; UGC expands indexable content | Don't claim social movie discovery is new. Demonstrate recommendation → discussion → watch plan for an existing friend group |
| IMDb | [Top 250](https://www.imdb.com/chart/top/) has ranked titles and ratings; search also surfaced title search and chart pages | Brand, best-rated films, cast/title lookups and charts; huge entity inventory | Avoid database competition. Build useful “what should our group choose?” workflows |
| Trakt | Main site/apps fetches failed in this tool. Official [social sharing tutorial](https://forums.trakt.tv/t/share-on-your-social-networks/19082) documents check-ins and scrobbling | Tracking/integration queries and product support; public forum/tutorial pages are discoverable. Core page ranking coverage unverified | Emphasise simple planning with friends rather than an integration ecosystem; don't allege missing features without testing |
| JustWatch | [UK hub](https://www.justwatch.com/uk) links provider, new-release and title pages, with country-specific availability filters | Where-to-watch title queries and streaming provider discovery | Link to licensed, fresh availability when useful; prioritise choosing together rather than recreating a streaming catalogue |
| Likewise | Root currently redirects to [Pix Media](https://pix-media.com/). Search still surfaced old `/ask`, `/list`, `/glist`, `/movies`, actor pages | Question, list and similar-title templates are visible historically; current traffic and continuity need checking | Avoid a stale “Likewise app” comparison. A complete, stable planning guide can serve queries whose old result no longer answers the question |
| Taste.io | [Homepage](https://www.taste.io/) features taste-based recommendations, exploration, interest categories and a blog | Personal recommendation and mood/interest queries; recommendation-led acquisition | Shared preferences already exist here. Make Flixie's real-friend communication and watch-plan execution the concrete difference |

The apparent opportunity is **task completion**, not a claim that all six lack a particular feature. Test them for a real scenario: “Four friends, different tastes, 100 minutes, choose a film and agree a time.” Show tools, constraints, outcome and friction honestly. A useful comparison can recommend another product for a different need. Include tester, date, versions/platforms, pricing checked date and a clear statement that Flixie publishes the article.

## 6. Thirty evergreen content ideas

P2 backlog unless marked first wave. Impact is expected traffic-to-product value, not guaranteed search volume. Effort includes first-hand research. Every guide should answer the task before introducing Flixie, have a named reviewer, and include original examples or an actually usable resource. URLs below are proposed, not existing routes.

| # | Target keyword | Intent | Suggested title / URL | Why it could attract useful traffic | Feature link | Impact / Effort |
|---|---|---|---|---|---|---|
| 1 ★ | how to choose a movie with friends | Informational | How to Choose a Movie with Friends in 10 Minutes — `/guides/choose-a-movie-with-friends` | A timed, tested decision method solves a specific frustration | Movie night planner | High / Medium |
| 2 ★ | choose a film different tastes | Informational | Different Film Tastes? Build a Shortlist Everyone Can Accept — `/guides/choose-a-film-different-tastes` | Concrete compromise rules and worked examples | Recommendations | High / Medium |
| 3 ★ | organise movie watchlist | Informational | How to Organise a Movie Watchlist You Actually Use — `/guides/organise-movie-watchlist` | Reusable tags/shortlist routine, tested with real lists | Watchlist | High / Medium |
| 4 ★ | plan movie night group chat | Informational | From Group Chat to Movie Night: A Practical Planning Guide — `/guides/group-chat-movie-night` | Ready-to-copy planning messages and decisions | Chats/plans | High / Medium |
| 5 ★ | movie night checklist | Informational | A Movie Night Checklist for Hosts and Guests — `/guides/movie-night-checklist` | Printable checklist earns saves and relevant links | Watch plans | High / Low |
| 6 ★ | movie apps for couples | Comparison | Movie Apps for Couples: Tested Ways to Choose Together — `/guides/movie-apps-for-couples` | Original paired tests support purchase/install intent | Social discovery | High / High |
| 7 | best movie recommendation apps | Comparison | Movie Recommendation Apps Tested with the Same Film Tastes — `/guides/best-movie-recommendation-apps` | Reproducible tests beat unsubstantiated rankings | Recommendations | High / High |
| 8 | best movie tracking apps | Comparison | Movie Tracking Apps Compared: Diaries, Ratings and Sharing — `/guides/best-movie-tracking-apps` | Clear feature/price comparison serves tool selection | Tracking | High / High |
| 9 | Letterboxd alternatives for friends | Comparison | Letterboxd Alternatives for Different Kinds of Film Fans — `/guides/letterboxd-alternatives` | Match alternative to need instead of declaring a universal winner | Social discovery | High / High |
| 10 | IMDb alternatives recommendations | Comparison | IMDb Alternatives for Finding Your Next Film — `/guides/imdb-alternatives` | Distinguish discovery needs from cast lookup | Recommendations | Medium / High |
| 11 | watchlist vs watched list | Informational | Watchlist vs Watched List: What Belongs Where? — `/guides/watchlist-vs-watched-list` | Simple terminology question tied to onboarding | Watchlist/tracking | Medium / Low |
| 12 | how to track movies watched | Informational | How to Keep a Useful Record of Films You’ve Watched — `/guides/track-movies-watched` | A practical diary method with example records | Tracking | Medium / Medium |
| 13 | movie rating system | Informational | Build a Movie Rating System You Can Use Consistently — `/guides/movie-rating-system` | Original rubric and personal examples | Ratings | Medium / Medium |
| 14 | write spoiler free movie review | Informational | How to Write a Helpful Movie Review Without Spoilers — `/guides/spoiler-free-movie-review` | Before/after reviews offer real instructional value | Reviews | Medium / Medium |
| 15 | share movie recommendations | Informational | How to Share a Movie Recommendation a Friend Will Remember — `/guides/share-movie-recommendations` | Message templates and relevant context | Recommendations/chat | High / Low |
| 16 | start film club friends | Informational | How to Start a Film Club with Friends — `/guides/start-film-club` | Repeatable schedule and discussion templates | Groups/plans | High / Medium |
| 17 | film club discussion questions | Informational | Film Club Discussion Questions That Work Beyond the Plot — `/guides/film-club-discussion-questions` | Reusable facilitator resource can earn club links | Groups/reviews | Medium / Medium |
| 18 | movie night themes adults | Informational | Movie Night Themes with a Clear Way to Pick the Films — `/guides/movie-night-themes` | Curated examples plus selection rules, not an endless list | Watchlist/plans | Medium / Medium |
| 19 | low effort movie night ideas | Informational | Low-Effort Movie Nights for Busy Friends — `/guides/low-effort-movie-night` | Specific time/budget constraints | Watch plans | Medium / Medium |
| 20 | long distance movie night planning | Informational | How to Plan a Long-Distance Movie Night — `/guides/long-distance-movie-night` | Time zones, access checks and chat; separate streaming tools | Watch plans | High / Medium |
| 21 | movie choice paralysis | Informational | Stuck Choosing a Film? Try These Decision Rules — `/guides/movie-choice-paralysis` | Tested rules answer a recurring frustration without medical claims | Recommendations | Medium / Medium |
| 22 | how movie recommendation algorithms work | Informational | How Movie Recommendations Work: A Plain-English Guide — `/guides/how-movie-recommendations-work` | Diagrams and original examples; disclose Flixie's actual approach | Recommendations | Medium / High |
| 23 | improve movie recommendations | Informational | How to Get More Useful Movie Recommendations — `/guides/improve-movie-recommendations` | Compare clear inputs and results without promising accuracy | Ratings/recommendations | High / Medium |
| 24 | friends vs algorithm movie recommendations | Informational | Friends or Algorithms: Where Should Your Next Film Come From? — `/guides/friends-vs-algorithms` | An honestly reported small experiment can earn citations | Social discovery | High / High |
| 25 | spoiler free movie recommendations | Informational | Find Film Recommendations Without Reading Spoilers — `/guides/spoiler-free-recommendations` | Resource selection and safe reading workflow | Recommendations/reviews | Medium / Medium |
| 26 | family movie night different ages | Informational | Planning a Family Movie Night Across Different Ages — `/guides/family-movie-night` | Practical suitability/runtime checklist; verify classification sources | Watch plans | Medium / Medium |
| 27 | movie watchlist spreadsheet template | Tool | A Simple Movie Watchlist Template, with an Example — `/guides/movie-watchlist-template` | Free usable template meets standalone demand | Watchlist | Medium / Medium |
| 28 | clean up movie watchlist | Informational | How to Clear Out a Watchlist You’ll Never Finish — `/guides/clean-up-movie-watchlist` | Worked pruning exercise and realistic rules | Watchlist | Medium / Low |
| 29 | find films outside comfort zone | Informational | How to Find Films Outside Your Usual Genres — `/guides/discover-different-films` | Human-curated stepping stones with reasons | Recommendations | Medium / High |
| 30 | what to watch with friends under 100 minutes | Informational | Films Under 100 Minutes for a Movie Night with Friends — `/guides/short-films-for-movie-night` | Runtime constraint plus group-fit reasoning; state these are features, not short films | Watchlist/plans | Medium / High |

★ First wave: publish two per month over three months after crawl fixes. The other 24 are P2/P3 options, not commitments. Review Search Console overlap before publishing #21 alongside #1, or #28 alongside #3; merge when the same intent is already served. Film lists require watched/researched selections, verified runtimes, spoiler boundaries and rights-cleared imagery. Comparisons need periodic availability/pricing checks even though the underlying topic is evergreen. Refresh when facts change rather than changing the year in a title.

## 7. Programmatic SEO: earn the right to scale

P3; Impact potentially High; Effort High. Do not build a TMDB mirror now. Start with 10–20 manually reviewed pages once original public data exists; expand only if they attract relevant engagement and indexing is healthy. Numbers here are internal pilot criteria, not Google rules.

| Template | Decision | Unique value required | Impact / Effort |
|---|---|---|---|
| `/movies-like/[title-year-id]` | Best first experiment | Explain several recommendations using original editorial reasoning and sufficient anonymised community signals; show sample size and method | High / High |
| `/movies/[title-year-id]` | Later, selective | Original public reviews, community rating/count, group suitability discussion, honest “should I watch this?” reasoning | Medium / High |
| `/best-movies/[specific-group-or-genre]` | Curate first | Transparent criteria, human review, actual data and a useful group-selection constraint | Medium / High |
| `/genres/[genre]` | Only as useful hubs | Editorial starting points, subgenres and links to substantial pages, not an unfiltered catalogue | Medium / Medium |
| `/actors/[name-id]`, `/directors/[name-id]` | Defer | A unique discovery angle and useful film journeys beyond imported filmographies | Low / High |

Private friend ratings, group chats, watch activity and personal recommendations must not become public just to feed Google. Anonymous visitors and crawlers should see the same substantive public page. A signed-in friend overlay can add personal context, but cannot be the only unique value. Use only public/consented reviews and aggregated signals with suppression of small groups; document anti-manipulation and sample-size limitations. No fictional ratings or attribution of TMDB scores to Flixie.

Suggested publication gate: substantial original explanation; enough public contributions to avoid misleading aggregates; moderation and rights checks passed; no privacy leak; useful without login. Sparse items stay unpublished or `noindex` and out of the sitemap. Use stable IDs with human slugs; redirect old slugs, handle remakes by year, 404 truly nonexistent IDs. Avoid crawlable combinations of every genre/person/filter, empty results and search query pages. Generate sitemaps only for eligible pages; cache responsibly and update real change dates.

TMDB's current FAQ requires commercial users to arrange an appropriate licence and specifies attribution. Free access is described for non-commercial use with attribution; a revenue-oriented startup should not assume that a free consumer app qualifies. Confirm contractual coverage for public indexed pages, data/image caching, display, derivative recommendations and any exports. TMDB also states it does not own all supplied images/data, so API access is not blanket copyright clearance. Use its approved logo and required notice in credits/About. [TMDB API FAQ and attribution](https://developer.themoviedb.org/docs/faq). IMDb data has its own licensing offering; do not scrape reviews or assume permission to republish scores. [IMDb licensing](https://data.imdb.com/). Obtain provider-specific permission before publishing streaming availability and document freshness.

## 8. Metadata and structured data examples

P1; Impact Medium; Effort Low–Medium. Schema helps express entities; it does not guarantee rankings, an app panel or rich results.

Homepage head example (create the named social image before using its URL):

```html
<title>Flixie: Social Movie App for Friends &amp; Watchlists</title>
<meta name="description" content="Discover films through friends, track what you watch and save your next favourites. Flixie brings movie recommendations, reviews and watch plans together.">
<link rel="canonical" href="https://www.flixie.co.uk/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Flixie">
<meta property="og:locale" content="en_GB">
<meta property="og:title" content="Flixie: Find Your Next Film with Friends">
<meta property="og:description" content="Discover films through friends, save your watchlist and plan your next movie night.">
<meta property="og:url" content="https://www.flixie.co.uk/">
<meta property="og:image" content="https://www.flixie.co.uk/og/flixie-social.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Flixie — discover films and plan movie nights with friends">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Flixie: Find Your Next Film with Friends">
<meta name="twitter:description" content="Discover films through friends, save your watchlist and plan your next movie night.">
<meta name="twitter:image" content="https://www.flixie.co.uk/og/flixie-social.jpg">
<meta name="twitter:image:alt" content="Flixie — discover films and plan movie nights with friends">
```

Use one head entry per property, with page-specific title/description/canonical/OG URL. Do not include an invented X handle. The proposed social image should use owned brand assets and actual app screens; metadata must be available without JavaScript for reliable unfurling. Open Graph/X tags support sharing and conversion rather than directly establishing rankings.

Entity graph example: Flixie is expressed as a brand/operator identity, not a claim that “Flixie Ltd” exists. Confirm the operator's legal identity before adding legalName, address or registration details. If operated directly by an individual, represent that Person as publisher instead of implying an incorporated company. The following uses the operating Flixie organisation/brand provisionally; publish only after identity alignment with the visible About page.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.flixie.co.uk/#organization",
      "name": "Flixie",
      "url": "https://www.flixie.co.uk/",
      "logo": "https://www.flixie.co.uk/flixie-icon.png"
    },
    {
      "@type": "WebSite",
      "@id": "https://www.flixie.co.uk/#website",
      "name": "Flixie",
      "url": "https://www.flixie.co.uk/",
      "publisher": { "@id": "https://www.flixie.co.uk/#organization" },
      "inLanguage": "en-GB"
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://www.flixie.co.uk/#app",
      "name": "Flixie",
      "url": "https://www.flixie.co.uk/",
      "applicationCategory": "EntertainmentApplication",
      "operatingSystem": "iOS, Android",
      "description": "Discover films through friends, save a watchlist, rate movies and make watch plans.",
      "publisher": { "@id": "https://www.flixie.co.uk/#organization" },
      "installUrl": [
        "https://testflight.apple.com/join/RRrZjJw7",
        "https://play.google.com/store/apps/details?id=com.flixie.app"
      ]
    },
    {
      "@type": "WebPage",
      "@id": "https://www.flixie.co.uk/#webpage",
      "url": "https://www.flixie.co.uk/",
      "name": "Flixie: Social Movie App for Friends & Watchlists",
      "isPartOf": { "@id": "https://www.flixie.co.uk/#website" },
      "mainEntity": { "@id": "https://www.flixie.co.uk/#app" }
    }
  ]
}
```

Embed JSON in `<script type="application/ld+json">`. Safely serialise dynamic values, escaping `<` as `\u003c`. Keep platform status visibly accurate; TestFlight is not a public App Store listing. Once pricing is verified, an Offer with `price: 0` may describe a genuinely free download. No rating/review is fabricated here, so this example does **not** meet all Google software-app rich-result requirements. Google's current guidance requires name, offer price and a qualifying app rating or review. Add those only with genuine visible supporting content. [SoftwareApplication requirements](https://developers.google.com/search/docs/appearance/structured-data/software-app).

Add verified social profiles as Organization `sameAs`; associate the app's official store listing with the app entity. Do not reuse unrelated similarly named accounts. Once the public iOS listing is confirmed, replace the beta install URL appropriately.

Other schema decisions:

| Type | Use | Priority / Impact / Effort |
|---|---|---|
| WebPage | Each public page with its own `@id`, URL and relationship to WebSite | P1 / Medium / Low |
| BreadcrumbList | Landing pages and guides; match visible hierarchy | P1 / Medium / Low |
| Article or BlogPosting | Genuine guides, named author, actual publication/modification dates, owned image, mainEntityOfPage | P2 / Medium / Low |
| FAQPage | Optional semantics only where real visible questions/answers exist; not an SEO engineering priority | P3 / Low / Low |
| Movie | Only actual public movie pages; accurate title/date/director and attributable, visible data | P3 / Medium / Medium |

Google discontinued FAQ rich results starting 7 May 2026; do not build an FAQ-schema project expecting extra SERP space. [Google documentation updates](https://developers.google.com/search/updates). Use useful FAQs regardless. Avoid SearchAction markup for nonexistent site search.

Breadcrumb example for the planner page:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.flixie.co.uk/" },
    { "@type": "ListItem", "position": 2, "name": "Movie night planner", "item": "https://www.flixie.co.uk/movie-night-planner" }
  ]
}
```

Validate syntax and Schema.org relationships, then use Google's Rich Results Test for eligible types and Search Console URL Inspection. Valid schema and rich-result eligibility are different checks.

## 9. App SEO, linking and download conversion

Priority P1 for availability and visible links; P2 for native-link integration. Impact High; Effort Low for links, High for cross-platform native integration.

The website currently points to iOS TestFlight and Android package `com.flixie.app`. A public search result for [Flixie on Google Play](https://play.google.com/store/apps/details?id=com.flixie.app) displays “Flixie - Movies, TV & Friends,” developer “FlixieApp,” UK operator Laura Elizabeth Douglas and support email `flixieco@gmail.com`. The site uses `flixieadmin@gmail.com`. This is an identity/support inconsistency to resolve, not evidence that one email is invalid. No authoritative public iOS Flixie listing was verified; similarly named apps in search are not substitutes. A public Play listing alone does not prove open installation in every market/test track.

1. Define one availability configuration used by header, footer, homepage, modal and invite page. Check real store eligibility; choose truthful beta/public labels.
2. Put platform links in the visible hero/download section, not only a modal. On mobile prioritise the device platform while retaining the other option. Desktop can offer a QR code with the same destination and attribution.
3. Set official website/support/privacy URLs consistently in both stores. Use the same icon, brand spelling and concise positioning. Link back from website to the confirmed profiles.
4. On public iOS release, add the Smart App Banner using the actual numeric App Store ID:

```html
<!-- Replace the placeholder only after the public listing is verified. -->
<meta name="apple-itunes-app"
      content="app-id=ACTUAL_NUMERIC_APP_STORE_ID, app-argument=https://www.flixie.co.uk/">
```

TestFlight join codes are not App Store IDs. [Apple Smart App Banners](https://developer.apple.com/documentation/webkit/promoting-apps-with-smart-app-banners).

5. Implement Universal Links and Android App Links for `/invite` first, then public content URLs when those screens exist. Make each link work on web when the app is absent. Use an explicit “Open in Flixie” option where helpful; do not force redirects on every marketing visit.
6. Serve valid JSON association files with HTTP 200 and no redirects, using the confirmed Apple Team ID/bundle ID and Android production signing certificate fingerprints. The existing `apple-verification.txt` is not an AASA file. Add `applinks:www.flixie.co.uk` entitlement in iOS and verified intent filters in Android. Path-match only supported URLs. [Apple associated domains](https://developer.apple.com/documentation/xcode/supporting-associated-domains), [Android App Links](https://developer.android.com/training/app-links/about).

Android association shape (placeholder must be replaced with Play App Signing certificate, not guessed/debug key):

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.flixie.app",
    "sha256_cert_fingerprints": ["ACTUAL_PRODUCTION_SHA256_FINGERPRINT"]
  }
}]
```

AASA shape (confirm actual app identifier):

```json
{
  "applinks": {
    "details": [{
      "appIDs": ["ACTUAL_TEAM_ID.ACTUAL_IOS_BUNDLE_ID"],
      "components": [{ "/": "/invite" }]
    }]
  }
}
```

Test installed/uninstalled flows, expired invite, browser fallback and cold app start on real devices. Do not assume Universal/App Links provide deferred post-install referral continuity. An explicit referral-code recovery flow may still be needed. Do not build on Firebase Dynamic Links, which shut down on 25 August 2025. [Firebase deprecation FAQ](https://firebase.google.com/support/dynamic-links-faq).

## 10. Brand entity and company trust

P1; Impact Medium–High; Effort Medium. Establish one consistent, verifiable identity across site and store profiles. There is no guaranteed Knowledge Panel shortcut.

- `/about`: who operates Flixie, why it exists, named founder/developer, a real product screenshot, who it serves, launch/beta status, and links to official stores. Use a confirmed Northern Ireland connection if true; the Play result only establishes UK, not Northern Ireland.
- `/contact`: maintain a working support address, press contact and clear account-deletion path. Prefer a monitored domain email once configured; do not publish an unprovisioned mailbox.
- `/privacy`: retain useful data-control/deletion explanations; reconcile website analytics and actual app behaviour with the existing opt-in statements.
- `/terms`: accurate service terms covering accounts and user submissions, reviewed for the actual business. SEO copy should not invent legal rights or obligations.
- `/press`: short/long product description, permitted logos/screenshots, founder bio, contact, actual milestones and links. Keep private user data out of screenshots.
- Footer: link these pages using anchors; replace fake social icons. Link owned profiles back to the canonical domain and use consistent naming.
- Company/developer information: disclose the actual legal operator and applicable business details. Do not invent “Flixie Ltd,” a company number, address or a local office for SEO. No location landing pages or local-business profile unless there is a real qualifying business presence.

## 11. Backlink plan for a small startup

P2; Impact Medium–High; Effort High as ongoing founder/editorial work. Aim for 5–10 carefully researched pitches per month and a small number of genuinely relevant placements; these are activity goals, not promised results. No outreach was sent.

| Target type / starting prospect | Specific angle | Evidence needed | Impact / Effort |
|---|---|---|---|
| UK regional technology: [UKTN](https://www.uktech.news/) has a Northern Ireland section | Local independent founder tackling group film indecision | Confirmed regional connection, product demo, real milestone and founder interview | High / Medium |
| Irish technology/startup coverage: Silicon Republic, prospect to verify before pitching | Small-team product story: what user testing changed about social recommendations | Original lessons, numbers with denominators, clear launch status; site fetch was blocked here | Medium / Medium |
| NI film networks: Northern Ireland Screen / Film Hub NI, prospects to verify | Partner with a real film club on a “choose our next film” pilot | Genuine partner, agreed public case study and usable planning resource | High / High |
| Film/entertainment blogs with relevant recent coverage | A tested film-club planning kit or editorial guide to choosing across tastes | Original checklist, examples and permission-cleared screenshots | Medium / Medium |
| Independent Android/iOS app reviewers | Hands-on review of the full friend-to-watch-plan journey | Public installation or legitimate review access, clear limitations; don't demand favourable coverage | High / Medium |
| Indie developer communities | Transparent build and beta-learning retrospective | Actual decisions, challenges and outcomes; disclose founder affiliation | Medium / Medium |
| University film societies and local clubs | Co-create a repeatable film-night resource | A useful contribution and permission to publish the case study | Medium / High |

The regional names are researched starting points, not confirmed editorial acceptance or partnerships. Check the current editor, recent relevant articles and submission route before contact. A film blogger who reviews new releases may have no interest in app news; pitch a resource their audience would actually use.

Three pitches worth earning:

- “We tested three ways of choosing a film with small groups.” Publish the protocol, anonymised results, group count, date and limitations. Never claim a representative national survey from a beta cohort.
- “How one film club moved from a stalled group chat to a repeatable film night.” Let the club describe its experience; provide a resource other clubs can reuse.
- “Why a UK indie developer built watch planning into a movie app.” A founder story works when grounded in user observations and a working demo, rather than generic launch claims.

Create the original resource first, approach relevant people with a concise specific pitch, follow up once if appropriate and record outcomes. Avoid paid followed links, mass directory submissions, fake reviews, reciprocal-link schemes and promotional spam in movie communities. Sponsorship should be disclosed and appropriately qualified; the goal is relevant audience and reputation.

## 12. Measurement: distinguish visits, clicks and installs

P1; Impact High; Effort Medium; P2 attribution integration Effort High. No account configuration was changed.

### Search Console

Create/verify a **Domain property for `flixie.co.uk` using DNS**, covering www/non-www and protocols; optionally add the www HTTPS URL-prefix property for focused reporting. Submit the corrected sitemap once live. Inspect homepage and each landing page: fetch successful, rendered content present, indexing allowed, declared and Google-selected canonical consistent. Check Pages, sitemap processing, manual actions and security issues. Request indexing for the small initial set; do not treat that as a guarantee. [Search Console property setup](https://support.google.com/webmasters/answer/34592).

Baseline: latest available 28 days and preceding 28 days, with UK and all-country views, mobile/desktop split, and query/page exports. Track impressions, clicks, CTR, average position and landing pages. Segment brand using case-insensitive `flixie` matching; refine misspellings only when they demonstrably mean this brand. Do not casually group “flixi” or “flixy” competitors with Flixie. Query totals may omit anonymised queries; reported non-brand is not a perfectly complete count. Focus on page/query clusters, not daily rank movement.

### GA4 and Firebase

Use the existing Firebase-linked GA4 property if appropriate, adding a web stream for the site and retaining correct app streams. Confirm account ownership and current consent implementation before enabling collection. The inspected privacy copy explicitly promises optional analytics and no account linkage: the measurement design must preserve those promises. Do not introduce User-ID stitching or send watch history, messages, usernames, movie titles or referral codes. [GA4 website/app measurement](https://support.google.com/analytics/answer/10089681).

| Event/report | Where | Parameters / definition | Purpose |
|---|---|---|---|
| `page_view` | Website | Sanitised canonical path, page title; exclude `/invite` query strings | SEO landing-page use |
| `app_store_click` | Website | `store`, `landing_page`, `placement`; no raw referral query | Outbound download intent |
| `first_open` | App/Firebase | Existing consent-compatible automatic app event | First observed opening, not proof of download source |
| onboarding completion, if instrumented | App | Coarse non-identifying event only | Acquisition quality |
| Search Console performance | Search | Query/page/country/device | Branded and non-branded discovery |
| Store campaign/acquisition report | Store consoles | Campaign plus available installation measures | Attributable store outcomes |

Mark `app_store_click` as a GA4 key event, labelled as a click. Use organic landing sessions as the denominator for website click rate; count unique sessions with at least one store click to avoid inflation from repeats. Keep sessions/events/users distinct. If client navigation stays, choose either automatic history tracking or deliberate virtual page views and verify no duplicates.

Example event call inside the store-link handler, **only after analytics consent and tag initialisation**:

```js
window.gtag?.('event', 'app_store_click', {
  store: 'google_play',
  landing_page: '/movie-night-planner',
  placement: 'hero',
  transport_type: 'beacon'
});
```

This snippet assumes consent is enforced by the caller; optional chaining is not a consent mechanism. Navigation must still work if analytics is blocked. Avoid unbounded URL parameters and automatic capture of invite-code URLs; disable/redact affected automatic collection before enabling it.

### Store attribution

Android: encode an explicit `referrer` value in the Google Play URL and implement the Play Install Referrer API in the app. `pcampaignid=web_share` alone is not a Flixie landing-page measurement plan. For a consented session whose acquisition is known to be Google organic:

```js
const referrer = new URLSearchParams({
  utm_source: 'google',
  utm_medium: 'organic',
  utm_campaign: 'seo',
  utm_content: 'movie-night-planner'
});
const play = new URL('https://play.google.com/store/apps/details');
play.searchParams.set('id', 'com.flixie.app');
play.searchParams.set('referrer', referrer.toString());
```

Do not hard-code “google / organic” for every visitor. If acquisition is unknown, use `flixie_website / referral` and report it as website-origin rather than SEO. Preserve a coarse landing identifier only when allowed; don't place personal tokens in campaign values. [Google Play Install Referrer](https://developer.android.com/google/play/installreferrer).

iOS: when public, generate App Store Connect campaign links per landing-page group and compare app units/available conversion measures in store analytics. Apple reporting has privacy/volume limitations, and this does not deterministically connect every organic web visit to an install. TestFlight needs beta-funnel reporting rather than pretending it is public store acquisition. [Apple campaign links](https://developer.apple.com/help/app-store-connect-analytics/acquisition/campaign-links).

Report monthly: non-brand search clicks → organic landing sessions → store-click sessions → store-attributed outcomes where available → consented onboarding outcomes. Do not multiply disconnected event totals into a claimed user-level funnel. Show unknown/unattributed installs separately; web clicks and Firebase first opens cannot by themselves establish SEO downloads.

### Success criteria

First 2 weeks: valid crawl files, correct redirects/statuses, anchor discovery, initial HTML content and no broken download destinations. First month: intended pages submitted and index status explained, reliable click events, baseline recorded. Months 2–3: broader relevant non-brand query coverage and engaged/store-clicking visits to the first landing pages. Set numeric growth targets only after a real baseline; zero-to-small traffic makes percentages misleading.

## 13. Prioritised implementation roadmap

This consolidates the recommendations above. Dependencies matter more than mechanically following a calendar.

| Priority / timing | Work package | Impact | Effort | Completion evidence |
|---|---|---|---|---|
| P0 — immediately | T1–T2: real robots and XML sitemap | High | Low | 200, correct body/MIME, XML parses; sitemap fetch succeeds |
| P0 — immediately | T4: bare domain → HTTPS www at host/edge | High | Medium | Single intended redirect preserving path/query; no `/lander` journey |
| P0 — immediately | T3: explicit real 404s and not-found route, coordinated with rendering | High | Medium | Invented route returns 404; valid routes still 200 |
| P0 — immediately | T5/T7: anchor navigation, canonical/title/description registry | High | Medium | Public URLs discoverable through anchors; no home canonical on other pages |
| P1 — this month | T6/T13: statically rendered public pages and visible initial content | High | High | View source contains useful H1/copy/links/head; no hydration regression |
| P1 — this month | T11: truthful platform availability, direct download links and beta labels | High | Low | UK device/account tests reach correct install/access flow |
| P1 — this month | Homepage copy and real screenshot evidence | High | Medium | All claims traced to shipped behaviour; clear friends-to-plan journey |
| P1 — this month | T8: social metadata and entity graph | Medium | Low | Image URLs resolve; schema validates; previews show correct page |
| P1 — this month | T9: noindex invite and eliminate fallback on verification files | Medium | Medium | Invite excluded from sitemap and noindex served; missing files are 404 |
| P1 — this month | T10/T15: About, Contact, Terms, consistent operator/social/store identity | Medium | Medium | Verified profile links, contact works, visible truthful operator information |
| P1 — this month | Performance, semantics, modal and responsive source findings | Medium | Medium | Mobile/keyboard checks and before/after lab report; no fabricated CWV score |
| P1 — this month | Search Console and consent-aware website click measurement | High | Medium | Verified property, accepted sitemap, debugged events and baseline |
| P1 — this month | Planner, social and watchlist landing pages, in that order | High | High combined | Each unique, linked, indexable and supported by real product evidence |
| P2 — next 3 months | First six evergreen guides; investigate query overlap before further articles | High | High | Original resources, named review, contextual feature links and performance review |
| P2 — next 3 months | Recommendation page and carefully tested comparisons | High | High | Clear evidence for recommendation behaviour and fair comparison methodology |
| P2 — next 3 months | Press resources and targeted film/tech/community outreach | Medium | High | Useful published resource, relevant pitches and resulting referrals/mentions tracked |
| P2 — next 3 months | App Links/Universal Links and store attribution | High | High | Verified domains, device fallback tests, attributed/unknown outcomes separated |
| P2 — next 3 months | Real screenshots, share image and controlled font/image delivery | Medium | Medium | Correct dimensions/formats; measured transfer and rendering improvement |
| P3 — longer term | Remaining content backlog based on actual demand | Medium | High ongoing | New work answers unmet intent instead of expanding duplicates |
| P3 — longer term | Licensed, moderated original-data programmatic pilot | High potential | High | Rights/privacy gates met; 10–20 useful public pages; demand validated before scale |
| P3 — longer term | Optional FAQ semantics; actor/director pages only with distinct value | Low | Medium–High | No expectation of FAQ rich results; no thin catalogue expansion |

### Release verification checklist

- Fetch raw HTML for every public route: meaningful content, exactly one title/description/canonical, correct robots policy and genuine anchors.
- Fetch robots/sitemap/association files with correct MIME and parse them; requests must never be rewritten to the homepage.
- Test HTTP/bare-host and slash/alias redirects with representative paths and queries, including invite links. Keep required association endpoints direct.
- Request random unknown paths, missing images and invalid IDs: real 404, no homepage masquerade.
- Test known marketing links, mobile menu, download links, app availability and accessibility of any modal.
- Run relevant build/type checks after implementation; they were not needed for this documentation-only deliverable.
- Validate structured data, use Search Console live inspection and recheck reported canonical/index status after crawling.
- Verify analytics consent-off sends no unintended data; consent-on sends one clean event; invite codes never appear in reports.
- Record a mobile lab baseline and later field CWV where data exists. No rankings or score guarantees.

Highest-return first sprint: repair the canonical domain, crawl files, missing-page handling and navigation; get visible static page content in place; make the beta/download journey accurate. Then invest in the planner page and a genuinely useful choosing-with-friends guide.
