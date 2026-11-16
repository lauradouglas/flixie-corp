import {test} from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {act} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {FlixieApi} from '../src/web/api';
import {SessionContext,type Session} from '../src/web/auth';
import PublicHomePage,{PublicHomeShell} from '../src/web/PublicHome';
import {discoveryFilms,discoveryYear,discoveryCountry} from '../src/web/publicDiscovery';
import {safeNext} from '../src/web/routing';
import type {PageActions} from '../src/web/pages';

const row=(id:number,title=`Film ${id}`)=>({id,title,poster:'/poster.jpg',releaseDate:'13 Nov 2026'});
test('public discovery retains source ordering and safe artwork/year, drops private data and duplicate or malformed rows',()=>{
  const result=discoveryFilms([{...row(2),reviews:['PRIVATE'],userId:'PRIVATE',voteAverage:10},row(2),row(1),{...row(3),poster:'https://other.invalid/private.jpg'},{...row(4),id:-1},{id:5}],'show');
  assert.deepEqual(result.map(f=>f.id),[2,1,3]);
  assert.equal(result[0].kind,'show');assert.equal(discoveryYear(result[0].releaseDate),'2026');
  assert.equal(result[2].posterPath,'');assert.equal(result[0].score,null);
  assert(!JSON.stringify(result).includes('PRIVATE'));
  for(const value of [null,{},'bad'])assert.throws(()=>discoveryFilms(value,'movie'));
  assert.equal(discoveryYear('Mon Sep 20 1999'),'1999');assert.equal(discoveryYear(''),'');
  assert.equal(discoveryCountry('uk'),'GB');assert.equal(discoveryCountry('XI'),'GB');assert.equal(discoveryCountry('ES'),'ES');assert.equal(discoveryCountry('invalid'),'GB');
});
test('public film, TV and selected-country cinema feeds never read identity, send bearer or send cookies',async()=>{
  const calls:{url:string;init?:RequestInit}[]=[];
  const api=new FlixieApi('https://example.invalid',()=>{throw Error('Identity must not be accessed');},async(url,init)=>{calls.push({url:String(url),init});return new Response(JSON.stringify([row(1)]),{status:200});});
  await api.discovery('movie');await api.discovery('show');await api.cinemaDiscovery('IE');
  assert.deepEqual(calls.map(c=>new URL(c.url).pathname+new URL(c.url).search),['/movies/popular?region=GB','/shows/popular','/movies/now_playing?region=IE']);
  for(const c of calls){assert.equal(c.init?.credentials,'omit');assert.equal((c.init?.headers as Record<string,string>).Authorization,undefined);}
  await assert.rejects(api.cinemaDiscovery('XX'));assert.equal(calls.length,3);
});
test('server homepage has crawlable films/shows and working account/company/legal links, without a stale cinema claim',()=>{
  const {document}=new JSDOM(renderToStaticMarkup(<PublicHomeShell/>)).window;
  assert.equal(document.querySelectorAll('h1').length,1);
  assert.equal(document.querySelector('h1')?.textContent,'Your next good watch.');
  assert.equal(document.querySelectorAll('.fx-discovery-film').length,10);
  assert(document.querySelector('.fx-discovery-film a[href^="/movies/"]'));
  assert(document.querySelector('#public-shows a[href^="/shows/"]'));
  assert.equal(document.querySelectorAll('.fx-discovery-cinema-card').length,0);
  assert(document.querySelector('#public-cinema')?.textContent?.includes('Checking cinema releases'));
  for(const href of ['/features','/about','/welcome','/privacy','/terms','/contact#account-deletion'])assert(document.querySelector(`a[href="${href}"]`),href);
  assert.equal(document.querySelector('form[role=search]')?.getAttribute('action'),'/app/search');
  assert.equal(safeNext('/'),'/');assert.equal(safeNext('/welcome'),'/app');
  for(const anchor of document.querySelectorAll<HTMLAnchorElement>('.fx-discovery-moods a')){
    const next=new URL(anchor.href,'https://www.flixie.co.uk').searchParams.get('next');
    assert(next==='/app?pick=laugh'||next==='/app?pick=hooked');
  }
});
test('changing cinema country clears old results, ignores a late earlier country, and visible cards retain save/detail actions',async()=>{
  const dom=new JSDOM('<div id="test"></div>',{url:'https://www.flixie.co.uk/'});
  Object.assign(globalThis,{window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,Event:dom.window.Event,localStorage:dom.window.localStorage,IS_REACT_ACT_ENVIRONMENT:true});
  const pending=new Map<string,(response:Response)=>void>();
  const api=new FlixieApi('https://example.invalid',()=>null,async(url)=>{
    const target=new URL(String(url));
    if(target.pathname==='/movies/now_playing'){
      const region=target.searchParams.get('region')!;
      if(region==='GB')return new Response(JSON.stringify([row(348,'GB Alien')]),{status:200});
      return new Promise<Response>(resolve=>pending.set(region,resolve));
    }
    return new Response(JSON.stringify([row(1,'Popular fixture')]),{status:200});
  });
  const session={api,user:null,identity:null,loading:false,error:'',local:false} as Session;
  const saves:number[]=[];
  const actions:PageActions={open:()=>{},save:async f=>{saves.push(f.id);},saved:()=>false,busyIds:new Set(),refresh:()=>{},toast:()=>{}};
  const {createRoot}=await import('react-dom/client');const root=createRoot(dom.window.document.getElementById('test')!);
  try{
    await act(async()=>{root.render(<SessionContext.Provider value={session}><PublicHomePage actions={actions}/></SessionContext.Provider>);});
    assert(dom.window.document.querySelector('#public-cinema')?.textContent?.includes('GB Alien'));
    const select=dom.window.document.querySelector<HTMLSelectElement>('select[aria-label="Browsing country"]')!;
    await act(async()=>{select.value='US';select.dispatchEvent(new dom.window.Event('change',{bubbles:true}));});
    assert(!dom.window.document.querySelector('#public-cinema')?.textContent?.includes('GB Alien'));
    assert(dom.window.document.querySelector('#public-cinema')?.textContent?.includes('Checking cinema releases for United States'));
    await act(async()=>{select.value='IE';select.dispatchEvent(new dom.window.Event('change',{bubbles:true}));});
    await act(async()=>{pending.get('US')!(new Response(JSON.stringify([row(2,'Late US film')]),{status:200}));});
    assert(!dom.window.document.querySelector('#public-cinema')?.textContent?.includes('Late US film'));
    await act(async()=>{pending.get('IE')!(new Response(JSON.stringify([row(3,'Irish film')]),{status:200}));});
    assert.equal(dom.window.document.querySelector('.fx-discovery-cinema-card')?.getAttribute('href'),'/movies/3');
    assert.equal(dom.window.localStorage.getItem('flixie-cinema-country'),'IE');
    await act(async()=>{dom.window.document.querySelector<HTMLButtonElement>('.fx-discovery-save')!.click();});
    assert.deepEqual(saves,[1]);
  }finally{await act(async()=>root.unmount());dom.window.close();}
});

async function countryPage(transport:(url:string)=>Promise<Response>,run:(page:{dom:JSDOM;render:(value:Partial<Session>)=>Promise<void>})=>Promise<void>,stored?:string) {
  const dom=new JSDOM('<div id="country-test"></div>',{url:'https://www.flixie.co.uk/'});
  Object.assign(globalThis,{window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,Event:dom.window.Event,localStorage:dom.window.localStorage,sessionStorage:dom.window.sessionStorage,IS_REACT_ACT_ENVIRONMENT:true});
  if(stored)dom.window.localStorage.setItem('flixie-cinema-country',stored);
  const api=new FlixieApi('https://example.invalid',()=>{throw Error('Discovery must not read identity');},url=>transport(String(url)));
  const actions:PageActions={open:()=>{},save:async()=>{},saved:()=>false,busyIds:new Set(),refresh:()=>{},toast:()=>{}};
  const {createRoot}=await import('react-dom/client');const root=createRoot(dom.window.document.getElementById('country-test')!);
  const base={api,user:null,identity:null,loading:false,error:'',local:false} as Session;
  const render=async(value:Partial<Session>)=>{await act(async()=>root.render(<SessionContext.Provider value={{...base,...value}}><PublicHomePage actions={actions}/></SessionContext.Provider>));};
  try{await run({dom,render});}finally{await act(async()=>root.unmount());dom.window.close();}
}
const countryResponse=(country:string)=>new Response(JSON.stringify({country,source:'ip'}));
const countryTitles=(url:string)=>new Response(JSON.stringify([row(348,`${new URL(url).searchParams.get('region')??'TV'} Alien`)]));

test('guest detection supplies the same country to popular movies and cinemas, then a manual choice updates both',async()=>{
  const calls:string[]=[];
  await countryPage(async url=>{calls.push(url);return url.endsWith('/guest/country')?countryResponse('IE'):countryTitles(url);},async({dom,render})=>{
    await render({});
    const country=dom.window.document.querySelector<HTMLSelectElement>('[aria-label="Browsing country"]')!;
    assert.equal(country.value,'IE');
    assert(dom.window.document.querySelector('#public-films')?.textContent?.includes('IE Alien'));
    assert(dom.window.document.querySelector('#public-cinema')?.textContent?.includes('IE Alien'));
    assert(calls.some(url=>url.endsWith('/movies/popular?region=IE')));
    assert(calls.some(url=>url.endsWith('/movies/now_playing?region=IE')));
    await act(async()=>{country.value='AU';country.dispatchEvent(new dom.window.Event('change',{bubbles:true}));});
    assert(dom.window.document.querySelector('#public-films')?.textContent?.includes('AU Alien'));
    assert(dom.window.document.querySelector('#public-cinema')?.textContent?.includes('AU Alien'));
    assert.equal(dom.window.localStorage.getItem('flixie-cinema-country'),'AU');
  });
});

test('slow country detection and GB refresh keep the preloaded film cards until the real response arrives',async()=>{
  let detect!:(response:Response)=>void, finish!:(response:Response)=>void;
  await countryPage(url=>{
    if(url.endsWith('/guest/country'))return new Promise(resolve=>{detect=resolve;});
    if(url.endsWith('/movies/popular?region=GB'))return new Promise(resolve=>{finish=resolve;});
    return Promise.resolve(new Response('[]'));
  },async({dom,render})=>{
    await render({});
    const section=()=>dom.window.document.querySelector('#public-films')!;
    const first=section().querySelector('.fx-discovery-film')!;
    assert(first,'country lookup must not erase prerendered public cards');
    assert.equal(section().querySelectorAll('.fx-discovery-film').length,6);
    assert.equal(section().querySelector('.fx-loading-discovery'),null);
    assert(dom.window.document.querySelector('.fx-discovery-country-status'));
    await act(async()=>detect(countryResponse('GB')));
    assert.equal(section().querySelector('.fx-discovery-film'),first,'pending refresh preserves the existing artwork node');
    await act(async()=>finish(new Response(JSON.stringify([row(348,'Fresh GB Alien')]))));
    assert(section().textContent?.includes('Fresh GB Alien'));
    assert.equal(section().querySelector('.fx-loading-discovery'),null);
  });
});
test('saved account country wins over guest preference, profile changes and account switches replace it, and sign-out restores the guest choice',async()=>{
  let detections=0;
  const member=(id:string,country:string)=>({id,country,username:'fictional_member',firstName:'Alex',externalId:id,avatar:{},profileBadges:[],completedSetup:true});
  await countryPage(async url=>{if(url.endsWith('/guest/country')){detections++;return countryResponse('DE');}return countryTitles(url);},async({dom,render})=>{
    await render({user:member('fixture-a','ES')});
    assert.equal(dom.window.document.querySelector<HTMLSelectElement>('select')?.value,'ES');
    assert(dom.window.document.querySelector('#public-films')?.textContent?.includes('ES Alien'));
    assert(dom.window.document.querySelector('#public-cinema')?.textContent?.includes('ES Alien'));
    assert(dom.window.document.body.textContent?.includes('Using your saved country.'));
    assert.equal(detections,0);
    await render({user:member('fixture-a','IE')});
    assert(dom.window.document.querySelector('#public-films')?.textContent?.includes('IE Alien'));
    assert(!dom.window.document.querySelector('#public-films')?.textContent?.includes('ES Alien'));
    await render({user:member('fixture-b','XX')});
    assert.equal(dom.window.document.querySelector<HTMLSelectElement>('select')?.value,'GB');
    assert(dom.window.document.body.textContent?.includes('Your saved country is unavailable'));
    await render({user:member('fixture-b','CA')});
    assert.equal(dom.window.document.querySelector<HTMLSelectElement>('select')?.value,'CA');
    await render({user:null,identity:null});
    assert.equal(dom.window.document.querySelector<HTMLSelectElement>('select')?.value,'US');
    assert.equal(detections,0);
    assert.equal(dom.window.localStorage.getItem('flixie-cinema-country'),'US');
  },'US');
});
test('a manual guest country wins over late detection and another-country errors never borrow the GB snapshot',async()=>{
  let finishDetection!:(response:Response)=>void;
  await countryPage(async url=>{
    if(url.endsWith('/guest/country'))return new Promise<Response>(resolve=>{finishDetection=resolve;});
    if(url.includes('/movies/popular?region=IE'))return new Response('{}',{status:503});
    return countryTitles(url);
  },async({dom,render})=>{
    await render({});
    const country=dom.window.document.querySelector<HTMLSelectElement>('select')!;
    await act(async()=>{country.value='IE';country.dispatchEvent(new dom.window.Event('change',{bubbles:true}));});
    await act(async()=>{finishDetection(countryResponse('US'));});
    assert.equal(country.value,'IE');
    assert.equal(dom.window.document.querySelectorAll('#public-films article').length,0);
    assert(!dom.window.document.querySelector('#public-films')?.textContent?.includes('Showing saved selections'));
    assert(dom.window.document.querySelector('#public-films')?.textContent?.includes('could not be loaded'));
    assert(dom.window.document.querySelector('#public-cinema')?.textContent?.includes('IE Alien'));
  });
});
test('failed guest detection falls back visibly to GB and manual country selection remains available',async()=>{
  await countryPage(async url=>url.endsWith('/guest/country')?new Response('{}',{status:503}):countryTitles(url),async({dom,render})=>{
    await render({});
    assert.equal(dom.window.document.querySelector<HTMLSelectElement>('select')?.value,'GB');
    assert(dom.window.document.body.textContent?.includes('Country detection is unavailable'));
    assert(dom.window.document.querySelector('#public-films')?.textContent?.includes('GB Alien'));
    assert(dom.window.document.querySelector('#public-cinema')?.textContent?.includes('GB Alien'));
  });
});
