import {test} from 'node:test';
import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {JSDOM} from 'jsdom';
import PublicBrowseHeader from '../src/web/PublicBrowseHeader';

test('public film, show and person headers expose Home, working guest search and account continuation before hydration',()=>{
 for(const path of ['/movies/348','/shows/15621','/people/5090']){
  const {document}=new JSDOM(renderToStaticMarkup(<PublicBrowseHeader returnTo={path}/>)).window;
  assert.equal(document.querySelector('.fx-public-home')?.getAttribute('href'),'/');
  const form=document.querySelector('form[role=search]');
  assert.equal(form?.getAttribute('action'),'/app/search');
  assert.equal(form?.getAttribute('method'),'get');
  const input=form?.querySelector('input');
  assert.equal(input?.getAttribute('name'),'q');
  assert.equal(input?.getAttribute('aria-label'),'Search films and shows');
  assert.equal(document.querySelectorAll('input[type=search]').length,1);
  assert.equal(document.querySelector('.fx-public-use-app')?.getAttribute('href'),'/download');
  for(const href of ['/','/films','/features','/about','/contact'])assert(document.querySelector(`.fx-public-menu-panel a[href="${href}"]`));
  assert(document.querySelector('button[aria-controls="fx-public-search"]'));
  for(const mode of ['sign-in','join']){
   const link=document.querySelector(`a[href^="/app/${mode}"]`)!;
   assert.equal(new URL(link.getAttribute('href')!,'https://www.flixie.co.uk').searchParams.get('next'),path);
  }
  assert(!document.body.textContent?.includes('Your movie & TV companion'));
 }
});
test('auth-page headers identify the active account route and retain the original destination',()=>{
 const {document}=new JSDOM(renderToStaticMarkup(<PublicBrowseHeader returnTo="/people/5090" query="Alien" authPage="join"/>)).window;
 assert.equal(document.querySelector('input')?.getAttribute('value'),'Alien');
 assert.equal(document.querySelector('a[aria-current=page]')?.textContent,'Join Flixie');
 assert.equal(document.querySelectorAll('a[aria-current=page]').length,1);
});
