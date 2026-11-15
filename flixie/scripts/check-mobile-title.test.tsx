import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';
import { act, createElement } from 'react';
import { account, film } from '../src/web/models';
import { FlixieApi } from '../src/web/api';
import type { Session } from '../src/web/auth';
import type { Action } from '../src/web/actions';

const output = resolve(`.impeccable/review/mobile-title-${process.pid}.mjs`);
await mkdir(resolve('.impeccable/review'), { recursive: true });
const compiled = await build({ stdin: { contents: `export {TitlePage} from './src/web/pages';export {SessionContext} from './src/web/auth';`, resolveDir: process.cwd(), loader: 'tsx' }, bundle: true, write: false, format: 'esm', platform: 'node', packages: 'external', jsx: 'automatic', loader: { '.css': 'empty' }, define: { 'import.meta.env': '{}' } });
await writeFile(output, compiled.outputFiles[0].contents);
const runtime = await import(pathToFileURL(output).href);
after(() => unlink(output));

async function setup(kind: 'movie' | 'show', guest = false) {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', { url: 'http://127.0.0.1/movies/348' });
  dom.window.HTMLElement.prototype.scrollTo = () => {};
  dom.window.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  dom.window.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, Event: dom.window.Event, IS_REACT_ACT_ENVIRONMENT: true });
  const { createRoot } = await import('react-dom/client');
  const root = createRoot(dom.window.document.getElementById('root')!);
  const title = film({ id: 348, title: kind === 'movie' ? 'Alien' : 'The Newsroom', ...(kind === 'movie' ? { backdropUrl: '/actual-landscape.jpg' } : { backdropPath: '/actual-landscape.jpg' }), posterPath: '/portrait.jpg', overview: 'A real synopsis.', genres: ['Drama'], tmdbVoteAverage: 8, tmdbVoteCount: 75 }, kind);
  let favourite = false, saved = false, watched = false;
  const opens: Action[] = [], changes: string[] = [];
  const api = Object.assign(new FlixieApi('http://127.0.0.1:0', () => null, async () => { throw Error('Unexpected network'); }), {
    title: async () => title, credits: async () => ({ cast: [], directors: [{ id: 525, name: 'Christopher Nolan' }] }), publicReviews: async () => [], images: async () => [], titleFriends: async () => ({ friends: [], average: null, ratedCount: 0, watchedCount: 0, recommendedCount: 0 }), options: async () => ({ stream: [], rent: [], buy: [] }), savedProviders: async () => [], cinemaStatus: async () => ({}), detectedCountry: async () => 'GB',
    favouriteRanking: async () => favourite ? [{ film: title, rank: 1 }] : [], setFavourite: async () => { favourite = !favourite; changes.push('favourite'); return []; },
    seasons: async () => [{ id: 1, number: 1, name: 'Season 1', episodes: [{ id: 11, number: 1, season: 1, name: 'Pilot', date: '2012-06-24', still: '', runtime: 60, overview: 'Public episode description.', watched }] }],
    setEpisodeProgress: async () => { watched = !watched; changes.push('episode'); },
  });
  const owner = account({ id: 'fictional-owner', externalId: 'fictional-uid', username: 'Preview', country: { abbreviation: 'GB' } }, 'fictional-uid');
  const session: Session = { user: guest ? null : owner, identity: null, api, loading: false, error: '', local: true, signIn: async () => {}, join: async () => {}, provider: async () => {}, signOut: async () => {}, reset: async () => {}, reloadProfile: async () => {} };
  const render = async () => act(async () => root.render(createElement(runtime.SessionContext.Provider, { value: session }, createElement(runtime.TitlePage, { id: 348, kind, revision: changes.length, actions: { open: (action: Action) => opens.push(action), saved: () => saved, save: async (_film: unknown, value: boolean) => { saved = value; changes.push('watchlist'); await render(); }, busyIds: new Set(), refresh: () => {}, toast: () => {} } }))));
  await render();
  return { dom, opens, changes, title, click: async (selector: string) => act(async () => { (dom.window.document.querySelector(selector) as HTMLElement).click(); }), close: async () => { await act(async () => root.unmount()); dom.window.close(); } };
}

test('mobile title actions retain movie watchlist, favourite, review, provider and score-info outcomes', async () => {
  const t = await setup('movie');
  try {
    const doc = t.dom.window.document;
    assert.equal(doc.querySelectorAll('h1').length, 1);
    assert.equal(doc.querySelector('.fx-title-home')!.getAttribute('aria-label'), 'Home');
    assert.equal(doc.querySelector('.fx-title-home')!.getAttribute('href'), '/app');
    assert.match(doc.querySelector('.fx-title-artwork source')!.getAttribute('srcset')!, /actual-landscape/);
    assert.match(doc.querySelector('.fx-poster')!.getAttribute('src')!, /portrait/);
    await act(async () => doc.querySelector('.fx-title-artwork img')!.dispatchEvent(new t.dom.window.Event('error')));
    assert.equal(doc.querySelector('.fx-title-artwork'), null, 'failed landscape artwork falls back to the app ground');
    assert.equal(doc.querySelector('.fx-person-name')!.getAttribute('href'), '/people/525');
    await t.click('.fx-title-watchlist'); assert(t.changes.includes('watchlist')); assert.equal(doc.querySelector('.fx-title-watchlist')!.getAttribute('aria-pressed'), 'true');
    await t.click('.fx-title-favourite'); assert(t.changes.includes('favourite')); assert.equal(doc.querySelector('.fx-title-favourite')!.getAttribute('aria-pressed'), 'true');
    await t.click('.fx-title-rate'); assert.equal(t.opens.at(-1)?.type, 'log');
    await t.click('.fx-title-options'); assert.equal(t.opens.at(-1)?.type, 'options');
    await t.click('.fx-title-rating-info'); assert(doc.querySelector('dialog[open]')); assert.match(doc.querySelector('dialog')!.textContent!, /wider community/);
  } finally { await t.close(); }
});

test('show keeps episode tracking and spoiler controls; guests see public episode details and sign-in gates', async () => {
  for (const guest of [false, true]) {
    const t = await setup('show', guest);
    try {
      const doc = t.dom.window.document;
      assert.equal(doc.querySelector('.fx-title-rate'), null);
      assert.equal(doc.querySelector('.fx-title-home')!.getAttribute('href'), guest ? '/' : '/app');
      assert(doc.querySelector('a[href="#title-episodes"]'));
      const spoilers = doc.querySelector('input[type="checkbox"]') as HTMLInputElement;
      assert.equal(spoilers.checked, guest);
      if (!guest) await t.click('input[type="checkbox"]');
      assert.match(doc.querySelector('.fx-episode-copy')!.textContent!, /Pilot/);
      await t.click('.fx-episode-list button');
      if (guest) { assert.equal(t.opens.at(-1)?.type, 'login'); assert.equal(t.changes.length, 0); }
      else { assert(t.changes.includes('episode')); assert.equal(doc.querySelector('.fx-episode-list button')!.getAttribute('aria-pressed'), 'true'); }
    } finally { await t.close(); }
  }
});
