# Flixie browser surface

Mode: Operate for signed-in routes; Read/Operate for public film pages. Preserve and extend the approved code-led mockup and existing Flixie brand, without a replacement visual world.

First viewport: real personal watch-soon/diary content with full portrait film artwork and a four-title shelf, useful rail for TV/friends/plans. On phones reflow the sidebar into wrapping navigation and move the rail beneath primary content. Public pages lead with a real title, complete poster, synopsis, rating source, save and viewing options; public review bodies remain spoiler-gated. Device-appropriate app download prompts are visible without blocking content.

Direction contract: complete portrait artwork; white/purple wordmark; bundled Manrope; existing Pip/F; shared accounts and backend; each user’s own border preference; 14px body; bottom sheets; desktop and 320/390px phone reflow; real failure/retry/empty/loading states; no private-data SEO; actual public metadata in prerendered HTML. Approved concept reference: flixie-web-mockup.html in the chat visualization folder. Its fictional scores/content are not live data requirements.

Quality bar: useful connected actions, clear source/visibility labels, keyboard focus, readable narrow screens, no stretched/cropped posters, no invented availability or claims, and no screen-covering install interstitial.

## All-in-one watch and review modal — selected 14 November

THESIS: one centred composer connects a watch to an optional review. The user
selected All in one from the interactive mockups and explicitly excludes bottom
sheets for this rating/review flow.

OWN-WORLD: preserve Flixie's current Manrope, navy/lavender surfaces, purple
actions and official F; use the existing mobile button styles and native dialog
focus behaviour. Other overlays retain their existing presentation.

STORY: enter watch date, rating and recommendation; optionally keep a private
note/cinema flag; then write an optional title and review, mark spoilers, and
choose whether to include it under existing profile privacy settings.

FIRST VIEWPORT: bounded centred dialog with film title/metadata and close at the
top, watch entry above review, a scrolling form body, and a persistent bottom
save/cancel row. Ratings form one row on desktop and two on phones. Fields wrap
and reflow down to 320px; save feedback preserves failed review drafts.

FORM: user-selected All in one, code-led extension of the established surface;
no seed applies to this precisely selected local component. Reference:
flixie-review-mockups.html, All in one variant, in this chat's visualization folder.

User's subsequent action-row correction: make the film actions nicer. Lead with
the purple Rate & review action, keep saved watchlist tonal, use quiet neutral
secondary surfaces and consistent 12px corners, and give Share a labeled button.
Phone actions form two aligned columns, with wrapping labels and 48px minimum
height; no action is removed or changed into a production deployment.
The user additionally requests Open in the Flixie app as a full-width mobile
button below this grid; keep its existing deep link and compact desktop link.

## Overview provider extension — requested 14 November

Show real provider logos/names directly below the title rating, above the action
row. Read the signed-in account's saved services and country; highlight matching
offers and label Stream/Rent/Buy accurately. Where there is no match, retain
useful listed regional offers and say there is no saved-service match. All
options opens the existing country-aware sheet. Guest views fetch only public
offers. Keep malformed/error results distinct from genuine emptiness, isolate
personal results across account changes and keep them out of prerendered HTML.
Provider controls wrap on phones with full logos, readable names and no ellipses.

## Dark photo lightbox — requested 14 November

User rejects the gallery's pale bottom-sheet viewer and supplies a screenshot.
Use a dark centered lightbox on desktop, filling the viewport on phones. Inherit
Flixie's navy chrome, Manrope and purple focus treatment. Keep the full still or
portrait poster contained without cropping, with bounded image space and
persistent title/count, close and Previous/Next controls. Retain arrow keys,
Escape, focus trapping/restoration and page-scroll locking. Keep genuine loading
and failed-image states. No backend, gallery metadata or other sheet change is
needed. This is a precise code-led extension of the existing surface, with the
user's screenshot as the defect reference rather than an approved new comp.

## Person detail pages — requested 14 November

Port the native app's public person-detail structure into the established website:
portrait/name/department, factual dates/birthplace, biography, Known for, merged
acting/crew filmography with role/media/year/search/sort controls, photos in the
approved dark lightbox, and credits linking back to films/shows. Cast cards and
director names link to `/people/:id`. Native references: person_detail_screen.dart,
person_detail_hero.dart and person_filmography_selection.dart in the app. This is
a precise code-led adaptation of existing product UI and Flixie visual authority,
not an open whole-page invention or a replacement world. Use complete artwork,
14px body, explicit loading/error/empty states and guest access via the existing
public people endpoints. Pre-render a finite reviewed public people catalogue
with canonical/Person schema; keep unknown dynamic people noindex until curated.
No personal favourites/history controls, native edits, backend changes or deploy
are included in the requested info-and-credits slice.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Member profiles — requested 14 November

Mode: Operate/Read. User requests own and friend profiles like the native app,
including avatars. Precise code-led adaptation of the native ProfileScreen,
FriendProfileScreen, ProfileHeader, profile library and avatar chooser; inherit
the existing website shell, typography, palette, poster and badge components.
No concept tournament or replacement world is needed for this specified parity.

First viewport: own identity and full avatar with earned border, bio and controls,
real library counts, followed by Favourites/Activity/Reviews. Favourite films, TV
and people retain artwork and detail links. Your friends adds a searchable
directory above the existing recent feed. Clickable avatars and names join the
header, feeds, title friend opinions, reviews and plan participants to profiles.
Own editing includes username/bio, catalogue avatar or initials, and only earned
borders. Reuse bounded sheets for these choices, retain the centered watch modal.

Use token-bound explicit profile projections; no private diary notes or account
identifiers in other profiles or static HTML. Blocked/deactivated/private
non-friends are unavailable; public profile detail sharing remains opt-in.
Activity/reviews have bounded pagination, missing/error/retry and spoiler states.
Local Firebase Storage resolves the same avatar paths as native, with icon-to-
original fallback and initials on failure. No cloud storage bypass locally.
Verify signed-in own/friend journeys, avatar save and retained borders, stranger
privacy, loading/empty/failure, desktop/phone/narrow/landscape and keyboard focus.
No production deployment or native runtime edits are requested.
