<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/6614dab1-b5be-4af9-842c-719634f9021b

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## Campaign analytics

Instagram ads use `/download` with approved `utm_source`, `utm_medium`,
`utm_campaign` and `utm_content` labels (see `src/campaign.ts`). Tagged visits
show the store choices; untagged mobile visits keep automatic store routing.
Downloads work with analytics declined. `/android` and `/iphone` are HTTP
redirects and do not produce page events.

Website analytics is separate from the app consent choice. The official
PostHog browser SDK loads only after explicit acceptance, only on a production
build at `https://www.flixie.co.uk`. Local previews are silent. Analytics choices
at the footer allows withdrawal. Controlled campaign labels expire after 30 days;
no URLs, click IDs, private text, automatic clicks, replay or person profiles.
The app and website do not share analytics identity, and store clicks are not
installs or signups. No deferred install attribution is implemented.

Example ad URL:
`https://www.flixie.co.uk/download?utm_source=instagram&utm_medium=paid_social&utm_campaign=launch&utm_content=diary_video`

Run `npm run check:analytics`, `npm run lint`, `npm run build`, and
`npm run check:seo`. For browser SDK validation, intercept all PostHog requests
and route the production origin to a local preview: never send fictional
events to the production project. The SDK filters headless user agents as bots;
use a normal simulated user agent in that isolated check. Verify links in
physical iOS/Android Instagram after deployment before spending on ads.
