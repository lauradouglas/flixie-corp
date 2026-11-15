import {useEffect, useRef, useState, type FormEventHandler} from 'react';
import {Home, Menu, Search} from 'lucide-react';
import { Link, Wordmark } from './components';

export default function PublicBrowseHeader({returnTo='/films',query,onQueryChange,onSearch,authPage}: {
  returnTo?:string;
  query?:string;
  onQueryChange?:(query:string)=>void;
  onSearch?:FormEventHandler<HTMLFormElement>;
  authPage?:'join'|'sign-in';
}) {
  const next=encodeURIComponent(returnTo);
  const [searchOpen,setSearchOpen]=useState(returnTo.startsWith('/app/search'));
  const input=useRef<HTMLInputElement>(null),searchToggle=useRef<HTMLButtonElement>(null),menu=useRef<HTMLDetailsElement>(null);
  useEffect(()=>{setSearchOpen(returnTo.startsWith('/app/search'));if(menu.current)menu.current.open=false;},[returnTo]);
  useEffect(()=>{if(searchOpen)input.current?.focus();},[searchOpen]);
  return <header className="fx-top fx-public-top" data-auth-page={Boolean(authPage)} onKeyDown={event=>{
    if(event.key==='Escape'){
      if(menu.current?.open){menu.current.open=false;menu.current.querySelector('summary')?.focus();}
      else if(searchOpen){setSearchOpen(false);searchToggle.current?.focus();}
    }
  }}>
    <details className="fx-public-menu" ref={menu} onToggle={event=>{if(event.currentTarget.open)setSearchOpen(false);}}>
      <summary aria-label="Open navigation menu"><Menu size={23} aria-hidden="true"/></summary>
      <nav className="fx-public-menu-panel" aria-label="Public navigation">
        <a href="/">Home</a><a href="/films">Films &amp; TV</a><a href="/features">Features</a><a href="/about">About Flixie</a><a href="/welcome">Meet Flixie</a><a href="/faqs">FAQs</a><a href="/contact">Contact &amp; support</a>
        <Link to={`/app/join?next=${next}`}>Create an account</Link>
      </nav>
    </details>
    <Wordmark to="/"/>
    <a className="fx-public-compact-brand-link" href="/" aria-label="Flixie Home"><img src="/web/flixie-f.png" alt="" width={32} height={32}/></a>
    <div className="fx-public-search-row" data-mobile-open={searchOpen}>
      <a href="/" className="fx-public-home"><Home size={19} aria-hidden="true"/><span>Home</span></a>
      <form id="fx-public-search" className="fx-search" action="/app/search" method="get" role="search" onSubmit={onSearch}>
        <input ref={input} name="q" type="search" aria-label="Search films and shows" placeholder="Search films & TV" value={query} onChange={onQueryChange?event=>onQueryChange(event.target.value):undefined}/>
        <button type="submit" aria-label="Search"><Search size={19} aria-hidden="true"/></button>
      </form>
    </div>
    <div className="fx-top-actions">
      <button ref={searchToggle} type="button" className="fx-icon-button fx-public-search-toggle" aria-label="Search films and shows" aria-expanded={searchOpen} aria-controls="fx-public-search" onClick={()=>{if(menu.current)menu.current.open=false;setSearchOpen(open=>!open);}}><Search size={22} aria-hidden="true"/></button>
      <Link to={`/app/sign-in?next=${next}`} className="fx-text-button fx-guest-sign-in" aria-current={authPage==='sign-in'?'page':undefined}>Sign in</Link>
      <Link to={`/app/join?next=${next}`} className="fx-button fx-primary fx-guest-join" aria-current={authPage==='join'?'page':undefined}>Join Flixie</Link>
      <a href="/download" className="fx-button fx-primary fx-public-use-app">Use app</a>
    </div>
  </header>;
}
