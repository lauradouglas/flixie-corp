import assert from 'node:assert/strict';
import { watchInviteOpenLink } from '../src/watchInvite';

const token = 'a'.repeat(43);
for (const device of ['ios', null] as const) {
  assert.equal(watchInviteOpenLink(`?watch=${token}`, device), `flixie:///invite?watch=${token}`);
}
const android = watchInviteOpenLink(`?watch=${token}`, 'android')!;
assert.ok(android.startsWith(`intent:///invite?watch=${token}#Intent;scheme=flixie;package=com.flixie.app;`));
assert.ok(android.includes('S.browser_fallback_url=' + encodeURIComponent('https://play.google.com/store/apps/details?id=com.flixie.app')));
for (const search of ['', '?code=referral', '?watch=', '?watch=short', `?watch=${'a'.repeat(44)}`, `?watch=${token}&watch=${token}`, `?watch=${'a'.repeat(42)}%2F`, '?watch=https://evil.example', '?watch=javascript:alert(1)']) {
  assert.equal(watchInviteOpenLink(search, 'ios'), null, search);
}
assert.equal(watchInviteOpenLink(`?code=referral&watch=${token}`, 'ios'), `flixie:///invite?watch=${token}`);
console.log('Watch invites retain their exact token and safely open iOS/Android; malformed and duplicate tokens are rejected.');
