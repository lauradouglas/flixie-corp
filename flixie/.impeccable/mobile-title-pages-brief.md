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

Spacing refinement published:7262bc21c13c81e42c06f03cbb5b6e5e294852fe,
workflow43764772123 success, notifications skipped. Exact apex/www version,
12 URLs and actual CSS/shared JS verified. Live guest show page header bottom
and backdrop top both74px (gap0); card gutter12px; Home link named with hidden
phone text; no horizontal overflow. Signed-in images remain labelled fixtures,
not a real account/sign-in acceptance claim. Source and release/review evidence
are durable in the chat artifact folder. Temporary tabs/server closed; viewport
reset. Native/backend/auth code and other page layouts remain unchanged.

## Vertical separation and four title actions —15 November2026

User clarified “More separation between rows” and asked to remove Watch options,
leaving rate, watchlist, favourite and share. Phone rate becomes a standalone CTA,
then12px gap, then a three-icon surface, then12px to the app button. Horizontal
12px gutters and flush header/backdrop stay. The redundant Watch options title
button is removed; All options remains in the viewing-provider section. Action
DOM/focus order now matches the requested order. Shared title-control selectors
support the new presentation-only wrapper; its wider-layout display is contents.

Show Rate previously had no website implementation. Added an overall-show rating
editor using the same native app read/write routes and userId/rating/recommendation
contract, verified against show controller/service/repository and ownership/terms
middleware. Existing ratings load; saves are account-bound, validated and guarded
against double submission/stale accounts; failure keeps the draft. Rating success
retries the title score and refreshes personal/social sections. Guest Rate opens
sign-in. Phone is full-screen; desktop is centred. No show review feature, backend,
native or Firebase change was made.

133 website regressions and types pass, including current rating load, failed-save
retry, one-save locking, own-account transport, invalid input and stale/foreign
response guards. Build35, SEO29/HTTP, analytics pass. One bounded dark/light phone,
guest,320px/200% text, desktop and fictional show save inspection passes; actual
rate-to-row and row-to-app gaps12px. No horizontal overflow; desktop editor640px
wide and centred. Detector has0 anti-patterns; native-role advisories remain.
Fixtures use fictional account data and never write to real accounts.
