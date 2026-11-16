# Website presentation audit — 16 November 2026

The user asked for a full desktop/mobile pass after reporting poor first loads,
generic browser titles and a biography disclosure inserted into expanded text.
This pass builds on the previously published loading and biography fixes.

## Changes

- Home's saved films, diary, TV progress, friends and plans settle independently.
  Each failed optional feed has its own retry; a failed diary preview stays visible
  as an actionable error. Existing account-scoped stale-response protection remains.
- Shared dialogs retain their close heading while long choices scroll. Clicking
  dialog padding no longer dismisses a draft. Dialogs have unique label/description
  IDs, and stacked dialogs keep body scrolling locked until the last one closes.
  Desktop/tablet sheets remain centred, as do the existing explicit modal flows.
- The diary view switch and public review headers reflow at enlarged text sizes.
  Review names and bodies wrap long unbroken content. Mobile navigation reflows
  into additional rows when enlarged labels need space; its existing measured
  clearance continues to keep page content, prompts and toasts above it.
- Corporate navigation uses the available width and root text size to choose its
  full links or compact menu. The compact menu stays within the viewport and
  scrolls on short screens. Phone product screenshots no longer move outside
  their gutters during entrance motion. Welcome headings paint completely on
  first load, and feature links preserve the capitalisation of “TV”.
- App screens have distinct browser-tab labels. Private names, searches and
  activity are not copied into those labels. Public film/show/person title handling
  and route indexing/canonical rules remain intact.
- The development-only typography checks also cover corporate pages and both
  themes. These controls and the temporary fixture viewer are absent from the
  production bundle.

## Coverage

Browser route audit: `/`, `/welcome`, `/features`, the nine feature pages,
`/films`, `/about`, `/faqs`, `/privacy`, `/terms`, `/contact`, `/invite`, `/download`,
`/404`, Alien, American Horror Story, Christopher Nolan, guest search, sign-in
and registration. Signed-in samples cover Home, Watchlist, Diary, Friends,
Plans, Profile, Notifications, Explore, Alien and The Newsroom.

Regular screenshots cover 1440px public desktop, 1280px member desktop and
390px phones. The verification matrix also covers 1440×1000, 820×1180,
320×740 with 200% text, and 844×390 landscape. Both light and dark themes
were inspected. All route samples in the final matrix fit the page width.

Interactive checks include diary list/calendar and spoiler reader, profile
activity/reviews, edit profile, long avatar choices, centred favourite ranking,
people lookup, plan preview, picker preferences/services/results and plan
composition, FAQ search/disclosure and account-help feedback. Draft editors were
cancelled. Only fictional local accounts were used; no real activity was modified.

Controlled local fixtures exercise loading, empty, failed/retry, independently
slow Home feeds, missing artwork and very long titles/reviews across all five
viewport sizes. The fixture viewer imports the actual production components and
styles and is ignored by Git. Automated regressions cover independent Home
completion/retry, account-switch isolation, padding/backdrop/busy dismissal,
dialog labels/scroll cleanup and app tab titles.

## Validation

- TypeScript, 163 website tests and campaign analytics checks pass.
- Production build and SEO/HTTP/deep-link/feature/download checks pass.
- 206 prerendered pages; 200 sitemap URLs; 278 deployed files; 16.30 MB;
  15,629 routing bytes. Existing Azure Free budget checks pass.
- Existing build chunk-size advisory and a pre-existing read-only-field warning
  in a header fixture remain non-failing.

Viewport checks use a desktop browser at the stated CSS dimensions. They do not
claim physical iPhone Safari, Android keyboards or every possible user-content
permutation was tested. Live deployment identity and public-page checks are
verified separately after the existing deployment workflow completes.
