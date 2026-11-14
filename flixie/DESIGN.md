---
name: Flixie connected browser experience
description: The approved Flixie identity applied to connected browser tools and public film discovery.
colors:
  fx-bg: "light-dark(#f3edfc, #151522)"
  fx-surface: "light-dark(#fff, #1e1f30)"
  fx-lift: "light-dark(#eee7f6, #292b3e)"
  fx-ink: "light-dark(#261735, #f5f7fa)"
  fx-muted: "light-dark(#62566f, #b7c2d0)"
  fx-line: "light-dark(#dbd1e7, #3e4058)"
  fx-purple: "light-dark(#6534b8, #b9a0ff)"
  fx-brand: "#7c4dff"
  fx-gold: "light-dark(#8c630e, #ffcf70)"
  sidebar-ground: "light-dark(#f9f6fe, #181925)"
  navigation-active: "light-dark(#e8ddff, #302743)"
  picker-ground: "light-dark(#e8ddff, #292239)"
  chrome-bg: "#10111b"
  chrome-surface: "#1e1f30"
  chrome-ink: "#f5f7fa"
  chrome-muted: "#b7c2d0"
  chrome-line: "#3e4058"
  chrome-focus: "#b9a0ff"
typography:
  display:
    fontFamily: "FlixieManrope, Arial, sans-serif"
    fontSize: "46px"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-.03em"
  headline:
    fontFamily: "FlixieManrope, Arial, sans-serif"
    fontSize: "27px"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-.025em"
  title:
    fontFamily: "FlixieManrope, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 750
    lineHeight: 1.3
    letterSpacing: "-.02em"
  item-title:
    fontFamily: "FlixieManrope, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 750
    lineHeight: 1.35
  body:
    fontFamily: "FlixieManrope, Arial, sans-serif"
    fontSize: "14px"
    lineHeight: 1.5
  reading-body:
    fontFamily: "FlixieManrope, Arial, sans-serif"
    fontSize: "14px"
    lineHeight: 1.75
  control:
    fontFamily: "FlixieManrope, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 750
    lineHeight: 1.5
  label:
    fontFamily: "FlixieManrope, Arial, sans-serif"
    fontSize: "12px"
    lineHeight: 1.5
  wordmark:
    fontFamily: "Arial, sans-serif"
    fontSize: "32px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-1px"
rounded:
  label: "5px"
  poster: "7px"
  field: "8px"
  control: "9px"
  notice: "10px"
  container: "12px"
  watch-soon: "13px"
  sheet: "16px"
  avatar: "50%"
spacing:
  tight: "6px"
  compact: "7px"
  icon-gap: "8px"
  action-gap: "9px"
  small: "12px"
  row: "14px"
  inset: "16px"
  medium: "17px"
  section: "20px"
  sheet-inset: "24px"
  large: "25px"
  main-inset: "27px"
  section-break: "32px"
components:
  button-primary:
    backgroundColor: "{colors.fx-brand}"
    textColor: "#fff"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
  button-secondary:
    backgroundColor: "{colors.fx-surface}"
    textColor: "{colors.fx-ink}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
  button-soft:
    backgroundColor: "{colors.fx-lift}"
    textColor: "{colors.fx-purple}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
  choice:
    backgroundColor: "{colors.fx-lift}"
    textColor: "{colors.fx-ink}"
    rounded: "{rounded.poster}"
    padding: "9px 12px"
  text-field:
    backgroundColor: "{colors.fx-lift}"
    textColor: "{colors.fx-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    padding: "11px"
    width: "100%"
  navigation-item:
    textColor: "{colors.fx-muted}"
    rounded: "{rounded.control}"
    padding: "11px 12px"
    width: "100%"
  watch-soon:
    backgroundColor: "{colors.fx-surface}"
    textColor: "{colors.fx-ink}"
    rounded: "{rounded.watch-soon}"
    padding: "17px"
  sheet:
    backgroundColor: "{colors.fx-surface}"
    textColor: "{colors.fx-ink}"
    rounded: "{rounded.sheet}"
    padding: "24px"
    width: "min(560px, calc(100% - 24px))"
  mobile-app-prompt:
    backgroundColor: "{colors.fx-surface}"
    textColor: "{colors.fx-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.container}"
    padding: "12px"
---

# Design System: Flixie connected browser experience

## Overview

**Creative North Star: "Flixie's existing app identity"**

This document records the connected browser implementation in `src/web/`, the public catalogue in `src/components/CatalogView.tsx`, and the shared mobile app prompt. It extends the approved Flixie concept with the existing account and backend. The white/purple wordmark, bundled Manrope, official Pip and F assets, full portrait film artwork and each person's own badge border remain the visual authority.

Compact navigation and tonal lavender or navy surfaces keep personal films and actions easy to scan. Film artwork carries the visual interest; purple marks actions and selected states. Desktop can show personal film, television, friend and plan information in parallel; smaller containers reflow the same content. Public pages distinguish title information, rating sources and deliberately public reviews from personal account content.

This is a scoped browser system. The pre-existing marketing shell and its Inter/Space Grotesk styles remain separate, including the header/footer surrounding the catalogue. Browser dimensions here do not replace native Flutter tokens. Product scope and release dependencies live in `PRODUCT.md` and `docs/web-app.md`; surface composition stays in `.impeccable/web-app-brief.md`.

**Key Characteristics:**

- White flix / purple ie wordmark on dark chrome, with the approved Arial lettering exception.
- Bundled Manrope, strong title weights and readable body copy.
- Complete portrait artwork, personal badge borders and restrained official Pip/F accents.
- Tonal depth, thin separators and rounded controls.
- Connected account actions, explicit data states and scrollable bottom sheets.

Documentation evidence: source extraction from `web.css`, `production.css`, `mobile-app-prompt.css` and their components, reconciled with `.impeccable/review/finish-review.md`. That independent review records **ship** for the supplied local light-theme captures: `desktop-home.jpg`, `mobile-home.jpg`, `small-home.jpg`, `tablet-home.jpg`, `user-home.jpg`, `desktop-public.jpg`, `mobile-public.jpg`, `small-public.jpg`, `desktop-catalog.jpg` and `mobile-catalog.jpg`. Its verdict excludes dark rendering, physical devices, native app-banner presentation and production responses. This documentation pass adds no runtime verification or release approval.

## Colors

The existing purple identity sits on paired lavender and navy grounds. Frontmatter preserves the CSS `light-dark()` expressions: first branch light, second branch dark. The supplied captures establish the light rendering; recording both branches does not claim dark-mode verification or a theme-switching control.

### Primary

- **Flixie Brand Purple** (`fx-brand`): fixed primary action fill, saved poster control and the purple part of the wordmark.
- **Readable Purple** (`fx-purple`): selected choices, active navigation, text actions, focus and TV progress. It adapts to the surrounding content palette rather than using the fixed brand fill for every role.
- **Chrome Lavender** (`chrome-focus`): search focus and text actions against persistent dark chrome.

### Secondary

- **Warm Rating Gold** (`fx-gold`): sourced film scores, diary ratings and public-review ratings. It does not imply an invented score or review aggregate.

### Neutral

- **Page Ground / Surface / Lifted Surface** (`fx-bg`, `fx-surface`, `fx-lift`): canvas, contained content and soft controls respectively.
- **Ink / Muted Ink / Line** (`fx-ink`, `fx-muted`, `fx-line`): meaningful content, secondary metadata and restrained separators.
- **Sidebar Ground / Active Navigation / Picker Ground**: related but distinct paired fills for navigation and the Pip picker panel.
- **Dark Chrome** (`chrome-bg`, `chrome-surface`, `chrome-ink`, `chrome-muted`, `chrome-line`): fixed header/search colors, independent of the content palette. The catalogue's surrounding marketing chrome continues to use its own existing styles.

**The Brand Continuity Rule.** Extend the existing Flixie identity; this connected browser system does not authorize rebranding the marketing site or native app.

## Typography

**Display and Body Font:** bundled Manrope, registered as `FlixieManrope`, with Arial and sans-serif fallbacks. The bundled variable font covers weights (200–800) and uses swap loading.

**Wordmark Font:** Arial, deliberately retained to match the approved supplied concept. Its white flix / purple ie construction is a branding exception, not the heading or body family.

The frontmatter holds the wide-layout roles. Public title display steps through (39px), (33px) and (30px) as its container narrows; the main page headline becomes (25px) on phones. Watch-soon film titles use (25px), reducing to (23px). Compact film titles, activity text and metadata use the label role; their meaningful contents wrap.

General paragraphs use the body role. Public synopsis and review copy use the reading-body role, bounded near (64ch) and (62ch). Phone search and auth/sheet inputs increase to (16px). Form labels use (13px) at weight (650); compact score-source annotations use (11px). These browser roles do not redefine native typography.

**The Readable Copy Rule.** Preserve the paragraph base, text scaling and wrapping; compact metadata does not authorize shrinking general copy or hiding meaningful text with ellipses.

## Layout

The connected app fills at least the dynamic viewport and has no prototype presentation frame or Home/shared-film switcher. The signed-in layout is centered up to (1600px), with a (168px) sidebar and flexible main column. Main content uses the main inset; wide Home divides into a flexible primary column and (218px) rail separated by the large gap. Watch-soon content pairs a (112px) portrait column with flexible copy.

Public title content is centered up to (1160px), with a (210px) portrait column and (34px) detail gap. Public reviews and the guest continuation panel sit below, separated from the title section by a thin line. The catalogue uses a centered region up to (1200px) with (24px) horizontal inset, reserving (140px) above content for the existing marketing header; its collection is bounded up to (940px). These measurements belong to these browser surfaces.

Container queries respond to the `.flixie-web` width:

- At (1060px), Home tightens its spacing, rail and watch-soon portrait.
- At (900px), the rail follows the main content in two columns; the sidebar becomes (155px), and public detail reduces its poster and headline.
- At (680px), sidebar links become wrapping horizontal navigation, search occupies another header row, and the public synopsis/actions span the width beneath poster/title. Navigation has a (44px) minimum height. Auth and sheet fields use phone text sizing.
- At (425px), four-column shelves become two columns, the rail becomes one column, diary scores move below the title, and download actions stack. Public detail uses wrapping flex layout so long headings can move below the (112px) poster rather than overflow.

The collection grid normally uses auto-filling columns with a (125px) minimum; plan containers use auto-fit with a bounded (280px) minimum. Flexible action rows, minimum-zero grid columns and wrapping titles preserve access to content. Full poster elements retain a (2:3) ratio with contain fitting; the title list never turns artwork into a landscape banner. Shelves show available titles rather than filling absent data with fictional items.

Bottom sheets are fixed to the viewport, horizontally centered with (12px) edge clearance. Their maximum height is `min(85dvh, 850px)` and their own body scrolls. They use native modal dialog behavior; there is no frame-height toggle. The separate mobile app prompt uses safe-area-aware bottom clearance and a viewport cutoff at (820px).

## Elevation & Depth

Tonal surfaces and thin borders provide depth at rest. Content containers stay visually quiet; film artwork supplies the material. Overlay shadows are limited to the bottom sheet (`0 18px 55px #0005`), transient toast (`0 8px 30px #0003`) and compact mobile app prompt (`0 5px 25px #0004`). The sheet backdrop uses `#090914b8`.

Enabled buttons brighten on hover and move down (1px) while active. Disabled buttons use half opacity and a waiting cursor. Current connected CSS has no width animation; progress reflects the actual numeric episode state. Reduced-motion preference removes transitions and smooth scrolling inside the connected surface.

**The Tonal Depth Rule.** Use the existing surface hierarchy and lines for content structure; reserve the recorded shadows for overlays and transient feedback.

## Shapes

Gentle control corners sit between smaller labels/posters and larger containers/sheets, as recorded in frontmatter. Detail posters use control rounding; the smallest shelf layout uses field rounding. Rounded corners never change the full portrait artwork or stretch its proportions. Inputs and selects share thin line borders and lifted fills.

Avatars are circular at (34px), or (26px) in compact participant rows. Their border is person-specific: an explicit `FRAME:NONE` renders no ring; an awarded selected preference wins; otherwise the existing badge priority supplies the border. Unsupported or unawarded selections do not grant a frame. OG, Verified, Early Adopter, Founder and Film Friend treatments retain their own colors. The Christmas treatment uses the official SVG frame at (112%) around the avatar, without an extra generic ring. Missing images use an initial while preserving the person's valid frame.

**The Complete Artwork Rule.** Show the full portrait poster and preserve its proportions in shelves, public detail, diary rows and picker results.

## Components

### Buttons

Solid purple leads the action hierarchy. Secondary actions use a surface fill and line border; soft actions use lifted fill and readable purple. Standard buttons and choice chips use a (42px) **minimum height**: labels may wrap and controls may grow. Public title actions and form inputs use (44px) minimum height; phone navigation also uses that minimum. Coarse pointers expand poster-save, text and icon controls to at least (44px). The sheet close and app-prompt dismiss controls retain accessible names.

Focus uses a (3px) readable-purple outline with (3px) offset. Dark search has a chrome-lavender `:focus-within` outline on its wrapper. Icon-only actions use actual SVG icons, not text glyph substitutes. Saved buttons and poster controls expose the saved state; pending mutations disable their relevant control.

### Choices and fields

Choice chips wrap and select with a purple border and text. Search remains a dark field in persistent chrome. Auth, diary, picker and viewing-option sheets use real labeled fields; text inputs, date/rating controls, textareas and selects fill their available width. Checkboxes use brand purple, with readable wrapping terms labels. Auth providers and action rows wrap rather than forcing narrow columns.

### Cards and content rows

Watch-soon pairs full artwork with actual watchlist data and viewing/log actions. Film shelves place titles and sourced scores below artwork. The Pip picker, guest continuation and read-only plans use quiet tonal containers; their content comes from the connected state. Activity, review and option-list separators appear only between items. Public reviews state their visibility and spoiler status, and spoiler bodies require reveal. Personal diary notes stay in the owner's diary.

### Navigation

The sidebar uses muted labels and a tinted-purple current destination, then becomes wrapping navigation on phones. A skip-to-content link becomes visible on keyboard focus. The dark header retains the wordmark and search/account controls; public guest chrome offers account continuation without blocking title information. The catalogue keeps the existing marketing navigation and larger footer. No prototype presentation controls belong to product chrome.

### Avatars

`Avatar` takes the person and their `profileBadges` through the common person model; the border selection is validated by `avatarBorder`. Activity, public reviews and plan participants use that same path. Compact rendering retains the complete border and its ownership; initials are a missing-image fallback, not fictional uploaded portraits.

### Bottom sheets and feedback

Picker, regional viewing options, diary logging, account continuation, terms and read-only plan details share the bottom-aligned native `<dialog>` sheet. Native modal focus handling is complemented by Escape cancellation, a labeled close action, page-scroll locking and restoration of the previous focus. Fields and body content scroll within the bounded sheet. The production sheet overrides unused preview-frame CSS.

Loading uses static portrait-shaped skeletons and a status label. Failure presents an alert and retry where available; empty content explains the next useful action. Save/log outcomes use a fixed, polite live-status toast. These states reflect actual requests rather than substitute sample content.

### App download prompts

The in-page prompt uses the official F icon, a clear heading and both official store destinations; actions stack at the smallest layout. The compact `MobileAppPrompt` is shared with the marketing shell. iOS Safari uses `apple-itunes-app` metadata for Safari's own banner. Android and non-Safari iOS at qualifying widths receive the compact custom prompt after scrolling more than (160px). It links to the device's store, can be dismissed for the tab session and leaves the page available. Its bottom inset respects the safe area. Native banner appearance remains a physical-device verification item.

## Do's and Don'ts

### Do:

- **Do** extend the approved Flixie identity and keep this system scoped to the connected browser surfaces.
- **Do** show complete portrait artwork with contain fitting and truthful missing-artwork fallbacks.
- **Do** preserve each person's awarded and selected badge preference, including an explicit choice of no border.
- **Do** keep general body copy readable and reflow meaningful titles, metadata and actions.
- **Do** use bounded, scrollable bottom sheets for choices and account actions, preserving keyboard focus.
- **Do** label rating sources, public reviews and spoilers, and render real loading, empty and retry states.
- **Do** keep both desktop store destinations discoverable and mobile download prompts compact and dismissible.

### Don't:

- **Don't** promote browser sidebar widths, catalogue header clearance or unused prototype frame rules into the native app system.
- **Don't** replace the pre-existing marketing design system as a side effect of extending the connected app.
- **Don't** crop film posters into landscape imagery or stretch their proportions.
- **Don't** replace individual border preferences with one universal ring or grant an unawarded frame.
- **Don't** expose personal diary notes, friend activity, plans or private reviews on public title or search-discovery pages.
- **Don't** invent films, availability, reviews, scores or achieved search rankings to fill absent state.
- **Don't** turn app download guidance into a redirect or screen-covering install interstitial.
