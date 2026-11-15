# Mobile and authentication polish —15 November 2026

Mode: Operate. User reports ugly saved state and duplicated upper navigation on
an actual iPhone, and an ugly Material-like Flixie background behind Apple sign-in.
Keep five bottom tabs, profile/badges in header, app theme and full-width app link.
Robust CSS prevents shared stylesheet order from restoring old desktop mobile
navigation/search/sign-out. Native gold saved control has dark readable ink and
shorter label; blue Share/red favourite retain their semantics. Touch hover does
not mimic a second active tab. Under22rem container width, actions stack for
narrow phones/enlarged text. Existing routes, membership APIs and data unchanged.

Provider waiting/profile loading use official F, theme and typography. Preserve
form draft, busy lock, checked terms/sharing semantics and existing Firebase flow;
cancellation restores one form/error and focus. Live Apple initiation was blocked
by automatic approval review (external session risk); no bypass. Fictional local
provider simulation and regression tests cover waiting/cancel/profile handoff,
not a real Apple round trip. Corporate7f008f2 release succeeded separately via
workflow43747753737 with notification job skipped.

Verification:122 checks/types/build35 pass. Real shared component/compiled-CSS
fixture loads shared/base CSS last, confirming sidebar/search/sign-out hidden on
phone, one active bottom link, profile44px, golden saved control and blue Share.
Dark/light390px captured; desktop1440px retains sidebar/search and hides tabs.
200% root text uses one action column without clipping/page overflow. All local
fixture accounts and provider callbacks are fictional, with no API/auth request.
Final source review and publication recorded below.
