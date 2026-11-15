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

Published: c99505323ca122a858a97d6b46ff371e32f9aa17. Workflow43763674835
succeeded; notifications skipped.131 website checks, types, build35, SEO29,
HTTP and analytics pass. Exact apex/www release marker,12 public/app/policy
URLs, actual published CSS/shared JS and both prerendered title pages verified.
Built-browser dark/light/guest/820px tablet/1280px desktop and320px/root32px
checks have no horizontal overflow; all title/episode action targets >=44px.
Live guest Interstellar/Newsroom acceptance is read-only. Source ZIP and evidence
are in the chat artifact directory; physical-device acceptance remains the user.

## Signed-in preview and tighter spacing —15 November2026

User requested movie/show signed-in mobile previews, removal of the small gap
above the backdrop, a nicer Home affordance, and less padding around cards and
content. The gap came from main top padding exceeding a negative16px hero
margin. Mobile title mains now explicitly start at zero, with safe-area-aware
12px gutters and no top-margin compensation. A44px icon-only chevron keeps the
Home accessible name, link destination and desktop breadcrumb text. Action and
provider insets and section gaps are tighter; body type is unchanged.

Bounded built-CSS browser inspection: signed-in movie/show, guest light,
320px/200% text and1280px desktop. Both phone backdrops meet the header exactly
(gap0px), card gutters12px, actions44px or56px, no horizontal overflow. Desktop
retains27px top padding and its text breadcrumb. Existing131 regression checks,
types, build35 and analytics pass; SEO/HTTP checks pass. One detector pass has
zero anti-patterns; advisories are the documented native-derived type roles.

Saved signed-in movie/show/episode previews use actual components and metadata
with explicitly fictional account, friends, progress and services. No real sign-in
was performed, and no real account or database writes were made.
