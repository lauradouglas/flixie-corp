# Public discovery homepage — 15 November 2026

Mode: Operate. The user approved the existing mockup for implementation with
“implment new home”, after requesting wee posters beside In cinemas titles.
Earlier mockup-only notes remain historical. Preserve the existing Azure website,
backend, app palette, authentication, corporate content and public review links.

THESIS: Let visitors browse real films, shows and regional cinema releases before
signing up, with an immediate route into their Flixie account.
OWN-WORLD: The approved mockup and existing DESIGN.md: Manrope, native purple,
app light/dark grounds, one approved wordmark, complete 2:3 posters, compact
phone menu/search/Sign in/Use app and themed shared footer.
STORY: Root guests discover titles, choose a cinema country, save through the
existing sign-in continuation, or explore Features/About/legal/support. Members
enter their existing personal /app home. Existing marketing Home remains at
/welcome; existing corporate/legal destinations retain their URLs.
FIRST VIEWPORT: Short Your next good watch introduction and account actions,
six popular-film posters, then three compact cinema cards with small full
posters, then popular shows and Pick for us. Desktop rows reflow on phone and
large text; navigation stays reachable and desktop dialogs remain centred.
FORM: Implementation of the user-approved existing-world mockup. No new visual
world, concept roll or generated comp; its own approved source is the reference.

Use existing anonymous /movies/popular, /shows/popular and regional
/movies/now_playing feeds. Include finite, explicitly projected public discovery
snapshots in server HTML, refresh in the browser, and do not statically claim
current cinema availability. Cinema shows loading, empty and retry states and
clears old-country results immediately on selection. Never send an account or
bearer for discovery. Film/TV sample rows in the old mockup were hand-picked;
the implementation uses actual popular feeds. Cinema order comes from the
existing regional popularity order and is not nearby venue/showtime data.

## Implemented behavior and current status

Initially show up to six films, four shows and three cinema entries, with
reversible expansion to twelve for each feed. Wee cinema posters retain the
complete artwork at64×96px desktop or56×84px phone. Popular data is projected to
valid ID/title, safe poster path and release date only; the dated finite snapshot
is in server HTML, refreshes live and remains with its date/Try again on failure.
`scripts/sync-home-discovery.ts` explicitly refreshes that public film/TV snapshot;
it is not a scheduled job and retains the previous file for an empty feed.

Cinema defaults to GB, with an explicit local browser preference across GB, IE,
US, AU, CA, NZ, DE, FR, IN and BR. It uses neither GPS nor an account-country
write. Previous-country results clear immediately and expansion resets on change;
loading, error/retry and empty states remain visible. Do not statically claim
current cinema availability or nearby venues/showtimes. Anonymous discovery
requests omit cookies and bearer credentials.

Guest saves reuse the existing centred authentication continuation. Pick for us,
Make me laugh and Get hooked carry safe intent into the existing signed-in picker
only after authentication/profile and explicit Terms gating. Root analytics
choices remain inline with existing consent logic. At narrow enlarged text,
poster shelves use rem-based auto-fit, footer groups wrap and Pip heading/art
share flexible space. Preserve all existing global tokens.

Implementation is complete locally; a new Azure publication/release receipt is
pending. The earlier5738841 release is historical and did not publish this root.
Earlier mockup-only notes are explicitly superseded by the user's implementation
approval. Supplied116 checks/types/build35/SEO29 passed before responsive fixes;
four focused checks, types, build35/SEO29 and analytics pass after the reflow batch,
with the full suite to rerun in release CI. Actual browser checks cover country
changes, film/TV expansion, Save/auth with two signup checkboxes, mood continuation
and Meet Flixie/wordmark navigation. Light390 and320px/200% captures are passive
current-DOM fixtures; do not claim interactive theme/OS-text-setting operation,
physical-device acceptance, completed new signup or member-intent execution.
The reviewer has scored the narrow reflow fix resolved; the documentation handoff
reconciles the remaining stale-current-status finding.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
