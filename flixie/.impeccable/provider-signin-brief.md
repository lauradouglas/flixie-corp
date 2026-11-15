# Standard provider sign-in —15 November2026

Mode: Operate. User identified the white Firebase “Continue to the app” helper on
an iPhone and explicitly approved removing it alongside standard Apple/Google
buttons. The earlier themed waiting screen did not address this external helper.
Preserve the incumbent app world, email flow, explicit Terms/sharing choices,
Firebase identities and profile completion. No native/backend/schema changes.

Use official provider artwork, black/white branded controls, real text and48px
minimum targets. Prepare Apple SDK/cryptographic nonce before the gesture; call
Apple's popup synchronously on the click. Use the already registered Services ID
and return URL with web_message popup mode, validate state and exchange its ID
token plus raw nonce via Firebase's credential API. Never fallback through the
old helper, persist tokens/nonces, or autoaccept account Terms. Cancellation and
script errors permit explicit retry; Google and email remain available.

Friends mobile comparison is mockup-only: compact list, ratings grid and reviews
first, all using fictional activity, app colours and individual avatar borders.
Do not deploy a Friends redesign before the user selects it.

Verification and release evidence to be appended after focused checks.

Focused verification:128 browser checks, TypeScript, build35, SEO29/HTTP and
analytics pass. Actual Apple1.5.7 SDK offline window interception confirms
web_message returns its promise to the original page; no real login initiated.
Real AuthForm built-CSS fixture verifies390px dark,1440px light,200% text wrapping,
50px standard targets, loaded artwork, waiting/cancellation and focus recovery.
Friends variants/review expansion fit a288px inner phone without overflow.
One detector pass found the intentional Google font exception, now documented in
DESIGN.md, plus existing/pinned provider-colour/size advisories. No blocking
finding remains after scoped source/interaction review. Disposition: ship.
