# Mobile movie/show pages —15 November2026

Mode: Operate. User request: “i'd love the movie and show ppages on mobile to
look just like the app”. Existing website remains the runtime; no Flutter port.

Visual authority: native movie_detail_hero.dart, show_detail_hero.dart,
movie_detail_hero_tokens.dart, movie_header_backdrop.dart and
media_detail_action.dart. No running native app surface was available; source
was compared with current website components and real public metadata. Use the
native palette, full portrait artwork, compact score/info, metadata/tagline,
coloured icon actions, provider rows and episode layout. Retain the approved
compact Friends list and individual badge borders. Desktop/tablet geometry stays.

Scope: TitlePresentation, mobile-title.css, TitlePage/PublicTitleShell,
CommunityRating opt-in compact phone treatment and title favourite labels.
Single data/action instances, no new backend contract or auth flow. Real movie
API uses backdropUrl; show API uses backdropPath. Missing/failed artwork is an
honest plain ground. No invented availability or cropped-poster landscape art.
No new show rating/list feature is implied by the visual adaptation.

Verification: one batched phone dark/light, guest, tablet/desktop and enlarged
text inspection. Correction batch fixes an older Favourite grid-column rule,
keeps action source/focus order and hides duplicated long text inside the missing
poster placeholder. Final bounded confirmation follows. Focused tests exercise
watchlist/favourite changes, review/provider launch, score provenance, failed
landscape fallback, show episode progress and guest spoiler/sign-in behavior.
Fictional local UI fixture has no real account writes; public metadata is copied
read-only. Fixtures are excluded from production bundles.

Detector: one pass. Missing img fallback-src finding resolved with real src and
lazy loading; source media keeps the landscape phone-specific. Native-derived
13/15px roles and14px action radius intentionally extend DESIGN.md. No separate
visual world, advertising or unsupported product claim was added.
