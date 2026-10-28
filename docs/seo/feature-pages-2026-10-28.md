# Feature search pages — 28 October 2026

Approved mockup design and content applied to the corporate source on 28 October 2026; not deployed. Extends the existing React/Vite prerendered corporate site without changing hosting, dependencies, privacy policy, referral handling or app links.

## Search intent and page ownership

| Route | Intent | Distinct supporting material | Primary action |
| --- | --- | --- | --- |
| `/film-diary` | Film/movie diary app; watched-film logging | Actual app screenshot with fictional cinema/rewatch/companion entries; viewing notes versus reviews | Start diary / platform download |
| `/tv-show-tracker` | TV episode/season tracking | Actual The Newsroom screenshot showing last watch, next episode and season progress | Start tracking / platform download |
| `/movie-watchlist` | Save films and TV shows; pick a film from saved titles | Runtime/genre/provider filtering and distinction from watched history | Build watchlist / download |
| `/movie-night-planner` | Arrange a film night | Date-first plans, options/voting, location and separate personal logs; no playback-sync promise | Plan a watch / download |
| `/movie-recommendations` | Friends' opinions and genre communities | Personal recommendations versus average scores, solo discovery and community visibility | Find a watch / download |
| `/movie-ratings-reviews` | Personal movie ratings and reviews | Out-of-10 viewing ratings, rewatch opinions and spoiler controls | Log a film / download |
| `/where-to-watch` | Provider discovery | Region-dependent streaming/rental/purchase options; TMDB/JustWatch source and external viewing | Explore titles / download |

Homepage now introduces film diary and TV tracking together, includes screenshots of both and descriptive links. Features is a linked overview instead of inaccurate mock feature claims. Footer provides crawlable links to every feature page. FAQs now cover diary, solo use and TV progress, correct guest browsing and use Watch Plan terminology.

## Technical SEO

Central page registry drives routing, prerendered HTML, distinct titles/descriptions, canonical URLs, Open Graph/Twitter metadata and the sitemap. New pages use Home → Features → page breadcrumbs, descriptive internal links, accessible headings, image alt text, responsive layouts and usable download CTAs. SoftwareApplication describes actual feature areas. Per-feature FAQ JSON-LD is generated from the same data as visible FAQ answers. No fabricated ratings, pricing or testimonials. FAQ markup does not promise Google FAQ rich results (generally restricted to authoritative government/health sites).

Build now produces 18 documents, 15 indexable sitemap URLs. Invitations, shared-title landing pages and errors remain noindex. Apple/Android app links, temporary store redirects and exact watch-invite tokens retain their existing behaviour. No fake lastmod dates or keyword meta tags added.

## Verification

- `npm run lint` (TypeScript), `npm run build`, `npm run check:seo` pass.
- Existing SEO/HTTP/media-share/watch-invite regressions pass.
- Added feature-page regression checks for distinct metadata, visible/schema FAQ agreement, active navigation, breadcrumbs, platform links, film/TV content and corrected claims. HTTP tests now cover every indexable route and slash redirects.
- Browser: desktop diary and TV screenshot inspection; phone-width 390px homepage, diary, TV page and feature overview DOM geometry; TV FAQ interaction. No horizontal overflow in the checked pages. Mobile browser screenshot capture scaled incorrectly, so no claim of complete mobile screenshot visual verification.
- Impeccable detector returned no findings on changed UI files before final screenshot additions; existing design colours/type preserved.

## Publication and measurement

Publishing is a separate step. After approval, use the existing corporate-site workflow, then verify production HTML/routes/sitemap, platform links and responsive UI. Submit the sitemap and inspect the diary/TV URLs in Search Console if access is available. Search Console ownership and submission were not changed. No ranking or traffic improvements are claimed; measure indexation, relevant impressions/clicks and actual downloads/first actions where tracking supports attribution.

Sources: Google Search Central SEO Starter Guide https://developers.google.com/search/docs/fundamentals/seo-starter-guide ; FAQ guidance https://developers.google.com/search/docs/appearance/structured-data/faqpage ; public Flixie store description and existing app/source/fixture evidence.

## Approved design and content application

User approved making the corporate site look like and have the content of the mockup. Applied the complete social-first homepage (“Your films. Your people.”), Odyssey friends example, official avatar art/borders, diary and TV tracking, communities/Watch Plans, hoodie Pip and direct platform CTAs. Added `/social-movie-app` and `/film-tv-communities` as distinct pages alongside the seven above. All nine feature pages have relevant screenshots/full-size links; four have additional detail views. Typed `featureVisuals.ts` ensures coverage and asset checks validate image links.

Palette: charcoal #141417, warm off-white #F5F1E9, CTA #B494EF, accent #C5A8F2, pale lavender diary/TV section #E9E0F1. Homepage and feature pages share the same palette. App screenshots and app palette unchanged. Measured key text/link/button contrast ratios 6.6–10.1:1. Desktop and mobile hero/feature layout checks retained in app output/corporate-seo-2026-10-28.

The Odyssey movie header composition is a mock using actual Flixie Friends widgets and fictional users/scores, labelled accordingly. Other captures use isolated fixture data; provider examples do not promise current availability. No production deployment performed by this application step.
