# Flixie browser experience

Flixie is an existing movie and TV companion with iOS/Android apps, an existing React/Vite marketing website and an existing backend/Firebase identity. It helps people choose films, keep watchlists and a diary, track TV episodes and arrange film nights with friends. Viewing happens through users’ own services.

On 14 November 2026 the user approved building the signed-in Home and public shared-title concept in the existing website with the existing backend. The scope now includes connected watchlist, diary, picker, TV progress, friend activity and read-only plans; public film/show information and deliberately public reviews; desktop/mobile download prompts; and public search discovery pages. Work is local and reviewable; production publication has not been requested.

Keep the Flixie identity: white `flix` / purple `ie` wordmark on dark chrome, official F icon, Manrope, Pip, full portrait posters, each user’s own awarded/selected badge border, 14px body copy and bottom sheets for choices. Public pages must not expose personal diary notes, friends, plans or private reviews. Honour blocks and spoilers.

The public browse surface and eight initial film/TV pages are prerendered for search. Private application routes stay noindex. Indexing and rankings are not guaranteed. Desktop shows both store links; mobile provides a native Safari app banner or a compact dismissible device-aware store prompt after scrolling.

See docs/web-app.md for exact scope, local fixture credentials, backend contract, configuration, tests, catalogue refresh and release dependencies. Native app parity, full plan editing, chat and games remain outside this first slice.
