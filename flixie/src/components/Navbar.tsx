import { Menu, Download } from 'lucide-react';
import { pages, type PageId } from '../site';
import BrandLogo from './BrandLogo';

const links: PageId[] = ['home', 'features', 'faq', 'about', 'contact'];
export default function Navbar({ currentPage }: { currentPage: PageId }) {
  return <header className="fixed top-0 left-0 right-0 z-40 bg-bg-nav border-b border-border-custom py-3" id="main-navbar">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      <a href="/" aria-label="Flixie home" className="shrink-0">
        <span className="relative block h-10 w-28 overflow-hidden" aria-hidden="true"><BrandLogo className="absolute w-32 max-w-none -left-2 -top-[45px]" /></span>
      </a>
      <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
        {links.map(key => <a key={key} href={pages[key].path} aria-current={currentPage === key ? 'page' : undefined} className={`px-3 py-3 rounded-lg text-sm hover:bg-bg-elevated ${currentPage === key ? 'text-flixie-light' : 'text-text-secondary'}`}>{pages[key].label}</a>)}
      </nav>
      <a href="#download" className="hidden md:inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-flixie-purple text-bg-darkest font-bold text-sm"><Download className="h-4 w-4" aria-hidden="true" />Get Flixie</a>
      <details className="md:hidden relative">
        <summary className="cursor-pointer list-none min-h-11 px-3 flex items-center gap-2 text-text-primary"><Menu className="h-5 w-5" aria-hidden="true" />Menu</summary>
        <nav className="absolute right-0 top-full w-60 max-w-[85vw] bg-bg-nav border border-border-custom rounded-xl p-3 shadow-lg" aria-label="Mobile navigation">
          {links.map(key => <a key={key} href={pages[key].path} aria-current={currentPage === key ? 'page' : undefined} className="block px-4 py-3 rounded-lg text-text-secondary hover:bg-bg-elevated">{pages[key].label}</a>)}
          <a href="#download" className="block px-4 py-3 text-flixie-light">Get Flixie</a>
        </nav>
      </details>
    </div>
  </header>;
}
