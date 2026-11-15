import { useLayoutEffect, useRef } from 'react';
import { BookOpen, Bookmark, CalendarDays, Home, UserRound, Users } from 'lucide-react';
import { Link } from './components';
import type { WebRoute } from './routing';

export const appNavigation = [
  { page:'home', href:'/app', Icon:Home, label:'Home', mobileLabel:'Home' },
  { page:'watchlist', href:'/app/watchlist', Icon:Bookmark, label:'Watchlist', mobileLabel:'Watchlist' },
  { page:'diary', href:'/app/diary', Icon:BookOpen, label:'Film diary', mobileLabel:'Diary' },
  { page:'friends', href:'/app/friends', Icon:Users, label:'Friends', mobileLabel:'Friends' },
  { page:'plans', href:'/app/plans', Icon:CalendarDays, label:'Watch Plans', mobileLabel:'Plans' },
  { page:'profile', href:'/app/profile', Icon:UserRound, label:'You', mobileLabel:'You' },
] as const;
export function activeNavigation(route:WebRoute,ownerId:string) {
  if(route.page==='user-profile') return route.id===ownerId?'profile':'friends';
  if(['title','person','search'].includes(route.page)) return 'home';
  return appNavigation.find(item=>item.page===route.page)?.page??null;
}
export default function MobileNavigation({active}:{active:ReturnType<typeof activeNavigation>}) {
  const ref=useRef<HTMLElement>(null);
  useLayoutEffect(()=>{
    const nav=ref.current,root=nav?.closest<HTMLElement>('.flixie-web');
    if(!nav||!root)return;
    const update=()=>{
      const height=Math.ceil(nav.getBoundingClientRect().height);
      if(height){root.style.setProperty('--fx-bottom-nav-height',`${height}px`);root.dataset.mobileNav='true';}
      else{root.style.removeProperty('--fx-bottom-nav-height');delete root.dataset.mobileNav;}
    };
    update();const observer=new ResizeObserver(update);observer.observe(nav);
    return()=>{observer.disconnect();root.style.removeProperty('--fx-bottom-nav-height');delete root.dataset.mobileNav;};
  },[]);
  return <nav ref={ref} className="fx-mobile-nav" aria-label="Main navigation">
    {appNavigation.filter(item=>item.page!=='profile').map(({page,href,Icon,label,mobileLabel})=><Link key={page} to={href} className="fx-mobile-tab" aria-label={label} aria-current={active===page?'page':undefined} onNavigate={()=>requestAnimationFrame(()=>document.getElementById('web-main')?.focus({preventScroll:true}))}>
      <Icon size={21} aria-hidden="true"/><span>{mobileLabel}</span>
    </Link>)}
  </nav>;
}
