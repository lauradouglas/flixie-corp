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
title rows, and saved-sign-in restoration. All 167 website tests, TypeScript,
analytics, build and SEO/HTTP/deep-link checks pass. Output preserves the 206
pages, 200 sitemap URLs and 15,629 routing bytes, with 291 files / 17.38 MB,
within the unchanged Azure Free guards.

These are desktop Chrome mobile/network emulation checks, not a physical iPhone
Safari test. Live release identity and a final throttled recording are verified
after deployment. Deliberate new-page content, newly selected regional results
and expanded disclosures still change what is displayed.
