# Flixie in the browser

This extends the existing React/TypeScript/Vite marketing website and Azure static routes. It uses the same Firebase identity and Flixie backend. It uses the existing Azure hosting and backend; no second database or hosting migration is introduced. The user authorised publication on 15 November 2026 so they can test on their phone and laptop. No production fixtures are deployed.

**Current authentication status —15November2026:** Google and Apple website sign-in are both confirmed working for existing accounts. The user explicitly confirmed Apple sign-in returned to their existing profile, watchlist and diary. Earlier deferred/unverified Apple notes are historical and superseded by this confirmation. This verifies the reported existing-account journey; it does not assert a new-user Apple registration or additional browser/domain coverage. Consumer frontend/cinema publication remains separate.

## Local preview

Start the existing backend/database/Firebase emulators following the backend’s local guide. Auth is on 9099, API on 3000, project `demo-flixie-local`. From the backend run `npm exec tsx scripts/seed-dev-web-app.ts` (or `-- --dry-run` for preflight). It refuses production and identity collisions; reruns preserve fixture activity, removals and Auth sessions.

From this website run `npm ci` then `npm run dev`. Open http://127.0.0.1:5174/app and use the fictional `dev_web_alex` / `FlixieLocal1!` account. Jamie shares publicly; Robin is a private friend. Fixture changes stay local. Development refuses a non-loopback API and uses the emulator, independently of production environment variables.

## Connected scope

- Email/username password sign-in; Google/Apple Firebase popup wiring (disabled locally; production readiness below); registration, reset email, current terms acceptance and sign-out.
- Home, movie/TV watchlist save/remove, private film diary logging with date/rating/recommendation/notes/cinema, mood/time picks, next aired TV episode progress, friends’ activity and Watch Plans (including creation/invitations from picker results).
- Public movie/show metadata, separately projected public reviews, spoiler reveal, regional stream/rent/buy options and existing app deep links.
- Mobile choices/confirmations use bounded, scrollable native dialog bottom sheets. Full 2:3 posters, Manrope, 14px body, wordmark/Pip and each user’s awarded/selected badge border are retained.

The plan page shows existing plans; picker results can create a plan and invite friends as described in the dated extension below. Full plan editing, chat, games and full native-app parity remain outside this browser slice. Existing native app routes and association files are retained.

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

Production now defaults to the existing registered FLIXIE Web App’s public SDK settings in `src/web/firebasePublicConfig.json` (project `flixie-9a8eb`). Optional `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_AUTH_DOMAIN` and storage-bucket build values still override those defaults. No administrator/provider signing secret belongs in the browser. The initial14November audit found missing production Firebase values; the registered public configuration corrects that initialization gap on15November without depending on an untracked env file. Development remains isolated on its Auth emulator/local backend. `VITE_FLIXIE_API_URL` optionally overrides the existing HTTPS backend. Real provider verification status is recorded in the dated rollout below.

The backend public-review endpoint must be released before the website uses it in production. No schema migration is required by these additions. Preserve unrelated backend working-tree changes when preparing a release.

## Checks

`npx tsc --noEmit`, `npm run build`, `npm run check:web`, `npm run check:seo`, `npm run check:analytics`. Backend: `npm run typecheck` and `npm test -- src/services/webPublicReviews.test.ts`. Browser checks use only fictional local accounts. Do not run the full Flutter regression suite for these website changes.

Assets under `public/web` are existing Flixie assets from the Flutter repository (Manrope, Pip, F icon and Christmas frame). `terms.html` preserves the six sections of `lib/core/legal/terms_of_use_screen.dart` (effective 16 September 2026). TMDB portrait URLs are supplied by public catalogue metadata; no generated poster artwork is used.

### Browser regression: save before sign-in

Using only a fictional local account: sign out, open `/shows/15621`, choose Save to watchlist, and sign in as Alex in the sheet. Expected: the sheet shows account loading while the profile resolves, stays on The Newsroom, closes after authentication and changes the title action to In your watchlist. The watchlist must include the show after a reload. Verified locally; this guards the pending-save handoff across the Firebase identity change. Also verify sign-out removes the diary, friends and plans from view, and that a public spoiler review renders its body only after Show review.

Final local evidence: the guest-save journey added The Newsroom to Alex’s watchlist (6 → 7) while retaining `/shows/15621`; it returned to the same page with In your watchlist. The final Home preview includes the saved show and the diary/episode changes. Runtime auth module edits caused a transient Vite hot-refresh context error and a development backend restart interrupted one request; a full reload recovered, and the completed journeys above were then verified. These are local development events, not passing production-device tests.

## Movie preview expansion (14 November 2026)

The title page now includes private Friends opinions, cast portraits with actual characters, and a public still/poster gallery before the app download prompt. The gallery opens the dark lightbox described below, preserving full artwork and supporting Previous/Next, Left/Right, Escape and focus restoration. Its original bottom-sheet presentation was superseded by the user's darker-viewer request. Portrait/still rails support keyboard and touch scrolling; additional cast and thumbnails can be revealed on demand. Loading, retry, empty and missing-photo states use the existing components and tokens.

Public metadata uses existing `GET /movies/:id/credits`, `/movies/:id/images` and equivalent `/shows` routes without bearer credentials. Private Friends use authenticated `GET /movies/:id/friend-recommendation` or `POST /shows/friend-recommendations` with `{showIds:[id]}`. These endpoints resolve the actor from the token, filter both-way blocks/deactivation and retain `profileBadges`. No legacy caller-supplied `userId` activity route is used. Only watched/rating/explicit positive recommendation signals are projected; unmarked `reviewSnippet` text is discarded. Invalid/mismatched title responses fail rather than showing another title’s friends. Guests never request private friends, and component state is keyed to the account/title.

The guarded website seed adds consistent Obsession watch-entry, legacy watched and linked rating rows for fictional Jamie (9, recommends) and private Robin (6, no inferred dislike). Existing fixture edits/removals remain untouched on reruns. No real account, public-review sharing choice or production data is changed.

Focused regressions cover cast order/identity/portraits, gallery type/deduplication/unsafe URLs, friend badges/spoiler omission/explicit evidence, unauthenticated public media requests, guest denial and film/show endpoint scoping. Existing backend `watchlistViewing` and `friendRecommendationBatch` tests verify the reused privacy and badge projection. No schema migration or new backend route is part of this expansion.

Expansion verification: 18 frontend regressions and five reused backend friend projection/auth tests passed, plus TypeScript, build and the existing SEO/HTTP checks. Browser checks at 320/390/1024/1440px and the actual 1559px window verified the signed-in/guest surfaces, poster switching, original/next/keyboard-next image navigation, Escape and focus restoration, sign-in from Friends, and revealing 10→30 cast members / 6→18 thumbnails. The independent extension review returned ship for the supplied local light-theme capture set; design documentation confirmed an ordinary extension of the incumbent system. No dark/physical-device claim or publication is implied.


## Watch Plan visual refinement (14 November2026)

The user explicitly rejects bottom sheets for Watch Plans. `WatchPlans.tsx` now
owns the shared poster-led Home/list card and the centred detail modal. It reuses
Sheet with `presentation="modal"` and a scoped class; heading/footer stay visible
while content scrolls. Desktop facts sit beside the full portrait poster; phone
facts/people reflow, with each member's own avatar/border and profile link. Film
art/title open its page and route changes dismiss the old preview. Existing
Escape/focus restoration remain. Plan editing, invites and chat remain in the app.

The existing authenticated GET is unchanged. Its explicit model retains selected
film, confirmation/proposed changes,cancellation,dateOnly and participant response
so the UI does not invent confirmation,time or attendance. Date-only UTC calendar
semantics match the backend and never render a clock time. Unknown dates/places,
shortlists and unanswered invitations have honest labels. This is a presentation
extension, with no backend/schema/fixture write or deployment.

`.impeccable/review/watch-plans/` contains nine valid desktop/tablet/phone/landscape/
200%-text captures,centering/overflow measurements and focused validation logs.
All55 web regressions,TypeScript,build33,SEO27 and HTTP checks pass. Physical
devices,other themes and full assistive-technology coverage remain release checks.


## Favourite film and TV ranking (14 November 2026)

On You → Favourites, each owner shelf has Edit ranking. `FavouriteRankingEditor`
uses the shared centred native dialog variant on desktop, tablet and phones,
numbered full 2:3 posters, 44px move arrows, live move announcements and retained
keyboard focus. Save/Cancel remain outside the bounded scrolling body. Small
screens and enlarged text reflow controls; Cancel/Escape discard the draft and
restore trigger focus. Other members' shelves expose no editing actions.

Opening loads `GET /users/:ownerId/movie/favorites` or `/show/favorites` through
the existing authenticated API. The editor keeps favourite-record string IDs
separate from numeric catalogue IDs. Save preflights exact current membership,
rechecks the opening Firebase/database identity, then sends the complete order
to existing `PUT /users/:ownerId/movie/favorites/update-rankings` with `{movies:
[{id:recordId},...]}`, or the equivalent show route with `{shows:[...]}`. It
validates the returned membership, order and one-based ranks before success and
profile refresh. A membership change blocks saving until explicit reload. Same
membership concurrent rank edits remain last-write-wins as in native; native
writes are not atomic. A network-failed mutation is never automatically retried;
the retained draft permits an explicit idempotent retry. No favourite add/remove,
backend schema/runtime change or production write is introduced.

Existing fictional Alex has four films and four shows. Both types were moved,
saved, reloaded and restored through the real local editor. Cancel left the saved
order intact; Jamie's profile had no ranking controls. The evidence packet is
`.impeccable/review/favourite-ranking/`: nine valid desktop/tablet/phone/landscape/
200%-text captures, measurements, focused regression record, detector and review.
All 62 web tests (including 7 ranking regressions), TypeScript, build 33, SEO 27 and
local HTTP checks pass. This React-only change does not require a native Patrol
run. Physical-device, dark-theme and full screen-reader checks are not claimed.


## Favourites, show episodes and Pick for Us (14 November 2026)

Own title hearts and profile Add films/Add shows/Remove controls use the native
favourite APIs. Add search is a centred protected dialog with full posters and
distinct film/TV filtering. The singleton bulk POST `/users/:ownerId/movies/favorites`
with `movieIds`, or shows equivalent with `showIds`, imports missing catalogue
metadata and preserves existing ranks; DELETE uses `/users/:ownerId/:kind/favorite/:mediaId`.
Fresh favourite GET, identity assertions, the 10-per-type limit, duplicate-state
no-ops and acknowledgement checks guard changes. Interrupted writes are never
automatically repeated. Saved profile shelves/rank controls refresh; friends
remain read-only. Existing fictional Alex's four-film/four-show baseline was
restored after real add/remove/reload/search journeys.

Show pages read the existing complete show projection for seasons/episodes,
with current token-owner `userId` only for personal progress. Guest reads include
no bearer or `userId`. Episode titles/stills/descriptions stay behind spoiler
controls for unwatched episodes. Season selection, date/runtime, unknown/future
release states and empty/retry cases use real data. Aired episodes support
identity-bound PATCH watched/unwatched with `recordWatchDate:false`, verified
owner/show/episode/state acknowledgement and refreshed progress. Specials stay
details-only because the existing backend requires season >= 1. No new backend
import/progress route or fictional watch date was added. Succession S1E1 was
marked watched, reloaded and restored unwatched; all four seasons were checked.

Home's primary Pick for us tonight action opens the centred picker. It reads
existing profile friends and accepted own groups (2–12 members), preserving every
avatar/border, then sends exactly solo/friendId/groupId scope to the existing
`/recommendations/pick-for-us`. Mood/time, home/cinema, together/separately,
optional request, rewatches/rentals/content avoidance use that contract. Results
show sourced reasons and checked regional subscription/free/ads/rental labels;
unavailable checks and limited searches stay explicit. A real Alex+Jamie request
returned choices and View film opened Raya with the old dialog removed. Alex has
no local eligible group, so group projection and request scope have regression/
source evidence, not a claimed live group result. No group was created/invited.

Shared desktop/tablet `.fx-sheet` is centred from 641px, bounded to the viewport
and scrollable. Generic mobile choices may use bottom sheets; rating, ranking,
Watch Plans and protected search/picker retain all-device centring. This is the
latest explicit website preference and supersedes older desktop-sheet guidance.
Native app conventions remain unchanged.

`.impeccable/review/website-library/` records fourteen final desktop/tablet/phone/
200%-text captures, actual fixture journeys, measurements and validation: 71 web
regressions (nine new), TypeScript, build 33, SEO 27 and local HTTP pass. Seven
scoped detector advisories refer only to existing palette literals; the new
rules use existing tokens. Desktop watch-options/sign-in centring and guest
sign-in gating were checked; signup, physical devices, dark theme, live screen
readers and exhaustive concurrency/offline scenarios are not claimed. No native
UI/backend runtime/schema change or deployment occurred.


## Create a Watch Plan from a pick —14November2026

Every result now has Create Watch Plan. The protected centred composer replaces
the picker, preserving the selected film and friend/group scope. Choose up to20
friends or an existing accepted group, or save a solo plan; add optional date,
local time, home host/cinema venue/separate viewing. Explicit Create plan & invite
sends native POST /watch-plans with arranged=false and a stable UUID. Backend
current-terms, friendship, group and block policy remain authoritative.

Invitations stay pending and plan cards say Awaiting replies. The saved preview
retains actual member responses/borders and host, and Home/Plans refresh. Members
can join/decline in the existing app. A first definitive rejected request allows
correction; an uncertain response freezes the exact id/payload, including after
a later rejection, offering Retry same plan or Check Watch Plans. No automatic
network repeat. Date-only values retain UTC calendar components/no invented time;
timed values convert local inputs to UTC and reject past or invalid local times.

Live local test created Raya and the Last Dragon for Alex, inviting fictional
Jamie and Robin on16Nov2026 at20:30 London, Jamie hosting. One saved plan and
exactly one PLAN_INVITED inbox entry per recipient were verified; emulators skip
device pushes. The plan remains in local fixtures for review. No real invitations
or production writes. There is no eligible local group: group payload/privacy/
notifications have API/service tests, and the empty-group UI is live.

79 focused web regressions, TypeScript,33-page production/SSR build, SEO27/local
HTTP and28 reused backend invitation/policy/schedule checks pass. Bounded desktop,
320/390px phone,768px tablet,200% source-owned browser text and enlarged landscape
checks are recorded in .impeccable/review/plan-creation/. Short-height composers
scroll as a whole so enlarged headers/footers cannot consume the body. No physical
device, hardware screen-reader, dark composer or real offline/concurrent UI claim.

The three mobile navigation options remain a historical interactive comparison.
The user subsequently selected bottom tabs; the website now implements Home,
Watchlist, Diary, Friends and Plans on phones, with profile in the header and the
sidebar retained on wider screens.


## Community rating wording —14November2026

The primary title label is Community rating for either existing score source;
cards use community instead of a source-branded caption. Native About this rating
disclosure reveals provenance on demand, with a44px target and no popup/modal.
A selected Flixie score explains its20-rater threshold. Wider-community fallback
explains TMDB supplies it and can include Flixie ratings shared through existing
movie/show mirrors; upstream updates may take time. The displayed average/count,
20-rater rule and backend remain unchanged; no averages or vote counts are added
together. Missing scores remain No rating yet. Two rendered-component regressions
verify the neutral primary label, opt-in source information, actual count and
empty state. The same label and optional fictional-source info appear in the
separate navigation comparison; that design remains unselected.


## Public URLs needed by app and store review — 14 November 2026

Keep these independent of the guest/personalised homepage and all `/app/*` auth rules:

- `/privacy`: existing native in-app privacy URL; public policy and deletion/retention information. Stable anchor `/privacy#account-deletion`.
- `/contact`: public app support and account help. `/contact#account-deletion` goes directly to the existing email deletion-request pathway; no app install or sign-in is required to reach it.
- `/terms`: first-class prerendered Terms of Use, preserving the existing16September2026 native/web wording and version. Old `/web/terms.html` redirects301 to `/terms` after publication. Sign-up and both footers use the clean URL.
- `/.well-known/apple-app-site-association` and `/.well-known/assetlinks.json`: app link association resources must remain public JSON with the existing IDs.

Read-only live audit: `/privacy`, `/contact`, both association files return200. The new web sign-up's `/web/terms.html` URL currently returns404 on the live corporate site. The public Terms route and legacy redirect are prepared locally only; do not claim the production gap is fixed until deployment is authorised and the published endpoints are checked. App Store Connect / Play Console URL fields were not read or changed; their final values still need matching against these public resources. Existing Google deletion link can point directly to `/contact#account-deletion` or the prominent privacy anchor. No deletion request was sent, account removed or agreement accepted during verification.

`scripts/check-http.mjs` asserts anonymous200 document responses (without password gates), deletion anchors/request email, complete Terms headings/effective date, legacy redirect and association JSON. This checks reachability/link contracts, not legal adequacy or store approval. No root-route change is included in this link work.

Custom mobile app-install prompts are suppressed on Privacy, Terms and Contact/Deletion pages so people can read documents and reach support without a download interruption. Normal website discovery retains its existing download prompts.


## Google and Apple web sign-in readiness — 14 November 2026

Current status: **not production-verified or ready**. `auth.tsx` has the real Firebase `signInWithPopup` wiring for Google and Apple, but deliberately refuses federated sign-in when `config.local` is true. The preview now visibly disables those two buttons and directs testers to the fictional demo email/password. The guard remains intact; no production identity provider was contacted or configured during this read-only audit.

The current production build lacks required `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_PROJECT_ID`, and `VITE_FIREBASE_AUTH_DOMAIN` values. No ready state is inferred from buttons rendering. Configure the existing Firebase project’s consumer Web App in the deployment build; verify enabled Google/Apple providers and authorised website domains. Apple web additionally requires its actual registered Services ID, website/app association and exact Firebase return URL in Apple Developer/Firebase configuration. Native Apple sign-in working does not establish web readiness. No new credentials, authorised domains, cloud auth deployment or production settings were created or changed.

Release verification still requires real Google and Apple browser round trips on the actual website domain, existing-user account continuity, new-user profile/unchecked Terms completion, cancel/popup-blocked recovery, and mobile Safari/Chrome behavior. Provider sign-in must not create a Flixie profile before the user explicitly completes the existing Terms form. Social OAuth, reset-email delivery and real-account writes remain unverified. The local tested sign-in route is email/password with fictional fixtures. These are implementation-readiness limits, not claims of store approval.

### Existing admin Firebase setup — checked 15 November 2026

The user notes Firebase is already set up for `admin.flixie.co.uk`. A read-only request to its public Hosting configuration confirms project `flixie-9a8eb` and auth domain `flixie-9a8eb.firebaseapp.com`. Its public Auth project configuration lists `localhost`, `flixie-9a8eb.firebaseapp.com`, `flixie-9a8eb.web.app`, `admin.flixie.co.uk` and `flixie-admin-9a8eb.web.app` as authorised domains. Neither `www.flixie.co.uk` nor `flixie.co.uk` is currently listed.

Reuse the existing Firebase project and its identities for the consumer website. A second identity database is unnecessary; the registered Web App values and website-domain authorisation still need supplying and verifying. The public lookup does not prove Google/Apple provider enablement or Apple's web Services ID/return URL setup. No Firebase console setting, provider, domain or deployment was changed. The bounded, key-free audit is `.impeccable/review/auth-readiness/firebase-public-audit.json`.


## Movie search discovery — audit and proposed next steps, 15 November 2026

The user wants people searching for a film on Google to discover Flixie. This is an ongoing search-discovery objective, not a promise of ranking or permission to publish thousands of pages. The audit and recommendations below do not change the root route, indexing/privacy rules or public website deployment.

Live audit: robots.txt allows crawling, but sitemap.xml contains15 URLs and zero movie/show URLs. /movies/348 returns200 with the generic title “Open a Shared Title in Flixie”, no Alien content and the HTTP X-Robots-Tag:noindex. That shared-link destination is currently unsuitable for a movie-search landing page. Read-only evidence is retained in .impeccable/review/auth-readiness/flixie-live-seo-audit.json.

Prepared locally:34 prerendered pages,28 sitemap URLs, including6 films and2 shows from a finite reviewed public catalogue. These title pages have actual visible film content, unique title/description, canonical URL, Movie/TVSeries and breadcrumb data, public catalogue links and working signed-out discovery. Other arbitrary title IDs still use the dynamic noindex fallback; the complete backend catalogue is not currently an indexable website catalogue. These facts are separate from the live-site audit.

Recommended order (proposal, not implemented or published):

1. Publish and verify the completed public title pages when the website release is authorised. Inspect a film and a show in Search Console, confirm the rendered page and canonical, submit the canonical sitemap and measure indexing. The old shared-link routes and mobile deep links must keep working. Google documents crawling/rendering/indexing requirements for JavaScript sites: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics .
2. Expand the finite public catalogue initially to roughly100 complete, useful films/shows already supported by Flixie, prioritising current interest and the titles people actually seek. Keep the current React/Vite prerender approach for this first expansion; automate bounded metadata refresh, completeness checks and sitemap generation. Consider request-time server rendering when catalogue size/freshness justify the additional hosting work. Do not mark every incomplete generic fallback indexable. Add real internal discovery paths so catalogue pages are linked, not solely listed in XML. Sitemap guidance: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap .
3. Make the pages useful beyond a copied synopsis: clear film/year identity, cast/director links, UK viewing options with accurate region/freshness/cost distinctions, deliberately public community reviews and related discovery. Target concrete searches such as “where to watch Alien in the UK” and “Alien reviews”; a bare film-title search is a longer-term competitive goal. Review any public-review prerender/cache design against consent changes, blocks and spoiler presentation before implementing it. Preserve private diary/friend/inbox/plan/profile noindex boundaries.

Example proposed title: “Alien (1979) – Reviews & Where to Watch | Flixie”. This is proposed copy, not a claim that the page will rank for every query. Do not create fake reviews, misleading availability claims, duplicate country pages or a bulk catalogue of empty pages. Existing numeric URLs can remain canonical; descriptive slugs are optional and would need redirects, not a prerequisite for discovery. Google’s starter guide supports useful content, accessible links and descriptive titles, with ranking changes assessed over time: https://developers.google.com/search/docs/fundamentals/seo-starter-guide .

Current Movie/TVSeries structured data describes public title facts. Do not add aggregateRating from the wider-community/TMDB fallback as though it were a new independent Flixie review aggregate. Review snippet markup has separate requirements, including visible matching reviews and no aggregation of ratings from other websites; check the actual independently collected Flixie reviews before any future markup. Main product wording remains Community rating, with source information on demand. https://developers.google.com/search/docs/appearance/structured-data/review-snippet .

Measure non-brand movie queries, indexed canonical title URLs, impressions/clicks and arrivals that proceed to discovery/sign-up. Search Console ownership/access and current query data were not inspected or changed; no indexing submission, external outreach, new content campaign or scheduled catalogue job was performed. Best next step: get the public title-page release live and validate it, then expand the catalogue. No change to the current corporate/information-page proposal is implied.


## Requested Firebase website setup — 15 November 2026

The user authorises adding `www.flixie.co.uk` and `flixie.co.uk` and getting Google/Apple sign-in working. Both domains were added to project `flixie-9a8eb` through the authenticated official Firebase CLI client, preserving all five existing domains. Google and Apple were already enabled; Apple has Services ID `com.flixie.web` and team/key/private-key code-flow fields present. No provider secret was printed, copied into the website, rotated or changed. The registered FLIXIE Web App public configuration was retrieved with the official CLI and projected to five browser-safe fields. Its existing key permits the required Firebase Auth/token APIs and does not permit the Generative Language API; no key restriction was changed.

The production build now initialises that Firebase app with no private environment-file dependency. A regression verifies the registered production app and secure API; the local-isolation regression remains. 96 focused website checks, TypeScript, build34 and SEO28/HTTP checks pass. The development5174/5175 previews deliberately retain fictional emulator authentication. Real-provider testing uses the separate production build at `http://localhost:5176/app/sign-in` in Chrome; its API is the existing production backend.

The user chose to complete Google login themselves. It returned to an existing signed-in Flixie session, including the account’s avatar/badges and watchlist. The subsequent screenshot’s profile error was diagnosed independently: the production API returns404 Cannot GET /profiles/me. Those web-profile/directory/public-review API additions exist only locally at that point. The isolated compatible backend patch was released from deployed commit 034c7ff21b48b788f6b0ca6a7848338d250e5702; no frontend fallback exposes broader legacy account data. Backend release status: deployed and verified 15 November 2026: a35f940dfeb5aa10e312e5a1f6816d6f336545c9, GitHub run 43660283119; 986 checks pass, no migration/data jobs or release messages. The existing signed-in owner profile now loads with avatar/badges/favourites and no error. This does not publish the consumer website/root or change the live corporate pages.

Apple’s existing-account website round trip was subsequently confirmed by the user on15November2026, including their profile, watchlist and diary. The earlier morning deferral is complete. No sign-in account was selected by the agent, no new Terms were accepted, and no favourite, diary entry, friend request or other real account content was changed. Safe Firebase/domain/key/SEO receipts and final frontend logs are under `.impeccable/review/auth-readiness/`.


## Home, diary and shared footer — 15 November 2026

The shared `Footer` is used by corporate pages, connected WebApp and public title/person server shells (including the generic app loading shell). Corporate/features/legal/support/deletion URLs and actual store destinations are retained. Footer text links use weight with hover/focus underline; activity links follow the same treatment. Sidebar224px on ordinary desktop and208px tablet reserves icon, wrapping label and tabular full count; ultrawide shell cap remains1920px. Home right rail is300px, collapses before squeezing primary content. `homeSavedFilms` selects three unique actual films with Watch soon first; container widths show1/2/3 without altering save/priority state. Recent diary and picker share width on desktop.

`Diary.tsx` owns compact month-grouped List, search, Calendar and centred review reader. Calendar keys preserve the stored calendar day, support month/year navigation, same-day watches and undated entries. Dates choose actual entries; list and calendar share data. No diary writes were added. Review title/body remain out of list markup; spoiler title/body stay hidden until Reveal review, and private notes never enter the reader. Semantics, keyboard buttons, native modal focus/escape and200% text reflow remain available.

`AuthForm` derives completion mode from the current identity as well as explicit Join state. An identity arriving after a public-title login dialog mounts therefore sees First name, Username, identity Email, community preference and unchecked required Terms, rather than a disabled sign-in form. Service errors retain reload/different-account recovery. This was exercised with the guarded Auth-only local fixture; no account completion or Terms acceptance was submitted. Google round trip was previously verified; the user subsequently confirmed Apple sign-in and existing-account continuity on15November2026.

Title actions: active favourite red, watchlist gold, Share light blue; labels/icons/pressed state remain. Zero regional viewing offers show only the country empty state. Movie overview requests `/movies/:id/cinema-status?region=GB`; see backend `docs/web-cinema-status.md`. Only positive source/country/freshness-validated data renders the badge; unavailable/older servers hide it. Backend stores six-hour regional snapshots in the existing compact cache, with full IDs and top12 preview rows, preserving native now-playing response fields. No new schema migration.

Evidence: `.impeccable/review/home-diary/`,103 focused website regressions,7 backend cinema/cache checks, types,34 rendered pages/28 sitemap URLs, local browser phone/tablet/desktop and200% text. These UI/cinema changes remain local; no consumer frontend or cinema API deployment performed.


### Native button colours and browser recolouring —15November2026

The user requests native app colours after a screenshot of a deep-purple primary button. AppTheme's actual primary is#7C4DFF with white label. The primary web variable already had that value, but actual Chrome computed#2A009E due to injected Dark Reader styles. The static page now carries the extension's supported `darkreader-lock` marker and the app declares `color-scheme:light dark`, retaining OS-following native themes. Reloading the user's preview proved#7C4DFF/#FFFFFF and zero injected Dark Reader style nodes. No global extension preference changed. Source: https://github.com/darkreader/darkreader/blob/main/CONTRIBUTING.md#disabling-dark-reader-on-your-site .

Consumer action tokens now match native: primary#7C4DFF; selected favourite#E57373 dark/#AD3C50 light; watchlist#FFC857 dark/#8C630E light; Share#5599FF dark (actual movie/show hero Share value) with accessible#185AB0 light text on light surfaces. Primary/link/palette roles remain distinct; title labels/icons/pressed state are preserved.104 web regressions including palette contrast and all rendered-page opt-out assertions pass, plus types/build34/SEO28. Evidence in `.impeccable/review/app-colours/`; desktop proof contains only public sidebar labels, phone uses fictional Alex. Existing13-capture review covers layout; a separate narrow colour review covers this correction. Frontend remains unpublished.


## Email/password sign-up stability —15November2026

`AccountGate` now owns the stable signed-out boundary. Auth/profile loading keeps AuthForm mounted rather than discarding the draft. During submission the form and the two original checkbox nodes remain present with their chosen values, controls are disabled, and a ref lock prevents repeated requests before React commits busy state. Failure preserves draft for explicit retry. Existing-account signin does not expose registration fields before profile lookup finishes. Changing account clears the draft and required Terms choice.

Route changes close the prior route's login dialog, and the gate suppresses an inline auth form while a dialog already owns authentication. Browser Back previously produced two forms/four checkboxes/duplicate field IDs; the same flow now has one form/two checks/no open dialog/no duplicate IDs. New `scripts/check-signup-form.test.tsx` covers the real React transitions with mocked session/no network via development-only jsdom. Five targeted tests and109 total website regressions pass; types/build34/SEO28 and desktop/390px browser checks pass. Evidence `.impeccable/review/signup-stability/`. No real account was created or Terms accepted by the agent; no backend/provider change or consumer publication. User-confirmed existing-account Google/Apple sign-in remains confirmed.


## Publication verification —15 November 2026

The release workflow now runs the browser regression suite alongside TypeScript, analytics and generated SEO/HTTP checks before uploading to the existing Azure Static Web App. It writes `/release.json` with the exact deployed commit, served with no-store and noindex headers for live verification. `/app` is the browser product entry point; the existing corporate `/`, features, support, privacy, terms and account-deletion routes remain public. A successful deployment is recorded separately after the workflow and live checks complete. Physical phone/laptop and new-account journeys remain user acceptance checks.


### Verified live publication —15 November 2026

Published to the existing Azure Static Web App as `fda43a0d0deaf7e6d747f6cb0471c284dd3b0702`: https://github.com/lauradouglas/flixie-corp/actions/runs/43713088843. The successful workflow ran109 browser regressions, TypeScript, analytics,34 rendered pages and28-URL SEO/HTTP checks. `/release.json` on the live HTTPS host returns this exact commit with no-store/noindex.36 live URLs, both store redirects, public corporate/legal/support/deletion pages and both association JSON resources passed verification. The root remains the corporate site; use https://www.flixie.co.uk/app for the browser product.

The prerequisite regional cinema API is live as `323f3c8980a731d01c788fc16cfe1b777fefbe75`: https://github.com/lauradouglas/FlixieBE/actions/runs/43712111175, with989 passing backend regressions. The native top12 response retains synopsis and score fields; live GB cinema membership and invalid-ID handling are verified. No migration or production fixture ran.

Anonymous live checks at1280px desktop and390px phone confirm enabled Google/Apple controls, exact native purple and no horizontal page overflow. The reported Join→search→guest save→Create account→Back journey now returns to one form, two checkboxes, zero dialogs and no duplicate IDs, with Terms unchecked. No real signup, Terms acceptance or real activity write was performed. Physical phone/laptop acceptance and new-account journeys remain for the user. Existing-account Google/Apple successes were previously confirmed by the user. The initial API CI helper typing issue was corrected before the successful release; Azure restart completed before the new endpoint was verified. No release message was sent.

## Prepared public browsing navigation and guest episode defaults — 15 November 2026

The user requested Home and a search bar always at the top of public pages,
using the Adrian Grenier page as the example, and visible episode details by
default when signed out. `PublicBrowseHeader.tsx` and
`public-browse-header.css` now own the shared sticky guest header in
`PublicTitleShell`, public `PersonPage` and guest `WebApp` branches. The wordmark
and labeled Home link point to `/`; Sign in/Join Flixie preserve the public
continuation. The search form uses native GET `/app/search` and input name `q`
before hydration, with the existing client search handler on connected routes.
Desktop keeps Home, full visible search and account actions in one row, including
the native GET form before hydration. The user's later IMDb phone reference
supersedes the initial expanded phone search. The existing phone/compact-landscape
selector shows native menu, wordmark, search icon, Sign in and Use app; at <=360px
the official F replaces the wordmark. The bounded scrollable menu exposes Home,
Films & TV, company/support links and Create an account. After hydration, search
disclosure reveals and focuses the 16px input; menu/search exclude each other and
Escape restores focus to the closed control. Route changes reset disclosures.
Phone targets remain at least 44px, and Use app follows existing `/download`.
Sticky `top: 0` and 160px public anchor clearance keep navigation available during
long detail pages. Signed-in bottom tabs, profile and compact member search are
unchanged.

`ShowEpisodesSection.tsx` and `showSeasons.ts` now default guests to checked
Show episode spoilers, with actual names, complete stills and descriptions
visible. Unchecking conceals unwatched details; checking restores them. Explicit
choices are keyed to the viewer, preserving signed-in unwatched protection on
account transitions. Watched episodes remain visible, progress eligibility is
unchanged and review spoiler disclosures remain separate. This supersedes the
unqualified unwatched-default wording in the earlier Favourites, show episodes
and Pick for Us implementation note; that earlier note remains historical.

The user corrected the footer requirement after phone inspection: use the app
theme, not fixed corporate charcoal. `src/web/app-footer.css` aliases the shared
footer's local background, card/lift, text/muted, line and accent variables to
existing `--fx-*` roles, with inherited light/dark color scheme. Corporate pages
retain their marketing footer. A companion span in `Footer.tsx` uses the exact
approved wordmark PNG as an alpha mask at 96x32, with two flat app-ink/brand-purple
colors meeting in the measured 64.33% gap. Letter shape and aligned bottoms are
unchanged; corporate pages keep the original image and hide the companion span.

Prepared verification: 112 focused web regressions, TypeScript, production build
with 34 prerendered pages and 28-URL SEO/HTTP checks pass. Local production-build
browser evidence verifies Adrian Grenier → Alien guest search, header top 0 at
scrollY 1000, compact phone menu/disclosed search without horizontal overflow,
and Newsroom guest names/stills/descriptions visible with reversible uncheck/check.
Standalone built-page fixtures with same-origin CSS/assets show footer background
equal to app background in light (rgb 243,237,252) and dark (rgb 21,21,34), with
an enlarged-text fixture without page overflow. Final independent disposition is
ship for local source/capture and mockup scope in
`final-theme-home-verdict.md`; its two responsive findings are resolved. The
mockup design still awaits the user's review. Captures and
contract/finish receipts are in `.impeccable/review/guest-homepage/`. No real-account
write, signup/Terms acceptance, backend or native change was performed. This
prepared extension is not yet live; the prior fda43a0 publication remains a
separate completed release until the current release receipt supersedes it.

The root-homepage proposal is separate and remains mockup-only in
`/Users/lauradouglas/.codex/visualizations/2026/11/14/01a1d9db-075d-7a70-b86f-92cf4af182ff/flixie-public-homepage.html`.
The user authorised this exploration, which includes movies/shows, clear sign-in/signup,
country-specific In cinemas, Features/About and legal/support/footer routes.
The proposed response to the user's location question is saved country for
members and an explicit country selector for guests; that mechanism is not
user-confirmed and requires agreement when implementing it. The artifact uses
public API cinema snapshots for GB/IE/US and
sends no account details. Its footer follows the app theme; an optional phone app
banner is a local design control, while the actual website retains existing
Safari app metadata. It does not implement root routing, saved-country integration,
precise geolocation, nearby venues or showtimes. Catalogue/cinema wiring, root
behavior and publication remain separate work; the mockup design awaits the
user's review. The durable scoped direction is
also recorded in `.impeccable/public-browse-brief.md`.


**Public browsing follow-up released — 15 November 2026:** Website commit `57388417a2bc6ed5d58f93e2ac39221b8bb54d86` deployed successfully through [Azure workflow 43720282308](https://github.com/lauradouglas/flixie-corp/actions/runs/43720282308). The app-themed connected footer, compact guest phone header/full desktop search and guest episode defaults are live. 112 focused checks, TypeScript, build34, SEO28 and HTTP/device/store checks passed; 36 live URLs and two store redirects verified against the exact release marker. Finish review: ship. No backend/native deployment, real-account write or notification. Root homepage remains a mockup awaiting user design approval; the user explicitly wants to review it before replacement/publication. Country selection is a proposed mechanism. No further homepage deployment is authorised by this receipt. Physical phone/laptop testing remains with the user.


## Public discovery root implemented — 15 November 2026

The user's later “implment new home” approves implementing the new public root,
including wee complete posters beside cinema titles. This explicitly supersedes
the earlier mockup-only/root-review status above. The5738841 live follow-up remains
historical; this implementation is local pending its new Azure release and exact
release receipt. No earlier publication receipt is rewritten as this release.

`PublicHome.tsx`, `public-home.css` and `publicDiscovery.ts` implement guest `/`.
`site.ts`/`views.ts` select the new root and preserve the original `HomeView` at
`/welcome` as Meet Flixie. Members entering `/` continue to their personal `/app`.
Features/About, FAQ/support, Privacy, Terms, deletion and both stores retain their
paths; the footer exposes Meet Flixie and the shared wordmark returns to `/`.

Actual `/movies/popular` and `/shows/popular` feeds show up to six films/four shows
initially, with reversible expansion to twelve each. Regional `/movies/now_playing`
shows three cinema cards initially and up to twelve expanded. Small complete 2:3
posters are64×96px desktop or56×84px phone. The cinema selector offers GB, IE, US,
AU, CA, NZ, DE, FR, IN and BR, defaults to GB and retains an explicit local browser
preference under `flixie-cinema-country`. It performs no GPS lookup or account
country update. Changes clear the old country immediately, reset expansion and
show selected-country loading/error/retry/empty states. Country listings and
Check local cinema showtimes do not imply nearby venues or actual showtimes.

`src/catalog/discovery.json` supplies a dated finite public film/TV snapshot in
server HTML, refreshed by the existing live popular routes after hydration.
`discoveryFilms` validates/bounds IDs and titles, accepts safe poster paths and
projects release dates; no account/owner, score or review fields are retained.
Failure retains the snapshot with its saved date and retry. Cinema is checked
live, with no static claim of current availability. Public transport sends no
bearer and uses `credentials: omit`/`cache: no-store`.
`scripts/sync-home-discovery.ts` explicitly refreshes only public film/TV fields,
requires HTTPS or loopback and preserves the previous snapshot if a feed is empty;
no scheduler, account fixture, backend/schema or metadata source was introduced.

Guest Save reuses the existing centred auth continuation. The picker and mood
links carry safe `next` intent into `/app?pick=…`; existing member/profile and
explicit Terms gates must settle before the existing picker opens. The root uses
inline `WebsiteAnalyticsChoice` in normal flow, preserving the existing consent
logic and choices rather than placing a bottom overlay over discovery.

The source preserves app light/dark roles, full artwork, current compact phone
header and themed footer. The scoped responsive fix replaces forced phone poster
columns with rem-based auto-fit, lets footer navigation groups wrap, and places
Pip's heading/art in flexible wrapping space. This resolves the review's narrow
200% reflow finding without shrinking text or changing global tokens.

Supplied checks passed116 regressions/types/build35 and29 sitemap/SEO URLs before
the reflow batch. Four focused cases, TypeScript, build35/SEO29 and analytics pass
after that batch; release CI will rerun the full116. Actual browser checks cover
GB→US→GB,12-film/show expansions, Save opening auth, signup's two checkboxes, mood
continuation, Meet Flixie's preserved page and wordmark return to root. Desktop1440,
tablet820 and dark phone390 captures are actual browser evidence. Light390 and
320px/200% are passive current-DOM fixtures, not interactive theme or OS text-size
verification. The reviewer scored the responsive finding resolved across all six
captures; current documentation now resolves the stale-status finding. Receipts:
`.impeccable/review/public-home-implementation/`. No physical-device acceptance,
completed real/new signup, Terms acceptance, completed new member-intent journey,
real-account write, backend/native change or new deployment is claimed here.


## Public discovery homepage released — 15 November 2026

This supersedes the implementation-pending status above. Website commit
`13fcdd1b4f90ff0b7cf6db73de364763c6e4da62` is live through
[Azure workflow43736973395](https://github.com/lauradouglas/flixie-corp/actions/runs/43736973395).
The exact no-store release marker,37 live URLs and two store redirects pass.
Production CI passed116 website regressions, TypeScript, analytics,35-page build
and29-URL sitemap/SEO/HTTP checks. The reviewer scored both named reflow and
documentation fixes resolved, with disposition ship. Actual live guest Home and
Meet Flixie were verified; all three64×96 cinema posters loaded. The valid live
full-page capture and immutable source ZIP are beside
`flixie-homepage-live-release-20261115.json` in the task artifact directory.
No backend/native release, real-account mutation or release notification occurred.
Local responsive captures cover desktop, tablet, phone and narrow200% text; no
physical-device or completed new-account registration claim is added. An extra live
phone capture was not completed after the browser connection became unavailable.


## Saved and detected country discovery — 15 November 2026

The user explicitly requests saved profile country for members, guest country
detection and the same region for popular movies/cinema instead of the backend US
default. This supersedes manual-GB/ten-country behavior;13fcdd1 remains the prior
homepage release. Current country source is complete locally, with new website
publication pending final review/backend readiness and its exact release receipt.

`browseCountry.ts` resolves members' saved profile country ahead of guest
preferences. A temporary manual page override resets on account/profile-country
changes without updating the profile. Guests' saved `flixie-cinema-country` wins
over first-party detection, cached successfully in the session for one hour.
Invalid/missing/failed detection visibly falls back toGB and keeps manual control.
All250 current choices are available, including UK/XI→GB aliases. The selector
sits above both movie/cinema feeds; saved/estimated/loading/unavailable hints and
a wrapping label/10rem select basis preserve clarity at narrow enlarged text.

Public movies now request `/movies/popular?region=…`, matching
`/movies/now_playing?region=…`. Region/ready keys clear old-country results and
ignore late replies; cinema expansion resets. TV remains `/shows/popular` without
regional claims. The finite movie SSR fallback and refresh script are explicitly
GB-only; a different-country failure shows its own error/retry instead of GB
titles. The public field projection and no-bearer/no-cookie transport remain.
Members retain root→personal `/app`, with Home/sidebar Explore films & TV opening
noindex `/app/explore` in their existing authenticated shell. Title providers,
cinema status and Watch options inherit this resolver and wait for readiness;
Watch options permits a temporary selection. Auth/Terms and privacy boundaries
remain unchanged.

The additive anonymous `/guest/country` estimates country inside the existing
Flixie backend. Bundled7.9MB country-only MMDB is public-domain PDDL-1.0 from
sapics/ip-location-db, with published SHA-256 verification/provenance in
`data/geoip/` and MIT maxmind reader. Azure uses its overwritten client-ip only
on Azure; other environments ignore forwarding headers and use socket IP.
Response contains country/source only with `private, no-store`/`noindex`. No GPS,
city/coordinates, third-party visitor lookup, IP logging or account write is added;
request address is used only in lookup memory for this purpose. Dataset refresh
is deliberate download/checksum/provenance/tests/reviewed release, not a runtime
download or scheduler. Parent-updated PrivacyView adds the factual country
paragraph and15November date; this documentation pass edits no policy.

Supplied checks pass120 website regressions/types/build35/SEO29 and993 backend
regressions/types/build, including compiled database path. Country/account/manual/
race/failure/transport checks use fictional accounts and controlled responses.
Desktop1440/phone390 show Ireland in the actual browser;320px/200% light is a
passive current-DOM fixture with serialized Ireland and eager artwork, not an
interactive OS/theme or physical-device test. The reviewer scored the country-row
fix resolved across all three rebuilt captures; documentation is reconciled for
its final verdict. Three unchanged detector
advisories remain documented; no additional detector pass is run here.

Backend993 CI checks passed and5e4985524b43481763f14b9f18e88cab2bf1f56b is deploying
through isolated workflow43743118572;
the release owner records readiness/live behavior and the new website SHA
separately. No schema/migration, production data job, main branch change, native
release, real-account update or release notification is asserted by this record.
Receipts: `.impeccable/review/country-discovery/`.
