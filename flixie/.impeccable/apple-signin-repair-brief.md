# Apple sign-in restoration —15 November2026

Mode: Operate. User reports that the newly deployed direct Apple SDK flow returns
to Flixie sign-in after Face ID/Apple confirmation. Their earlier Firebase Apple
round trip was user-verified. This is a regression in the newly introduced path;
the exact failing direct-SDK stage/error was not captured on the physical phone.
Restore the user-verified end-to-end Firebase popup with OAuthProvider apple.com,
keeping official branded buttons and the owned Flixie waiting/cancel presentation.

Remove the direct Apple script, separate nonce/credential exchange, preparation
gate, retry UI and their obsolete isolated tests. Do not add implicit linking,
create another account, change credentials/domains/secrets or autoaccept Terms.
Provider credential errors must not ask for an email/password. The white Firebase
transition page returns with this restoration; removing it remains unresolved.
Do not claim that aesthetic requirement is complete or a physical retest passed.

Verification:126 browser regressions, TypeScript and build35 pass. Four replacement
regressions run the actual AuthProvider/AccountGate against a fake Firebase network
boundary: Apple/Google existing-member continuity and one request on repeated click,
cancellation/form/focus recovery, provider-context errors, and explicit setup with
unchecked Terms for an identity without a profile. No real token/account or popup
is used. Existing fixtures/brand presentation and compact Friends remain intact.
The removed tests asserted the now-retired standalone nonce controller; they were
not weakened to accept a failing path. No new visual world or native/backend edit.
