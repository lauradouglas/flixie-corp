# Corporate app colour consistency —15 November 2026

Mode: Persuade for marketing and Read for policy/support. User asks for the
corporate side to share the app background and related colours. Preserve
existing corporate typography, composition, imagery, copy, links and legal text.
Use shared native-derived semantic colours in src/theme.css for page ground,
surfaces, lifted cards, ink, muted copy, borders, links and focus in light/dark.
Corporate header keeps app dark chrome. Brand CTAs use #7c4dff/white. All footer
variants use the same page ground and approved theme-aware wordmark artwork.
No backend, native app, login, discovery or data changes are required.

Validation:120 existing website checks and TypeScript pass. The palette regression
still checks the same native values/contrast, reading their new shared location.
Built35 pages; SEO/HTTP checks run against the generated routes. Desktop1440 and
phone390 dark captures are from the running built site; light390/1600 and enlarged
text355 actual-CSS-pixel fixtures use actual built markup/CSS with only an explicit light scheme,
no scripts and eager images. No device appearance was changed. Review caught a
corporate footer mask still scoped to .flixie-web; the correction makes the
approved mask visible in both shells. Final confirmation resolved both named defects; no open material findings.
Final review: ship. Release recorded below.
