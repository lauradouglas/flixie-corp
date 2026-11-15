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
  assert.equal(discoveryCountry('uk'),'GB');assert.equal(discoveryCountry('invalid'),'GB');
});
test('public film, TV and selected-country cinema feeds never read identity, send bearer or send cookies',async()=>{
  const calls:{url:string;init?:RequestInit}[]=[];
  const api=new FlixieApi('https://example.invalid',()=>{throw Error('Identity must not be accessed');},async(url,init)=>{calls.push({url:String(url),init});return new Response(JSON.stringify([row(1)]),{status:200});});
  await api.discovery('movie');await api.discovery('show');await api.cinemaDiscovery('IE');
  assert.deepEqual(calls.map(c=>new URL(c.url).pathname+new URL(c.url).search),['/movies/popular','/shows/popular','/movies/now_playing?region=IE']);
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
    const select=dom.window.document.querySelector<HTMLSelectElement>('select[aria-label="Cinema country"]')!;
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
