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

assert.equal(downloadDestination('Mozilla iPhone Instagram', 'iPhone', 1, '?utm_source=instagram'), null, 'Tagged ads retain an immediately usable store-choice landing page');
assert.equal(downloadDestination('Mozilla Android Instagram', 'Linux', 1, '?utm_campaign=unrecognised'), null);
