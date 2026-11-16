# Slow mobile loading and navigation — 16 November 2026

The user requested cold-load and page-switch checks on a slow mobile connection,
with particular attention to flashes and moving content.

## Reproduction

Chrome DevTools used its iPhone 16 viewport (393 × 852), 3G network preset,
disabled network cache and screenshot-enabled Performance recordings. The
original public Home cold-load trace reported CLS 0.2819 (rounded to 0.28).
Its shifted elements included the guest layout, film headings and paragraphs.
The network waterfall also showed the 165,420-byte Manrope TTF arriving late
and an external Google Fonts stylesheet blocking rendering.

## Changes

- Home keeps its existing public GB cards while country detection and a matching
  feed refresh are pending. Other countries still use only their own results;
  stale cross-country replies remain discarded. The country-status row always
  exists, and film headings reserve two lines without truncating longer titles.
- Discovery and viewing-option skeletons reuse their content geometry. Their
  accessible loading announcement no longer adds a redundant visible row above
  the already-labelled section.
- Inter and Space Grotesk are self-hosted WOFF2 with their original Unicode
  ranges and SIL OFL licenses. The render-blocking external font stylesheet is
  removed. Manrope is losslessly compressed to 53,632 bytes (about 68% smaller),
  with identical glyphs, Unicode mappings and weight axis. Optional font display
  prevents late font downloads from changing already-painted text. Google sign-in
  typography follows the same no-late-swap policy.
- Public first HTML and the hydrated guest title view share their action rows,
  rating placeholder, viewing-options area and app-link row. Sign-in links work
  before hydration; sharing remains disabled until its handler exists. No score
  or availability is invented. Mobile title spacing is reserved before a backdrop
  arrives, and the decorative phone backdrop requests 780px rather than 1280px.
- In-app navigation to catalogued films/people immediately uses the matching
  public snapshot while live requests run. A failed person refresh retains its
  saved public details and exposes retry. No private response is cached this way.
- `/app` keeps the neutral startup view while a saved sign-in is restored,
  preventing guest Home from flashing before member Home. Public `/` remains
  available while authentication is being resolved.

## Verification

The corrected production build was served locally and recorded under the same
393 × 852 / 3G / cache-disabled settings. Home and a direct Alien cold load both
reported CLS rounded to 0.00; a real Home → Heart of the Beast link transition
recorded CLS 0. Cold-load LCP
is not compared between Azure and the uncompressed local preview because their
transport/compression differs. Recordings and full accessible trace summaries
are kept with the task evidence.

Four behavioural regressions cover the deferred country/feed handover, immediate
film/person snapshots during navigation and failure, matching first/hydrated
title rows, and saved-sign-in restoration. All 169 website tests, TypeScript,
analytics, build and SEO/HTTP/deep-link checks pass. Output preserves the 206
pages, 200 sitemap URLs and 15,629 routing bytes, with 291 files / 17.38 MB,
within the unchanged Azure Free guards.

These are desktop Chrome mobile/network emulation checks, not a physical iPhone
Safari test. Live release identity and a final throttled recording are verified
after deployment. Deliberate new-page content, newly selected regional results
and expanded disclosures still change what is displayed.

The first live follow-up caught a conflicting legacy Manrope registration in the
shared footer (TTF with swap), which did not reproduce in the local recording.
It is now consolidated into one initial shared WOFF2/optional registration;
a regression prevents lazy view or footer CSS from reintroducing another face.
A final live recording is required for the release result below.

## Live trace diagnosis

The live trace exported as Trace-20261116T151427.json.gz still reports raw CLS
0.8534866. Its only LayoutShift is at 5.904 seconds: the initial stylesheet has
just finished, and the unstyled header layout changes from 194px to 74px.
First paint and first contentful paint both occur 514.854ms **after** that event.
The immediately preceding captured frame is blank; the first visible frame is
fully styled. There are no LayoutShift events after first paint. This is not
reported as a raw CLS improvement or a perfect Web Vitals score.

The filmstrip did expose a different visual change: a matching-country feed
could reorder the first films after hydration without creating a CLS event.
The six initially visible movies and four shows now retain their positions;
matching live facts update in place, and new selections remain available after
them through the existing Explore control. Other countries retain their own
fresh result ordering and stale-country isolation. A focused regression covers
a reversed feed, updated facts, preserved nodes and access to new results.
