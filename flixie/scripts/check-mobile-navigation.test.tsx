import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import MobileNavigation, { activeNavigation, appNavigation } from '../src/web/MobileNavigation';
import { parseRoute } from '../src/web/routing';

test('mobile navigation exposes five real destinations and keeps the own profile separate',()=>{
  const html=renderToStaticMarkup(<MobileNavigation active="plans"/>);
  const links=[...html.matchAll(/<a\s[^>]*>/g)].map(match=>match[0]);
  assert.equal(links.length,5);
  for(const path of ['/app','/app/watchlist','/app/diary','/app/friends','/app/plans'])assert(links.some(link=>link.includes(`href="${path}"`)));
  assert(!html.includes('href="/app/profile"'));assert(html.includes('aria-label="Film diary"'));assert(html.includes('aria-label="Watch Plans"'));
  assert.equal(links.filter(link=>link.includes('aria-current="page"')).length,1);assert(links.find(link=>link.includes('aria-current="page"'))?.includes('href="/app/plans"'));
  assert.deepEqual(appNavigation.map(item=>item.page),['home','watchlist','diary','friends','plans','profile']);
});
test('route changes and browser history identify the correct destination, including profiles and discovery',()=>{
  for(const [path,expected] of [['/app','home'],['/app/watchlist','watchlist'],['/app/diary','diary'],['/app/friends','friends'],['/app/plans','plans'],['/app/profile','profile'],['/movies/348','home'],['/shows/15621','home'],['/people/525','home'],['/app/search?q=Alien','home'],['/app/profiles/alex','profile'],['/app/profiles/jamie','friends']] as const){
    const url=new URL(path,'https://example.invalid');assert.equal(activeNavigation(parseRoute(url.pathname,url.search),'alex'),expected,path);
  }
  assert.equal(activeNavigation(parseRoute('/app/sign-in'),'alex'),null);
  const profile=renderToStaticMarkup(<MobileNavigation active="profile"/>);assert(!profile.includes('aria-current="page"'));
});
