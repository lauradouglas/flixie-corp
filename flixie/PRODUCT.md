# Flixie browser experience

Flixie is an existing movie and TV companion with iOS/Android apps, an existing React/Vite marketing website and an existing backend/Firebase identity. It helps people choose films, keep watchlists and a diary, track TV episodes and arrange film nights with friends. Viewing happens through users’ own services.

On 14 November 2026 the user approved building the signed-in Home and public shared-title concept in the existing website with the existing backend. The scope now includes connected watchlist, diary, picker, TV progress, friend activity and plan previews; public film/show information and deliberately public reviews; desktop/mobile download prompts; and public search discovery pages. Work is local and reviewable; production publication has not been requested.

Title overviews show real regional viewing offers and highlight the signed-in person's saved services. Stream, Rent and Buy remain distinct; a saved service does not imply that a rental or purchase is included. Guests see public regional offers. Personal service preferences stay out of prerendered HTML. The later connected-picker extension below adds explicit editing of the owner’s saved services.

Public person pages adapt the native app's information and credits: portrait,
biography, factual dates/birthplace/department, IMDb, photos, known-for titles and
merged acting/crew filmography. Role, film/TV, year, text search and sort combine;
credits reveal 24 at a time. Cast cards, teaser names and director names link to
people; credits link back to films or TV. Existing public people endpoints serve guests
and signed-in viewers. A finite reviewed people catalogue is prerendered with
canonical/Person metadata; additional people work dynamically and stay noindex
until included in that catalogue. Person favourites and personal history are
outside this information-and-credits slice.

User-selected portrait choices take precedence over refreshed TMDB defaults.
Christopher Nolan (person525) always uses the black-and-white portrait
`/kWogkBJKzXFJSY8cZpuzanfsaFi.jpg`, selected on14 November2026.

Keep the Flixie identity: white `flix` / purple `ie` wordmark on dark chrome, official F icon, Manrope, Pip, full portrait posters, each user’s own awarded/selected badge border, the responsive browser type roles and centred desktop dialogs. Mobile choices may use bottom sheets. Public pages must not expose personal diary notes, friends, plans or private reviews. Honour blocks and spoilers.

The public browse surface and eight initial film/TV pages are prerendered for search. Private application routes stay noindex. Indexing and rankings are not guaranteed. Desktop shows both store links; mobile provides a native Safari app banner or a compact dismissible device-aware store prompt after scrolling.

See docs/web-app.md for exact scope, local fixture credentials, backend contract, configuration, tests, catalogue refresh and release dependencies. Native app parity, full plan editing, chat and games remain outside this first slice.

The browser now includes a signed-in You profile and other-member profiles.
Adapt the native profile hierarchy: identity/avatar/badges/bio, library totals,
favourites, activity and spoiler-aware reviews; existing friends are browsable.
Each avatar/name opens its member profile. Own username/bio, avatar and earned
border choices use the existing account endpoints. Profile data is authenticated,
private/no-store and noindex; account changes discard previous profile state.
Friends may see friendship-shared activity even when community sharing is off.
Other public members expose only consented profile details and public reviews;
blocked, private non-friends and deactivated members are unavailable.


Watch Plan previews are a user-requested centred-modal exception on every device,
including phones (14 November2026). The overview uses complete film posters,
actual arrangement status/date/time/place and member avatars; the modal keeps
facts, named participants/replies, film/profile links and persistent close/app
controls. Plan previews retain the responsive web type roles; creation and invitations from picker results are now authorised as recorded below.


Favourite films and Favourite TV now have separate owner-only Edit ranking
actions on the You profile (14 November 2026). A centred modal on every device
keeps numbered full-poster rows, keyboard-accessible move arrows, and explicit
Save/Cancel. Changes stay as drafts until confirmed saving through the existing
native ranking endpoints. The opening account identity and current favourite
membership are rechecked; friends' and public profiles remain read-only. No
favourites are added or removed. Preserve the responsive browser type roles.


The browser also supports favourite film/show membership: title-page hearts,
owner-profile Add films/Add shows search and Remove controls, up to the existing
10-per-type limit. Existing favourite ranks refresh after membership changes.
Public show pages include seasons and spoiler-conscious episodes; signed-in
users can mark aired episodes watched/unwatched through existing progress APIs.

Pick for us tonight is a leading Home action, with solo/friend/eligible existing
group selection, mood/time/viewing preferences and sourced backend film choices.
It respects saved services, viewing location and limited/unavailable checks.
No group invitation/editor or recommendation-algorithm rewrite is included.

Explicit website preference clarified 14 November 2026: every desktop/tablet
dialog is centred, never bottom-anchored. Mobile bottom sheets are allowed;
already-agreed all-device centred editors retain that presentation. This web
rule does not alter native Flutter conventions.

## Picker to Watch Plan and mobile navigation comparison —14November2026

Each Pick for Us result can create a Watch Plan using the existing unified API.
The centred composer carries the chosen film and audience, allows individual
friends or an accepted group, optional schedule/place and an explicit create/invite
action. Invitees stay pending until they reply. Keep one immutable draft UUID and
freeze uncertain attempts for explicit same-plan retry; never automatically resend
an interrupted invitation. Creation refreshes Home/Plans. Full plan editing, chat
and website reply management are outside this extension; recipients use the app.
Local fictional inbox invitations only, no publication or real-account testing.

The user initially requested mobile navigation mockup variations to replace the tall
wrapped row: bottom tabs with profile in the header, a compact menu and a scrolling
tab row. That comparison was unselected at this stage; the later selection below
supersedes that status while preserving the comparison as historical evidence.

Primary browser rating labels use Community rating, per the14November2026 user
correction. Optional About this rating explains the actual selected source and
that Flixie shares ratings with the wider community. Do not label the main score
TMDB rating or claim that two averages are blended. Preserve20-rater selection
and best-effort mirror truth; no score algorithm change is part of this copy work.


## Connected navigation, picker and social controls — 14 November 2026

The user selected five bottom tabs for the signed-in phone website: Home,
Watchlist, Diary, Friends and Plans. The owner’s profile remains in the header
beside compact search and the notification bell; their own avatar and badge border
remain intact. The sidebar remains on wider layouts. The bottom-tab selector is
viewport width ≤680px, or width ≤960px with height ≤500px for compact landscape.
Measured navigation height supplies safe-area-aware content, toast and app-prompt
clearance. The final desktop shell fills ordinary desktop widths and centres only
beyond its 1920px maximum, following the user’s later ultrawide clarification.

The picker now follows the native two-step flow: mood and optional advanced genre
choices first, then people, time, place, together/separate viewing, saved services,
original languages, exclusions and an optional request. Up to three genres may
match any or all; every supported original-language choice remains searchable.
The owner can explicitly save or cancel changes to their own services inside the
picker. One sourced film appears at a time. Not tonight advances or fetches unseen
films, Undo restores a passed pick, and a failed refill retains the previous pick.
The chosen film and submitted audience carry into the existing explicit Watch Plan
composer; no invitation is sent by browsing or passing a result.

Friends supports bounded username lookup, send/accept/decline/cancel requests and
confirmed removal. The private inbox supports unread counts, All/Unread filters,
read/unread, Mark all read, refresh and pagination. Its validated internal links
open existing title/profile/friends/Watch Plan destinations; unknown or app-only
types open /download. The actual plan endpoint still decides access. Each person’s
own avatar/badges, blocks, spoiler handling and account-scoped state are preserved.
The additive private people-search and friend-request projections must accompany
any future deployment. There is no schema change or real-account outreach.

The latest website wordmark instruction supersedes the historical lowered-ie
artwork: all six letters share one font, weight and size, with aligned visible
bottoms and consistent repeated i forms. The user accepted the enlarged authored
lettering and rejected its earlier in-page appearance. The current website uses
one matched PNG from those outlines through the shared artwork component; the SVG
remains its authoring source. The narrow rendering review passes at its captured
sizes, but the user has not explicitly accepted the current in-page correction.
A fractional-coordinate cause has not been established.

Delivery remains local only; publication, native UI changes and replacement of
the corporate website have not been authorised. Discussion of a possible guest
product front door does not change the current root route or public corporate
pages.


## Public policies and local sign-in readiness — 15 November 2026

The website now has a first-class public, prerendered `/terms` page. It presents
the six existing native/web Terms sections unchanged, with the existing version
and effective date of 16 September 2026. `/web/terms.html` has a prepared 301
redirect to `/terms`. Signup links to Terms and Privacy in separate safe tabs;
both website footers expose Terms and `/contact#account-deletion`.

Privacy section 9 and Contact have stable `#account-deletion` targets. Direct
initial arrival and later hash changes reveal the relevant target after the CSR
view mounts. Contact offers an unsent email request from the registered address
with the username, explains the existing in-app deletion option, warns against
sending a password and links to the existing deletion/retention explanation.
Anonymous visitors can reach these resources without sign-in or installation.
Only Privacy, Terms and Contact suppress the custom mobile install prompt; this
does not establish native Safari banner behaviour or change other prompt rules.
The policy text and deletion backend are unchanged by this link work.

The local AuthForm disables Google/Apple provider buttons when the session is
local (or busy) and explains that the fictional demo email/password is available.
The existing auth.tsx local provider guard is unchanged. This truthful preview
state does not establish production OAuth readiness. The saved public, key-free
15 November audit confirms the existing admin Firebase project `flixie-9a8eb`;
its authorised-domain list includes `admin.flixie.co.uk`, but omits both
`www.flixie.co.uk` and `flixie.co.uk`. The documented production build still lacks
required public Firebase Web App values. Provider enablement, Apple web setup
and Google/Apple round trips on the consumer domain remain unverified. Reuse the
existing project and identities when production configuration is separately
authorised; no provider, domain, cloud setting or deployment was changed here.

The fresh public-review-links finish review ships the local source/capture scope
with no material fixes. Final existing logs pass TypeScript, 95 focused web checks,
34 prerendered pages and 28 sitemap URLs plus local HTTP checks. The corrected
complete ultrawide capture confirms the selected 1920px shell at left 320px in a
2560px CSS viewport; the full-page raster is 2560×1790, not a 1790px-high viewport.
Signup evidence shows disabled local providers and unchecked Terms: no real
signup, agreement acceptance or deletion request was performed. Public Terms and
its legacy redirect remain prepared locally until publication is authorised and
production endpoints are checked. Store-console configuration and app-review
approval are outside this evidence. The root/corporate product-entrance proposal
remains discussion only; this extension changes no root or signup/onboarding route.


## Website identity connection — 15 November 2026

The user requested the two consumer website domains be added to the existing Firebase project and Google/Apple sign-in made usable. Both domains are now authorised alongside the existing admin domains. The production website has the registered FLIXIE Web App's public SDK defaults; local development still uses isolated emulators. Google returned to an existing authenticated Flixie account after the user completed the chooser themselves. The user subsequently confirmed successful Apple website sign-in and access to their existing profile, watchlist and diary on15November2026. The subsequent profile error is a missing production web-profile route, fixed in isolated compatible backend release a35f940 (run 43660283119), with 986 passing checks and the owner profile verified; it is not evidence that Google authentication failed. This authorises the requested identity connection and necessary profile API fix, not a consumer-site/root publication. Detailed factual receipts and verification limits live in docs/web-app.md and .impeccable/review/auth-readiness/.

The user also wants movie searches to lead to Flixie. A live crawl audit found generic noindex title destinations and no movie/show sitemap entries. The prepared local catalogue has six films and two shows. The staged publication/catalogue-expansion/Search Console proposal is documented in docs/web-app.md; bulk indexing/publication, extended catalogue generation and a new guest root remain proposals.


## Home and diary refinements —15November2026

User-approved local extension: wider desktop navigation/Home context rail; actual responsive saved-film previews; compact recent diary next to picker; shared corporate/legal/support/store footer on every shell; compact searchable List/Calendar diary and centred spoiler-aware review reading; semantic red favourite, gold watchlist, blue Share; concise regional provider emptiness and a fresh country-specific cinema badge backed by six-hour source snapshots. Keep private notes separate from reviews, real avatars/borders and full portrait artwork. No release-date guess may label a film In cinemas. New identity completion inside an existing login dialog must show profile fields and explicit unchecked Terms. Changes are local, with no frontend/cinema publication; prior OAuth-domain/profile API release is distinct. Apple website sign-in and existing profile/watchlist/diary access were confirmed by the user on15November2026.


User preference15November2026: consumer website action buttons must use the actual native app palette. Preserve #7C4DFF primary/white, native danger#E57373 and warning#FFC857 in dark theme, native hero Share#5599FF; use theme-appropriate accessible light variants. Respect Flixie's own OS-following light/dark colours rather than allowing a second dark-mode transformation. Actual Chrome's Dark Reader override was diagnosed and protected via the supported page opt-out; global extension settings remain untouched. No native palette edit.


## Email registration stability —15November2026

User reported repeated email/password signup form parts including both checkboxes. Preserve a single mounted draft through Firebase/profile creation; keep explicit consent choices, prevent repeated submit and retain draft after failure. Only one authentication layer may render: navigation dismisses its route-owned dialog, and a pending dialog suppresses inline signup. Changing account resets draft/Terms; existing-account sign-in must not flash registration fields. Local fix and browser/React regressions complete, no real account or Terms operation by the agent.
