# Public browsing navigation — 15 November 2026

Mode: Operate. Ordinary extension of the existing Flixie world; DESIGN.md remains
the visual authority. No new palette or replacement concept.

The user wants visitors arriving at a public person, film or show to get Home,
search and continue browsing before creating an account. Reuse one sticky header
across public server-rendered shells and connected guest routes. Desktop retains
Home, visible native GET `/app/search?q=…`, Sign in and Join Flixie. Account links
preserve the current public continuation; Home and branding point to `/`.

The later IMDb phone screenshot (`/Users/lauradouglas/Downloads/IMG_1109.jpg`)
supersedes always-expanded guest phone search: native menu, approved wordmark
(official F through 360px), search icon, Sign in and native-purple Use app.
The menu retains Home, discovery/company/support and account access; search
discloses a focused full input after hydration. Preserve 16px input text, 44px
phone targets, keyboard Escape/focus return, bounded scrolling and no page
overflow. Use app follows existing `/download`. Existing Safari app metadata is
retained. Signed-in bottom tabs, profile and compact member search are unchanged.

The user explicitly requests guest episode details visible by default. Guests
start with Show episode spoilers checked; uncheck/check reverses visibility.
Explicit choices belong to the viewer. Signed-in unwatched protection, watched
visibility/progress eligibility and separate review-spoiler disclosures remain.

Latest footer correction: match the app theme, not fixed charcoal on mobile.
Inside `.flixie-web`, reuse app light/dark ground, ink, muted, link, line and
surface roles. Corporate footer retains its marketing scheme. Keep approved
wordmark geometry/baseline via the original PNG alpha mask with two flat
theme-appropriate colors; introduce no new theme tokens.

The user authorised creating a separate standalone root-homepage mockup; its
design awaits their review, remains outside source and is excluded from this
release. It explores film/TV discovery, sign-in/signup,
country-specific In cinemas, Features/About and legal/support/store access.
Proposed location mechanism: saved country for members and an explicit selector
for guests. This responds to the user's location question and is not a confirmed
selection. The mockup uses public GB/IE/US snapshots, not nearby venue/showtime data;
its auth forms send nothing. Optional app banner is a mockup-only design control.
Root routing, real wiring, saved-country integration and publication are separate
work. Artifact:
`/Users/lauradouglas/.codex/visualizations/2026/11/14/01a1d9db-075d-7a70-b86f-92cf4af182ff/flixie-public-homepage.html`.

Current source is implemented and locally verified, awaiting release. Evidence
and finish/documentation receipts live in `.impeccable/review/guest-homepage/`.
Final independent verdict: ship at local source/capture and mockup scope, with
both responsive findings resolved; it grants no root-publication authority.
No backend/native change, real-account write or Terms acceptance is part of this
extension.
