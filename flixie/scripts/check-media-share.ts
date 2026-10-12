import assert from 'node:assert/strict';
import { sharedMediaAppLink, sharedMediaStore } from '../src/mediaShare';
import { pageFromPath } from '../src/site';
for (const [path, expected] of [['/movies/348', 'flixie:///movies/348?source=shared_link'], ['/shows/1399', 'flixie:///shows/1399?source=shared_link']]) {
  assert.equal(sharedMediaAppLink(path), expected);
  assert.equal(pageFromPath(path), 'mediaShare');
}
for (const path of ['/movies/0', '/movies/-1', '/movies/1/script', '/movies/2147483648', '//evil.com/movies/348', '/shows/not-a-show']) {
  assert.equal(sharedMediaAppLink(path), null);
}
assert.equal(pageFromPath('/privacy'), 'privacy');
console.log('Movie/show web links and safe app destinations pass.');

assert.equal(sharedMediaStore('Mozilla iPhone', 'iPhone', 5), 'ios');
assert.equal(sharedMediaStore('Mozilla iPad', 'iPad', 5), 'ios');
assert.equal(sharedMediaStore('Mozilla Macintosh', 'MacIntel', 5), 'ios');
assert.equal(sharedMediaStore('Mozilla Android', 'Linux', 5), 'android');
assert.equal(sharedMediaStore('Mozilla Macintosh', 'MacIntel', 0), null);
assert.equal(sharedMediaStore('Mozilla Windows', 'Win32', 0), null);
console.log('Device-aware automatic store targets pass, including iPad desktop mode.');
