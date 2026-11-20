import { test } from 'node:test';
import assert from 'node:assert/strict';
import { titleMetadata } from '../src/titleMetadata';
import { catalogTitles, catalogKey, catalogPages } from '../src/catalog';
import { JSDOM } from 'jsdom';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { usePublicPageMetadata } from '../src/web/publicPageMetadata';

test('movie and show metadata keeps year, search intent and complete descriptions', () => {
  const metadata = titleMetadata({ title: 'Alien', releaseDate: '1979-05-25' });
  assert.equal(metadata.title, 'Alien (1979): Watchlist & Where to Watch | Flixie');
  assert.equal(metadata.description, 'Find where to watch Alien (1979), explore its cast and read public reviews. Save it to your Flixie watchlist.');
  assert(!titleMetadata({ title: 'Upcoming show', releaseDate: '' }).title.includes('()'));
  assert(!titleMetadata({ title: 'Unknown', releaseDate: 'TBA' }).title.includes('TBA'));
});

test('prerendered catalog metadata uses the same formatter as hydrated title pages', () => {
  for (const title of catalogTitles) {
    const metadata = titleMetadata(title);
    const page = catalogPages[catalogKey(title) as keyof typeof catalogPages];
    assert.equal(page.title, metadata.title);
    assert.equal(page.description, metadata.description);
    assert(page.description.endsWith('watchlist.'));
  }
});

test('loading a title preserves its year and updates search and social descriptions', async () => {
  const dom = new JSDOM('<div id="root"></div><title>Old</title><meta name="description"><meta property="og:title"><meta name="twitter:title"><meta property="og:description"><meta name="twitter:description">', { url: 'https://www.flixie.co.uk/movies/348' });
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;
  globalThis.window = dom.window as unknown as Window & typeof globalThis;
  globalThis.document = dom.window.document;
  const root = createRoot(document.getElementById('root')!);
  const metadata = titleMetadata({ title: 'Alien', releaseDate: '1979-05-25' });
  function Page() {
    usePublicPageMetadata('/movies/348', metadata.title, metadata.description);
    return null;
  }
  try {
    await act(async () => root.render(createElement(Page)));
    assert.equal(document.title, metadata.title);
    for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]'])
      assert.equal(document.querySelector(selector)?.getAttribute('content'), metadata.description);
    for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]'])
      assert.equal(document.querySelector(selector)?.getAttribute('content'), metadata.title);
  } finally {
    await act(async () => root.unmount());
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
    dom.window.close();
  }
});
