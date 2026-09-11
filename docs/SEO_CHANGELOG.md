# SEO changelog

## 2026-09-11 — Azure deployment fix

- Removed separately declared trailing-slash routes from `flixie/scripts/prerender.mjs`: Azure rejected `/features/` and `/features` as duplicate rules.
- Set `trailingSlash: "never"` in `flixie/public/staticwebapp.config.json`, using Azure’s native redirect setting.
- Updated preview handling and regression checks for normalized route uniqueness, public-page slash redirects and synthetic invitation query preservation.
- TypeScript, production build, SEO and local HTTP checks passed. Azure deployment must be retried with this new commit; local preview is not Azure validation.

## 2026-09-11 - Follow-up

- Updated homepage title and description to explicitly explain movie tracking and social discovery (`flixie/src/site.ts`).
- Added minimal Flixie Organization JSON-LD using its confirmed brand name, URL and existing logo; connected WebSite publisher (`flixie/src/seo.ts`).
- Extended generated-output validation to catch missing schema references and inaccessible local schema logo paths (`flixie/scripts/check-seo.mjs`).
- Added the requested positioning, keyword themes, implementation inventory, maintenance workflow and prioritised content/technical roadmap (`docs/SEO.md`).
- Corrected outdated statements about missing native app configuration (`docs/seo/implementation-notes.md`): the inspected Flutter project already contains it; distributed builds still require device verification.
- Deferred deployment/edge DNS changes, account-based measurement, public iOS Smart App Banner, research-dependent landing pages and programmatic content. No new dependencies or visual layout changes.
- Validation passed: TypeScript (`npm run lint`), production build, eight-page/six-URL SEO checks, local HTTP checks and `git diff --check`. HTTP checks required permission to bind a localhost port; they passed on rerun. No Lighthouse or physical-device results claimed.

## 2026-09-11 - Earlier implementation in this worktree

- Added build-time HTML rendering, central metadata, canonical routes, sitemap/robots generation, JSON-LD and social cards (`flixie/src/site.ts`, `src/seo.ts`, `src/entry-server.tsx`, `scripts/prerender.mjs`, `public/og/`).
- Improved navigation, download clarity, semantics, accessibility and product copy; added About/404 pages (`flixie/src/components/`, `src/index.css`).
- Optimised hero/logo assets, reduced font loading and split page bundles (`flixie/src/assets/`, `src/views.ts`, `index.html`).
- Added Apple and Android website associations (`flixie/public/.well-known/`, `public/staticwebapp.config.json`).
- Added production-preview/SEO/HTTP checks and wired verification into the existing deployment workflow (`flixie/scripts/`, `package.json`, `.github/workflows/build.yml`).
- Recorded the audit and implementation details (`docs/seo/`). These changes remain local; no production deployment or field performance results are implied.
