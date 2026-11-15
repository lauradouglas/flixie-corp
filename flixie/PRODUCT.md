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


## Public browsing navigation and guest episode defaults — 15 November 2026

From the Adrian Grenier public-page screenshot, the user requested a way Home and
search always visible at the top. Public person/film/show shells and connected
guest routes now share the existing Flixie header. Desktop keeps Home, a full
search field, Sign in and Join Flixie. Home points to the current root; account
links retain the public continuation. Visible desktop native GET search to
`/app/search?q=…` works before hydration. The header stays at the top while
scrolling. The user's later IMDb phone reference selects a compact menu, logo,
search icon, Sign in and Use app instead of the initial expanded phone search.
The menu provides Home/company/support/account routes; search opens a focused
input, and Use app follows `/download`. The official F replaces the wordmark at
the smallest width. Signed-in bottom tabs, profile and compact member search
retain their existing behavior.

The user also explicitly requested visible episode details when signed out.
Guests start with Show episode spoilers checked and actual names, complete stills
and descriptions visible. Uncheck/check reverses that choice. Choices belong to
the current viewer; members keep protected unwatched details by default, and
watched-state rules and public-review spoiler disclosure remain unchanged.
This removes guest browsing dead ends and makes public show information useful
before registration without changing tracking or review controls.

The user corrected the footer requirement after viewing it on their phone: it
must match the app theme, not fixed charcoal. Connected footer variables now map
to the existing app light/dark ground, ink, links, lines and surfaces. Its approved
wordmark keeps the same image geometry with readable ink/purple colors through
the PNG alpha mask. Corporate pages retain their separate marketing footer.

This extension is implemented and verified locally; its release is pending the
current publication work. Supplied evidence records 112 web regressions,
TypeScript, 34-page build and 28-URL SEO/HTTP checks passing, plus production-build
guest Alien search, sticky scrolling and reversible Newsroom episode visibility.
Refreshed evidence covers compact phone menu/search and built-page light/dark
footers matching app backgrounds, plus enlarged text without page overflow.
The final independent review records ship for local source/capture and mockup
scope, with its two responsive findings resolved; this is not root-publication
approval. Source is verified and awaiting release.
No real-account write, Terms acceptance, backend or native change is part of it.

**Historical mockup stage — superseded by the approved implementation below.**
The user authorised creating a separate public root-homepage mockup; its design
awaits the user's review. Its film/TV
browsing, sign-in/signup, country-specific In cinemas, Features/About and public
legal/support/footer navigation live in the standalone
`flixie-public-homepage.html` artifact, outside website source. The proposed cinema
behavior uses a member's saved country and an explicit guest country selector
as a response to the user's location question; that mechanism is not user-confirmed.
The mockup uses public cinema snapshots for country previews. Its footer follows
the app theme; an optional app banner is a local preview control, while the actual
website retains existing Safari app metadata. Precise location, nearby cinemas
and showtimes are not implemented. Root routing,
real catalogue/cinema wiring, country handling and publication remain separate
implementation work. Earlier discussion-only entries remain historical; this
mockup request does not mean the corporate root has been replaced.


## Public discovery homepage implemented — 15 November 2026

The user explicitly approved implementation with “implment new home”, after
requesting wee complete posters beside the In cinemas titles. This supersedes
the mockup-only/root-review status above. The new guest `/` is implemented locally
in the existing website: a short introduction and account actions, actual popular
films, country-specific cinema, popular TV and the existing Pip picker entry.
Signed-in members entering `/` continue to personal `/app`. The old marketing
homepage is preserved at `/welcome` as Meet Flixie; Features, About, support,
privacy, Terms, account deletion and both store destinations retain access.

**Historical initial country scope — superseded by the country follow-up below.**
Popular feeds initially show up to six films and four shows and expand to twelve
each. Cinema initially shows three and expands to up to twelve, with full 2:3
posters at 64×96 desktop or 56×84 phone. The explicit ten-country selector defaults
to GB and remembers a local browser choice. It does not use GPS, infer nearby
cinemas, edit an account country or supply showtimes. Country changes clear old
cinema results and reset expansion; loading, error/retry and empty states remain
truthful. Existing fresh regional now-playing results supply cinema, not a static
availability claim or release-date guess.

A finite public film/TV snapshot is present in server HTML and refreshed from
the existing public popular feeds. Only title ID/name, safe poster path and release
date are projected; no scores, reviews, accounts or owner state enter discovery.
Failed refresh retains saved selections with their date and retry. Public reads
send neither bearer credentials nor cookies. The bounded refresh script uses
existing public endpoints and retains the prior snapshot if a feed is empty.

Guest Save opens the existing centred authentication continuation. Pick for us
and the two mood links preserve safe intent into the existing member picker after
authentication/profile and explicit Terms gating. The root analytics choice is
inline, retaining the existing consent choices and logic. The app light/dark
palette, compact phone header, full posters and themed footer remain; rem-based
phone shelves, wrapping footer groups and flexible Pip heading/art allow narrow
enlarged text to reflow.

Status: source implementation complete locally, publication pending a new Azure
release and exact release receipt. The previous 5738841 public-navigation release
remains a separate live receipt. Supplied pre-responsive-batch checks passed 116
regressions, TypeScript, build35 and sitemap/SEO29. After the reflow batch, four
focused checks, TypeScript, build35/SEO29 and analytics checks pass; the full 116
checks will run again during release CI. Browser checks cover GB→US→GB, film/TV
expansion to twelve, Save/auth with two signup checkboxes, mood continuation and
Meet Flixie/wordmark navigation. Light and 320px/200% captures are passive current
DOM fixtures, not OS-setting or interactive theme tests. No physical-device,
completed new signup/member intent, real-account write, backend/native change or
new deployment is claimed by this local implementation record.


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


## Saved and detected browsing country — 15 November 2026

The user explicitly requests saved profile country for members, country detection
for guests, and popular movies from the same country as cinema instead of the
backend US default. This supersedes the initial manual-GB/ten-country rules;
the prior13fcdd1 homepage release and its verification remain historical.

One selector above both feeds offers all250 current Flixie countries, including
UK/XI normalization to GB. Members begin with saved profile country ahead of guest
preferences. Their temporary manual page override resets on account/profile-country
change and never updates the profile. Guests' saved manual browser choice wins
over an estimated country, cached in the session for one hour. Detection failure
shows an explicit GB fallback and retains manual control. Popular movie and cinema
requests share the explicit region and clear stale results on change; TV remains
non-regional. The finite GB SSR movie snapshot is a GB-only fallback, never content
for another country's failure; the refresh script now requests GB explicitly.

Members retain personal Home/root routing and gain Explore films & TV through
Home/sidebar into `/app/explore`, within the existing authenticated shell and
noindex boundary. Guest title providers/cinema and Watch options use the same
country resolver. Existing save/picker/Terms continuations, full posters, responsive
reflow, corporate/legal/store access and inline analytics choices remain.

Guest estimation is first-party on the existing Flixie backend, using a verified
7.9MB public-domain country-only MMDB with an MIT-licensed reader. The new anonymous
response contains only country/source and is no-store/noindex. The lookup uses
Azure's overwritten client-ip only on Azure, otherwise the socket address; no GPS,
city/coordinates, third-party IP lookup, IP logging or account-country write is
added. Dataset refresh is deliberate checksum/provenance review and release,
not a scheduler or runtime download. The parent-authored factual Privacy paragraph
and15November date describe this behavior; this documentation pass changes no policy.

Status: source/verification complete locally; website publication awaits final
review and backend readiness. Supplied checks pass120 website regressions,
TypeScript, build35/SEO29 and993 backend regressions/types/build, including compiled
database-path verification. Backend commit5e4985524b43481763f14b9f18e88cab2bf1f56b
passed993 CI checks and is deploying in isolated workflow43743118572; no completed backend or
new website publication is asserted here. Current desktop1440/phone390 captures
show Ireland. The320px/200% light capture is a passive current-DOM fixture with
serialized Ireland selection/eager artwork, not interactive OS/theme evidence.
The reviewer scored the country-row fix resolved across all three rebuilt
captures; current documentation is reconciled for its final verdict.
No real-account change, completed new signup, physical-device acceptance, schema
or data job, native release or release notification is claimed.


## Country-aware discovery released —15 November2026

Supersedes the pending-release status above. API5e4985524b43481763f14b9f18e88cab2bf1f56b
is live through workflow43743118572; its actual country response returns only
country/source, with private no-store/noindex. Website184deb7cd7940fab0782b31e726cae5dafd1f68b
is live through workflow43744358464.120 web and993 backend checks, types/build
and35-page/29-sitemap SEO/HTTP checks pass. Exact website marker,37 checked URLs,
two store redirects, member Explore noindex and the factual privacy paragraph
were verified. Actual guest browser automatically selectedGB and showed the same
United Kingdom labels on popular films/cinema, with6/3 cards and all cinema art.
Reviewer scored both named fixes resolved: ship. Receipts, immutable source ZIPs
and live capture: flixie-country-release-20261115.json in the task artifact folder.
No account settings/activity, native app, database schema/data job or release
notification changed. Real-member transitions remain covered by fictional
React/transport tests; no new real-account login or physical-device claim.


## Corporate colour consistency —15 November 2026

The user authorises matching the corporate side to the app palette. One shared
`src/theme.css` now owns native-derived light/dark ground, surfaces, text, border
and accent values. Corporate utility colours alias it; old warm charcoal
hardcodes in the marketing homepage are replaced with these roles. The header
keeps app dark chrome, primary CTAs use app purple/white, and every footer has
the same themed ground and single-image wordmark. Existing corporate type,
layout, imagery, copy, routes, legal text and store destinations stay intact.
This supersedes earlier statements that corporate colours/footer stay separate.
Source complete locally; final checks and publication recorded below.
