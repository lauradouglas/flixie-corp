import {after,test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,writeFile,unlink} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';
import {act,createElement} from 'react';
import {film} from '../src/web/models';
import {talent} from '../src/web/personDetails';
import {renderHead} from '../src/seo';
const output=resolve(`.impeccable/review/page-presentation-${process.pid}.mjs`);
await mkdir(resolve('.impeccable/review'),{recursive:true});
const compiled=await build({stdin:{contents:`export {ConnectedApp} from './src/web/WebApp';export {PersonContent} from './src/web/PersonPage';export {SessionContext} from './src/web/auth';export {InitialTitle} from './src/web/PublicTitleShell';`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'esm',platform:'node',packages:'external',jsx:'automatic',loader:{'.css':'empty'},define:{'import.meta.env':'{}'}});
await writeFile(output,compiled.outputFiles[0].contents);const runtime=await import(pathToFileURL(output).href);after(()=>unlink(output));
async function setup(path='/movies/348'){
 const dom=new JSDOM('<!doctype html><head></head><body><div id="root"></div></body>',{url:'https://www.flixie.co.uk'+path});
 dom.window.scrollTo=()=>{};dom.window.HTMLElement.prototype.scrollTo=()=>{};
 Object.assign(globalThis,{window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,history:dom.window.history,PopStateEvent:dom.window.PopStateEvent,IS_REACT_ACT_ENVIRONMENT:true});
 const {createRoot}=await import('react-dom/client');const root=createRoot(document.getElementById('root')!);
 return {dom,doc:dom.window.document,render:async(node:React.ReactNode)=>act(async()=>root.render(node)),close:async()=>{await act(async()=>root.unmount());dom.window.close();}};
}
function session(api:Record<string,unknown>){return {user:null,identity:null,loading:false,error:'',local:false,api,signIn:async()=>{},join:async()=>{},provider:async()=>{},signOut:async()=>{},reset:async()=>{},reloadProfile:async()=>{}};}
const apiDefaults={terms:async()=>({accepted:true}),credits:async()=>({cast:[],directors:[]}),publicReviews:async()=>[],options:async()=>({stream:[],rent:[],buy:[]}),detectedCountry:async()=>'GB',cinemaStatus:async()=>({}),seasons:async()=>[],images:async()=>[]};

test('app navigation gives each screen a readable tab label without copying private searches into metadata',async()=>{
 const t=await setup('/app/sign-in');
 try{
  await t.render(createElement(runtime.SessionContext.Provider,{value:session({...apiDefaults,search:async()=>[]})},createElement(runtime.ConnectedApp)));
  for(const [path,title] of [['/app/sign-in','Sign In | Flixie'],['/app/watchlist','Your Watchlist | Flixie'],['/app/diary','Your Film Diary | Flixie'],['/app/plans','Your Watch Plans | Flixie'],['/app/notifications','Notifications | Flixie'],['/app/search?q=private-fixture-query','Search Films & TV | Flixie']]){
   await act(async()=>{t.dom.window.history.pushState(null,'',path);t.dom.window.dispatchEvent(new t.dom.window.PopStateEvent('popstate'));});
   assert.equal(t.doc.title,title);assert.equal(t.doc.querySelector('meta[property="og:title"]')?.getAttribute('content'),title);
   assert.match(t.doc.querySelector('meta[name="robots"]')?.getAttribute('content')??'',/noindex/);
  }
 }finally{await t.close();}
});

test('the actual route shell retains a resolved film title and replaces it with a show title on navigation',async()=>{
 const t=await setup();let finish!:(value:unknown)=>void;
 const movie=film({id:348,title:'Alien',posterPath:'',overview:'A public synopsis.'},'movie');
 const api={...apiDefaults,title:(id:number)=>id===348?Promise.resolve(movie):new Promise(resolve=>{finish=resolve;})};
 try{
  await t.render(createElement(runtime.SessionContext.Provider,{value:session(api)},createElement(runtime.InitialTitle.Provider,{value:{id:348,kind:'movie',title:'Alien',posterPath:'',overview:'A public synopsis.',genres:[]}},createElement(runtime.ConnectedApp))));
  assert.equal(t.doc.title,'Alien | Flixie');
  assert.equal(t.doc.querySelector('meta[property="og:title"]')?.getAttribute('content'),'Alien | Flixie');
  await act(async()=>{t.dom.window.history.pushState(null,'','/shows/1413');t.dom.window.dispatchEvent(new t.dom.window.PopStateEvent('popstate'));});
  assert.equal(t.doc.title,'Films & TV | Flixie');
  await act(async()=>finish(film({id:1413,title:'American Horror Story',posterPath:''},'show')));
  assert.equal(t.doc.title,'American Horror Story | Flixie');
  assert.equal(t.doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content'),t.doc.title);
  assert.match(t.doc.querySelector('meta[name="robots"]')?.getAttribute('content')??'',/noindex/);
 }finally{await t.close();}
});
test('late replies from an earlier title cannot rename the current browser tab',async()=>{
 const t=await setup('/shows/1413');const pending=new Map<number,(value:unknown)=>void>();
 const api={...apiDefaults,title:(id:number)=>new Promise(resolve=>pending.set(id,resolve))};
 try{await t.render(createElement(runtime.SessionContext.Provider,{value:session(api)},createElement(runtime.ConnectedApp)));
  await act(async()=>{t.dom.window.history.pushState(null,'','/movies/348');t.dom.window.dispatchEvent(new t.dom.window.PopStateEvent('popstate'));});
  await act(async()=>pending.get(348)!(film({id:348,title:'Alien',posterPath:''},'movie')));
  await act(async()=>pending.get(1413)!(film({id:1413,title:'American Horror Story',posterPath:''},'show')));
  assert.equal(t.doc.title,'Alien | Flixie');assert.equal(t.doc.querySelector('h1')?.textContent,'Alien');
 }finally{await t.close();}
});
test('expanding and collapsing a biography keeps one complete flowing passage and the control after it',async()=>{
 const t=await setup('/people/525');const biography=('Christopher Nolan makes films. '+ 'A sentence about his work. '.repeat(30))+'The final biography sentence.';
 const person=talent({id:525,name:'Christopher Nolan',biography,images:[]},525);
 try{await t.render(createElement(runtime.PersonContent,{person}));const body=t.doc.querySelector('.fx-person-biography')!,paragraph=body.querySelector('p')!,button=body.querySelector('button')!;
  assert.equal(body.querySelectorAll('p').length,1);assert.equal(paragraph.textContent,biography);assert(paragraph.classList.contains('fx-person-bio-preview'));
  assert.equal(button.getAttribute('aria-expanded'),'false');assert.equal(body.lastElementChild,button);
  await act(async()=>button.click());
  assert.equal(button.textContent,'Read less');assert.equal(button.getAttribute('aria-expanded'),'true');assert(!paragraph.classList.contains('fx-person-bio-preview'));
  assert.equal(body.querySelectorAll('p').length,1);assert.equal(paragraph.textContent,biography);assert.equal(body.lastElementChild,button);
  await act(async()=>button.click());assert.equal(button.textContent,'Read full biography');assert(paragraph.classList.contains('fx-person-bio-preview'));
 }finally{await t.close();}
});
test('short biographies need no disclosure and the generic title fallback is a neutral product label',async()=>{
 const t=await setup('/people/525');
 try{await t.render(createElement(runtime.PersonContent,{person:talent({id:525,name:'Christopher Nolan',biography:'A short biography.',images:[]},525)}));assert.equal(t.doc.querySelector('.fx-person-biography button'),null);assert.equal(t.doc.querySelector('.fx-person-biography p')?.textContent,'A short biography.');
  assert(renderHead('mediaShare').includes('<title>Films &amp; TV | Flixie</title>'));
 }finally{await t.close();}
});
