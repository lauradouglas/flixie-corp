# Country-aware discovery —15 November2026

Mode: Operate. Ordinary extension of the approved homepage; preserve Manrope,
app light/dark theme, complete posters, phone header, corporate/legal access and
centered desktop dialogs. User requests saved country for members, guest country
detection, and the same country for cinema and popular movies instead of US.

Members use saved profile country ahead of guest preferences across sign-in and
account changes. A manual page override is temporary and resets on account or
profile-country change; it never edits the profile. Guest saved manual choice
wins over approximate country-only IP detection, cached for one hour in the
session. Detection runs
inside the existing Flixie backend using a checksum-verified public-domain MMDB;
no third-party visitor lookup, GPS prompt, city/coordinates, IP logging or account
country mutation. Failed detection falls back honestly to GB with a usable manual
selector. All250 existing Flixie country choices are accepted, not only ten
presets; UK/XI normalize toGB. The initial manual-GB/ten-country and default-US
popular movie behavior is historical and superseded by this explicit request.

One country selector above the shelves controls popular movies and cinema.
Cinema and popular movie state keys include country and clear old results on
change. Saved GB SSR movie snapshot and refresh script are explicitly regional; never borrow it for
other-country failures. TV stays the existing non-regional popular list. Member
Explore films & TV opens the same public discovery inside the existing app shell,
while personal Home remains. Provider/cinema title previews and Watch options
inherit the same resolver. Existing auth/Terms gates, private-data boundaries,
noindex app routes and anonymous discovery transport remain.

The first-party backend uses a verified7.9MB PDDL public-domain MMDB and MIT
maxmind reader. Azure's overwritten client-ip is used only on Azure; elsewhere
use socket IP. Anonymous response is country/source only with no-store/noindex.
No runtime dataset download or scheduler is added; refresh requires reviewed
checksum/provenance, tests and release. Parent-authored Privacy text/date describe
this behavior. The country label/select wrap with a10rem select basis so enlarged
text can move the selector to its own full line.

Supplied120 website checks/types/build35/SEO29 and993 backend checks/types/build
pass, including compiled database path. Desktop1440/phone390 are actual Ireland
browser captures;320px/200% light is a passive current-DOM fixture with serialized
Ireland/eager images, not interactive OS/theme evidence. The reviewer scored the
country-row fix resolved across all three rebuilt captures. Documentation is now
reconciled for its final verdict. Source is complete locally. Backend993 CI checks
passed and5e4985524b43481763f14b9f18e88cab2bf1f56b is deploying through isolated
workflow43743118572; website publication awaits final verdict/backend readiness
and an exact new release receipt. Prior13fcdd1 homepage publication is historical.
No real-account, schema/data-job, native release or notification claim is added.
