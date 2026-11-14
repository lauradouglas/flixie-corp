# Expanded movie preview

Target: src/web/TitleSections.tsx and the existing TitlePage in src/web/pages.tsx.
Mode: Operate/Read. This is a bounded extension of the approved Flixie interface, not a new visual world or concept roll.

User request, 14 November 2026: add more useful content to the movie preview, specifically a friends section, images from the film, and cast portraits. Their Obsession screenshot is the incumbent visual reference. Keep the existing hero, branding, scores and core actions, then add a useful private Friends section, public cast with names/characters, and stills/alternative posters with an enlarged image viewer. Move the install prompt below the richer film content.

Use actual existing backend data. Movie friend-recommendation and show friend-recommendations bind the actor to the token, filter blocked/deactivated users and retain each person's badge preference. Display only watched/rated/positive recommendation evidence; omit review snippets because that contract lacks spoiler flags. Never infer recommendation from a high score or label every false flag as dislike. Guests see sign-in guidance instead of friend information. No account data enters prerendered HTML.

Quality bar: same Manrope/14px body and lavender/navy tokens; complete 2:3 poster/profile artwork; real landscape stills; own user badge borders; wrapping narrow-screen labels; keyboard-accessible scroll regions and image navigation; bottom-aligned bounded viewer with Escape, previous/next and focus restoration; truthful loading/error/empty/missing-image states. No new backend service or hosting change is needed. Existing Apple/Google store links remain findable. Publication is outside this request.

## Implemented section patterns

These are title-page measurements, not additions to the global design-token scale. The extension reuses the recorded palette, Manrope hierarchy, personal `Avatar` borders, state components and native `Sheet`; `DESIGN.md` and `.impeccable/design.json` remain the incumbent authority.

- Sections use a 32px top gap. Friends uses the existing surface fill and 12px container corners, with 22px padding and an auto-fitting grid of rows at least 250px wide where space permits; padding becomes 18px below the 680px container breakpoint.
- Cast portraits are complete 2:3 images in a horizontally scrollable rail: 132px columns and 16px gaps, becoming 112px columns and 12px gaps below 680px. Names and characters wrap. Poster thumbnails retain 2:3 proportions at 150px wide, or 140px below 680px; stills use a separate 16:9 rail with contain fitting.
- The image viewer extends the shared bottom sheet to `min(1040px, calc(100% - 24px))`, retaining its viewport-bounded, scrollable treatment. Images use contain fitting, maximum width 100% and maximum height 58dvh. Existing close/focus handling combines with Previous/Next and arrow-key navigation.
