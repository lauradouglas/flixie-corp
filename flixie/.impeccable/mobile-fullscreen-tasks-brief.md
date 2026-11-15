# Full-screen phone tasks —15 November2026

Mode: Operate. User requested full pages on mobile for Pick for Me and Rate &
Review, retaining centred desktop dialogs. Implement opt-in full-viewport task
views in the existing website, not new routes or a framework migration. Pick for
Us uses the same picker. Preserve its mood/time/services/results flow and the
single watch-entry-before-review form, optional review title and explicit saves.

Mobile tasks cover underlying site chrome in native dialog top layer, use the
app page ground, keep a bounded header/Close and action footer, and scroll the
body. Safe-area padding protects edges; visualViewport height/offset follows the
keyboard at normal scale, clears on desktop/zoom and removes listeners on close.
Phones use the680px breakpoint; short coarse-pointer landscape can also opt in.
Desktop/tablet retain centred16px-radius modal geometry. Fullscreen is explicit
only on the two requested flows; other dialogs/lightboxes keep existing behavior.
Date fields expand with text, and the rating score reflows below the legend at
narrow text-relative widths. Drafts survive viewport changes. Busy-close guards,
privacy, single-save/linked review semantics and focus restoration remain.

129 web checks/types/build35/SEO29/HTTP/analytics pass. New actual-flow regressions
cover keyboard viewport/zoom/desktop cleanup, retained review/rating and one linked
watch/review save, and retained picker mood/time through result navigation. One
detector pass has no findings. Real built-CSS fictional UI confirms390×850 edge-
to-edge picker/review,430px short viewport with reachable footer,1440px centred
640×902 desktop review, and320px/200% light reflow. The bounded first inspection
caught a cramped date field; one CSS correction yields284px at32px font, with
282px client/scroll width. No physical Safari keyboard test is claimed.

Assistant recommendations, not implemented: full-screen Watch Plan creation and
favourite-ranking editing; keep short providers/share/confirmation choices compact.
User asked about reusing Flutter: repo has web scaffold/auth branches, but browser
compatibility of storage/push and other integrations is not fully audited/built.
User accepted continuing the existing website to match the app visually. Public
HTML film/show/person content and SEO stay; no Flutter migration is authorised.
