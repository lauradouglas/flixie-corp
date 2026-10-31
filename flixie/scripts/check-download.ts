import assert from 'node:assert/strict';
import { downloadDestination } from '../src/download';
import { site } from '../src/site';
for (const ua of ['Mozilla iPhone Instagram', 'Mozilla iPad', 'Mozilla iPod']) assert.equal(downloadDestination(ua, 'iPhone', 1), site.iosUrl);
assert.equal(downloadDestination('Mozilla Android Instagram', 'Linux armv8l', 5), site.androidUrl);
assert.equal(downloadDestination('Mozilla Macintosh Safari', 'MacIntel', 5), site.iosUrl);
assert.equal(downloadDestination('Mozilla Macintosh Safari', 'MacIntel', 0), null);
assert.equal(downloadDestination('Mozilla Windows Chrome', 'Win32', 0), null);
assert.equal(downloadDestination('', '', 0), null);
console.log('Download device routing checks passed, including Instagram, iPad desktop mode and desktop fallback.');

const ad = '?utm_source=instagram&utm_medium=paid_social&utm_campaign=diary_first_boost';
for (const query of [ad, '?utm_source=instagram', '?utm_campaign=unrecognised', '?utm_source=instagram&fbclid=example']) {
  assert.equal(downloadDestination('Mozilla iPhone Instagram', 'iPhone', 1, query), site.iosUrl, 'Tagged iPhone visits open the App Store');
  assert.equal(downloadDestination('Mozilla Android Instagram', 'Linux', 1, query), site.androidUrl, 'Tagged Android visits open Google Play');
  assert.equal(downloadDestination('Mozilla Macintosh Safari', 'MacIntel', 5, query), site.iosUrl, 'iPad desktop mode still opens the App Store');
  assert.equal(downloadDestination('Mozilla Macintosh Safari', 'MacIntel', 0, query), null, 'Desktop keeps store choices');
}
console.log('Tagged ad routing checks passed for iPhone, Android, iPad and desktop.');
