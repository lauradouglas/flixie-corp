# Compact title Friends —15 November2026

Mode: Operate. User explicitly selected the Compact list mobile mockup and asked
for implementation. Preserve the app palette and current private title-opinion
contract. Replace the oversized filled card with a compact section on the page
surface: title/privacy, score beside Friends’ average/rating count, watched and
recommendation totals, then one aligned list. Every person retains their actual
avatar/badge border, profile links, score and truthful activity status. Do not
invent a score for an unrated friend, infer a recommendation, expose unflagged
review text or fetch private friends for a guest. Films and shows share the UI.

Use44px avatars/links,12px row gap,16px vertical padding and dividers only between
people; preserve responsive rem type, browser enlargement and wrapping names.
At most52rem of readable width on desktop. Below16rem local text-relative width,
move ratings beneath metadata to protect meaningful text at200% enlargement.
Guests, loading, errors and no-activity states retain existing behavior. Existing
local guarded movie-opinion seeds remain available; verification uses fictional
accounts without changing a database. Native Flutter/app behavior is unchanged.

Verification:128 browser regressions/types/build35/SEO29/HTTP pass. One scoped
layout detector pass found no issues. Built-CSS real FriendsSection with fictional
API data confirms390px dark,1440px light and320px/200% long-name reflow. Avatar
links navigate to the matching profile; each actual badge selection is retained,
including Christmas and no-border cases.44px avatars,350px non-overflowing phone
list,832px desktop cap and zero final divider are measured. Unrated data shows
no fabricated score; guest sign-in callback works. The first enlarged-text pass
revealed squeezed status words; one correction moves score below metadata at
16rem local width and the confirmation passes at280px content width. Loading,
empty and retry paths remain the existing source branches. Scoped finish: ship.
