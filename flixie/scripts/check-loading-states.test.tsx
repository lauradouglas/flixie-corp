import {after, test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,writeFile,unlink,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';
import {act,createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Loading,type LoadingLayout} from '../src/web/Loading';
import {account,film} from '../src/web/models';

const output=resolve(`.impeccable/review/loading-states/test-${process.pid}.mjs`);
await mkdir(resolve('.impeccable/review/loading-states'),{recursive:true});
const compiled=await build({stdin:{contents:`export {HomePage,SearchPage,TitlePage} from './src/web/pages';export {Poster} from './src/web/components';export {PublicHomeContent} from './src/web/PublicHome';export {InitialTitle} from './src/web/PublicTitleShell';export {SessionContext} from './src/web/auth';`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'esm',platform:'node',packages:'external',jsx:'automatic',loader:{'.css':'empty'},define:{'import.meta.env':'{}'}});
await writeFile(output,compiled.outputFiles[0].contents);
const runtime=await import(pathToFileURL(output).href);
after(()=>unlink(output));
async function setup(){
  const dom=new JSDOM('<div id="root"></div>',{url:'http://127.0.0.1/app/search?q=Alien'});
  dom.window.HTMLElement.prototype.scrollTo=()=>{};
  Object.assign(globalThis,{window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true});
  const {createRoot}=await import('react-dom/client');const root=createRoot(document.getElementById('root')!);
  return {dom,doc:dom.window.document,render:async(node:React.ReactNode)=>act(async()=>root.render(node)),close:async()=>{await act(async()=>root.unmount());dom.window.close();}};
}
const actions={open(){},save:async()=>{},saved:()=>false,busyIds:new Set<string>(),refresh(){},toast(){}};

test('Home reveals independent sections, retries only a failed feed, and discards the previous owner’s replies',async()=>{
  const t=await setup();
  const pending=new Map<string,{resolve:(value:unknown)=>void;reject:(error:Error)=>void}>();
  const calls:Record<string,number>={};
  const request=(key:string)=>{calls[key]=(calls[key]??0)+1;return new Promise((resolve,reject)=>pending.set(key,{resolve,reject}));};
  const api={watchSoon:()=>request('soon'),diary:(id:string)=>request('diary:'+id),continued:(id:string)=>request('shows:'+id),friends:(id:string)=>request('friends:'+id),plans:()=>request('plans')};
  const library={data:[film({id:348,title:'Alien'})],loading:false,error:'',retry(){}};
  const render=(id:string)=>t.render(createElement(runtime.SessionContext.Provider,{value:{api}},createElement(runtime.HomePage,{user:account({id,externalId:id,username:id},id),library,actions,revision:0})));
  try{
    await render('alex');
    assert(t.doc.querySelector('a[href="/movies/348"]'),'saved films are usable before optional feeds settle');
    await act(async()=>pending.get('plans')!.resolve([]));
    assert(t.doc.body.textContent!.includes('No film nights planned yet.'));
    assert(t.doc.querySelector('.fx-loading-activity'),'unresolved friends retain their own placeholder');
    await act(async()=>pending.get('friends:alex')!.reject(Error('Unavailable')));
    const error=[...t.doc.querySelectorAll('[role=alert]')].find(e=>e.textContent?.includes('Friends’ activity'))!;
    assert(error);await act(async()=>(error.querySelector('button') as HTMLButtonElement).click());
    assert.equal(calls['friends:alex'],2);assert.equal(calls.plans,1);assert.equal(calls['shows:alex'],1);
    await act(async()=>pending.get('friends:alex')!.resolve([]));
    assert(!t.doc.body.textContent!.includes('Friends’ activity could not be loaded.'));
    await act(async()=>pending.get('diary:alex')!.reject(Error('Unavailable')));
    assert(t.doc.body.textContent!.includes('Your recent film night could not be loaded.'));
    const stale=pending.get('shows:alex')!;await render('jamie');
    await act(async()=>stale.resolve([{id:1,title:'Previous account show',watched:1,total:2}]));
    assert(!t.doc.body.textContent!.includes('Previous account show'));
    assert(t.doc.querySelector('.fx-loading-posterRows'));
  }finally{await t.close();}
});

test('loading layouts announce one status, hide decorative shapes and never offer pretend controls',()=>{
  const layouts:LoadingLayout[]=['collection','discovery','shows','cinema','saved','rows','posterRows','episodes','activity','diary','plans','title','person','profile','cast','photos','providers','avatars','form','status'];
  for(const layout of layouts){const {document}=new JSDOM(renderToStaticMarkup(<Loading layout={layout} label="Loading a section…"/>)).window;
    assert.equal(document.querySelectorAll('[role=status]').length,1,layout);
    assert.equal(document.querySelectorAll('button,a,input,select').length,0,layout);
    assert.equal(document.querySelector('[role=status]')?.textContent,'Loading a section…');
    for(const shape of document.querySelectorAll('.fx-skeleton'))assert(shape.closest('[aria-hidden=true]'),layout);
  }
});
test('title and person loading wrappers cannot inherit decorative text-bar dimensions',()=>{
  for(const layout of ['title','person'] as const){
    const {document}=new JSDOM(renderToStaticMarkup(<Loading layout={layout}/>)).window;
    const container=document.querySelector('.fx-skeleton-detail')!;
    assert(container.classList.contains(`fx-skeleton-detail-${layout}`));
    const blocks=[...container.querySelectorAll('.fx-skeleton')];
    assert(blocks.length>0);
    const shapeClasses=new Set(blocks.flatMap(block=>[...block.classList].filter(name=>name!=='fx-skeleton')));
    for(const name of container.classList)assert(!shapeClasses.has(name),`${layout} container must not become a fixed-height ${name} block`);
    assert.equal(document.querySelector('.fx-loading-shapes > .fx-skeleton-detail > .fx-skeleton-poster')?.getAttribute('class'),'fx-skeleton fx-skeleton-poster');
  }
});
test('search replaces pending poster placeholders with the requested result, then exposes retry on failure',async()=>{
  const t=await setup();let finish!:(films:unknown[])=>void;
  const session={user:null,identity:null,api:{search:()=>new Promise(resolve=>{finish=resolve;})}};
  const render=(query:string)=>t.render(createElement(runtime.SessionContext.Provider,{value:session},createElement(runtime.SearchPage,{query,actions})));
  try{await render('Alien');assert(t.doc.querySelector('.fx-loading-collection'));assert.equal(t.doc.querySelectorAll('.fx-loading a').length,0);
    await act(async()=>finish([film({id:348,title:'Alien',posterPath:'/alien.jpg'},'movie')]));
    assert.equal(t.doc.querySelector('.fx-loading'),null);assert(t.doc.querySelector('a[href="/movies/348"]'));
    session.api.search=async()=>{throw Error('The search is unavailable.');};await render('Obsession');
    assert.equal(t.doc.querySelector('.fx-loading'),null);assert.match(t.doc.querySelector('[role=alert]')!.textContent!,/search is unavailable/);
    assert.equal(t.doc.querySelector('[role=alert] button')?.textContent,'Try again');
  }finally{await t.close();}
});
test('public title metadata stays visible while its live request is pending and after a refresh failure',async()=>{
  const t=await setup();let fail!:(reason:Error)=>void;
  const snapshot={id:348,kind:'movie',title:'Alien',overview:'A crew encounters an alien.',posterPath:'/alien.jpg',genres:[],releaseDate:'1979-05-25',runtime:117};
  const session={user:null,identity:null,api:new Proxy({},{get:(_target,key)=>key==='title'?()=>new Promise((_resolve,reject)=>{fail=reject;}):()=>new Promise(()=>{})})};
  try{await t.render(createElement(runtime.SessionContext.Provider,{value:session},createElement(runtime.InitialTitle.Provider,{value:snapshot},createElement(runtime.TitlePage,{id:348,kind:'movie',revision:0,actions}))));
    assert.equal(t.doc.querySelector('h1')?.textContent,'Alien');assert.equal(t.doc.querySelector('.fx-loading-title'),null);
    await act(async()=>fail(Error('Temporarily unavailable')));
    assert.equal(t.doc.querySelector('h1')?.textContent,'Alien');assert.match(t.doc.querySelector('[role=alert]')!.textContent!,/saved public details/);
  }finally{await t.close();}
});
test('switching discovery country displays the new regional placeholders instead of an empty result or stale title',async()=>{
  const t=await setup();const pending={loading:true,error:'',retry(){}};
  try{await t.render(createElement(runtime.PublicHomeContent,{movies:[],shows:[],region:'IE',movieFeed:pending,showFeed:pending,cinema:pending}));
    assert(t.doc.querySelector('#public-films .fx-loading-discovery'));assert(t.doc.querySelector('#public-cinema .fx-loading-cinema'));assert(t.doc.querySelector('#public-shows .fx-loading-shows'));
    assert.equal(t.doc.querySelectorAll('.fx-loading-shapes a').length,0);assert(!t.doc.body.textContent!.includes('No shows are available'));
  }finally{await t.close();}
});
test('poster reserves portrait space, resolves loading, and recovers from a failed previous artwork',async()=>{
  const t=await setup();const render=(path:string)=>t.render(createElement(runtime.Poster,{film:{title:'Alien',posterPath:path}}));
  try{await render('/one.jpg');let img=t.doc.querySelector('img')!;assert.equal(img.width/img.height,2/3);assert.equal(img.dataset.loading,'true');
    await act(async()=>img.dispatchEvent(new t.dom.window.Event('load')));assert.equal(img.dataset.loading,'false');
    await act(async()=>img.dispatchEvent(new t.dom.window.Event('error')));assert(t.doc.querySelector('[aria-label="Poster unavailable for Alien"]'));
    await render('/two.jpg');img=t.doc.querySelector('img')!;assert(img);assert.equal(img.dataset.loading,'true');
  }finally{await t.close();}
});
test('cold startup is available before JavaScript, preserves prerender insertion and offers recovery if a chunk fails',async()=>{
  const html=await readFile(resolve('index.html'),'utf8'),main=await readFile(resolve('src/main.tsx'),'utf8');
  assert(html.includes('<div id="root"></div>'));const doc=new JSDOM(html).window.document;
  assert.equal(doc.querySelector('#flixie-boot [role=status]')?.textContent,'Opening Flixie…');
  assert.equal(doc.querySelector('#flixie-boot img')?.getAttribute('src'),'/web/flixie-f.png');
  assert(html.includes('prefers-reduced-motion:reduce'));assert(main.includes("retry.textContent = 'Try again'"));
});
