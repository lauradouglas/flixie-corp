import { readFileSync } from "node:fs";
import { DiaryRow, ReviewReader } from "../src/web/Diary";
import { test } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { homeSavedFilms } from "../src/web/homeSelection";
import {
  diaryCalendarDays,
  diaryDateKey,
  diaryMonthEntries,
  shiftDiaryMonth,
} from "../src/web/diaryDates";
import {
  currentCinemaStatus,
  cinemaFreshnessMs,
} from "../src/web/cinemaEvidence";
import { film, type DiaryEntry } from "../src/web/models";
import Footer from "../src/components/Footer";
import { FlixieApi } from "../src/web/api";

const movie = (id: number) => film({ id, title: `Film ${id}` });
const entry = (id: string, watchedAt: string | null) =>
  ({
    id,
    watchedAt,
    movie: movie(348),
    rating: 8,
    notes: "",
    watchedAtCinema: false,
    review: null,
  }) as DiaryEntry;
test("wide Home adds distinct actual saved films, prioritises Watch soon, and never treats shows as films", () => {
  const soon = [movie(348), movie(1368337)];
  const saved = [
    movie(348),
    film({ id: 99, title: "Show" }, "show"),
    movie(634649),
    movie(100),
  ];
  const result = homeSavedFilms(soon, saved);
  assert.deepEqual(
    result.map(({ film, watchSoon }) => [film.id, watchSoon]),
    [
      [348, true],
      [1368337, true],
      [634649, false],
    ],
  );
  assert.deepEqual(homeSavedFilms([], []), []);
  assert.equal(saved.length, 4);
  assert.equal(soon.length, 2);
});
test("calendar preserves watched date, leap days, Monday alignment, year transitions and undated entries", () => {
  assert.equal(diaryDateKey("2026-11-14T00:00:00.000Z"), "2026-11-14");
  assert.equal(diaryDateKey("2026-11-14"), "2026-11-14");
  for (const value of [null, "", "2026-02-30", "invalid"])
    assert.equal(diaryDateKey(value), null);
  const days = diaryCalendarDays("2024-02");
  assert.equal(days[0], null);
  assert.equal(days[3], "2024-02-01");
  assert(days.includes("2024-02-29"));
  assert.equal(days.length % 7, 0);
  assert.equal(shiftDiaryMonth("2026-12", 1), "2027-01");
  assert.equal(shiftDiaryMonth("2026-01", -1), "2025-12");
  const entries = [
    entry("a", "2026-11-14"),
    entry("b", "2026-10-31"),
    entry("c", null),
  ];
  assert.deepEqual(
    diaryMonthEntries(entries, "2026-11").map((e) => e.id),
    ["a"],
  );
  assert.equal(entries.length, 3);
});
test("cinema badge requires fresh positive membership for the exact country and known source", () => {
  const now = Date.UTC(2026, 10, 15, 12);
  const listed = {
    region: "GB",
    inCinemas: true,
    source: "TMDB now playing",
    checkedAt: new Date(now - 1000).toISOString(),
  };
  assert(currentCinemaStatus(listed, "GB", now));
  for (const bad of [
    { ...listed, region: "US" },
    { ...listed, inCinemas: null },
    { ...listed, source: "release date" },
    { ...listed, checkedAt: new Date(now - cinemaFreshnessMs).toISOString() },
    { ...listed, checkedAt: new Date(now + 1000).toISOString() },
    {},
  ])
    assert.equal(currentCinemaStatus(bad, "GB", now), null);
});
test("cinema lookup is anonymous and country specific", async () => {
  let path = "";
  const api = new FlixieApi(
    "http://127.0.0.1:3000",
    () => null,
    async (p, options) => {
      path = String(p);
      assert.equal(
        (options?.headers as Record<string, string>).Authorization,
        undefined,
      );
      return new Response("{}");
    },
  );
  await api.cinemaStatus(348, "GB");
  assert.equal(
    path,
    "http://127.0.0.1:3000/movies/348/cinema-status?region=GB",
  );
});
test("shared footer retains corporate, app-review and real store destinations on all shell variants", () => {
  for (const compact of [true, false]) {
    const html = renderToStaticMarkup(
      createElement(Footer, { year: 2026, compact }),
    );
    for (const path of [
      "/films",
      "/app",
      "/features",
      "/about",
      "/faqs",
      "/contact",
      "/privacy",
      "/terms",
      "/contact#account-deletion",
    ])
      assert(html.includes(`href="${path}"`), path);
    assert(html.includes("apps.apple.com"));
    assert(html.includes("play.google.com"));
    assert(html.includes("data-shared-footer"));
    assert.equal((html.match(/id="main-footer"/g) ?? []).length, 1);
  }
});


test('diary list never expands a review body or spoiler title into the row', () => {
  const watched = {...entry('reviewed', '2026-11-14'), notes:'Private diary memory', review:{id:'review-1', title:'Spoiler title', body:'Spoiler body', containsSpoilers:true}};
  const html=renderToStaticMarkup(createElement(DiaryRow,{entry:watched}));
  assert(html.includes('Private diary memory')); assert(html.includes('Read your review')); assert(html.includes('Spoilers'));
  assert(!html.includes('Spoiler title')); assert(!html.includes('Spoiler body')); assert(!html.includes('<details'));
});
test('opened reader protects both spoiler title and body, keeps private notes separate, and supports untitled reviews', () => {
  const watched = {...entry('reviewed', '2026-11-14'), notes:'Private diary memory', review:{id:'review-1', title:'Spoiler title', body:'Spoiler body', containsSpoilers:true}};
  const hidden=renderToStaticMarkup(createElement(ReviewReader,{entry:watched,onClose:()=>{}}));
  assert(hidden.includes('Reveal review')); assert(!hidden.includes('Spoiler body')); assert(!hidden.includes('Spoiler title')); assert(!hidden.includes('Private diary memory'));
  const visible=renderToStaticMarkup(createElement(ReviewReader,{entry:{...watched,review:{...watched.review,title:'',body:'Public review body',containsSpoilers:false}},onClose:()=>{}}));
  assert(visible.includes('Public review body')); assert(!visible.includes('Reveal review')); assert(!visible.includes('Private diary memory')); assert(!visible.includes('<h3></h3>'));
});


test('native button palette keeps readable text in both website themes', () => {
  const css=readFileSync(new URL('../src/theme.css',import.meta.url),'utf8')+readFileSync(new URL('../src/web/web.css',import.meta.url),'utf8');
  assert(css.includes('--fx-brand: #7c4dff;'));
  assert(css.includes('--fx-gold: light-dark(#8c630e, #ffc857);'));
  assert(css.includes('--fx-danger: light-dark(#ad3c50, #e57373);'));
  assert(css.includes('--fx-share: light-dark(#185ab0, #5599ff);'));
  assert(css.includes('color-scheme: light dark;'));
  assert(css.includes('--fx-brand-shade: #6534e8;'));
  assert.match(css, /\.fx-button\.fx-primary:hover\s*\{[^}]*background: var\(--fx-brand-shade\);[^}]*filter: none;/);
  const luminance=(hex:string)=>{const rgb=hex.match(/\w\w/g)!.map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
  const contrast=(a:string,b:string)=>{const values=[luminance(a),luminance(b)].sort((a,b)=>b-a);return (values[0]+.05)/(values[1]+.05);};
  for(const [text,bg] of [['ffffff','7c4dff'],['ffffff','6534e8'],['ad3c50','ffffff'],['8c630e','ffffff'],['185ab0','ffffff'],['e57373','1e1f30'],['ffc857','1e1f30'],['5599ff','1e1f30']]) assert(contrast(text,bg)>=4.5,`${text} on ${bg}`);
  // Calculate the actual selected surface, rather than assuming a white background.
  const actions=readFileSync(new URL('../src/web/home-layout.css',import.meta.url),'utf8');
  const selected=actions.match(/fx-title-watchlist\[aria-pressed="true"\]\s*\{([^}]+)/)![1];
  const weights=[...selected.matchAll(/var\(--fx-gold\)\s+([\d.]+)%/g)].map(match=>Number(match[1])/100);
  assert.equal(weights.length,2,'selected surface must declare both theme mixes');
  const mix=(color:string,surface:string,weight:number)=>color.match(/\w\w/g)!.map((value,i)=>Math.round(parseInt(value,16)*weight+parseInt(surface.slice(i*2,i*2+2),16)*(1-weight)).toString(16).padStart(2,'0')).join('');
  assert(contrast('8c630e',mix('8c630e','ffffff',weights[0]))>=4.5,'selected gold label on light tint');
  assert(contrast('ffc857',mix('ffc857','1e1f30',weights[1]))>=4.5,'selected gold label on dark tint');

});
