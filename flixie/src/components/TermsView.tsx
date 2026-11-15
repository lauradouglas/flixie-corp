import { publicTerms } from '../legal/terms';
export default function TermsView(){
 return <div id="terms-view" className="pt-24 pb-20"><article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
  <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-text-primary tracking-tight">Flixie Terms of Use</h1>
  <p className="text-text-secondary text-base mt-4 mb-10">Effective {publicTerms.effective}</p>
  {publicTerms.sections.map(section=><section key={section.heading} className="mt-8"><h2 className="font-display font-bold text-xl text-text-primary mb-3">{section.heading}</h2>{section.paragraphs.map(text=><p key={text} className="text-text-secondary text-base leading-relaxed mb-4 max-w-[70ch]">{text}</p>)}</section>)}
  <nav aria-label="Legal and support" className="mt-10 flex flex-wrap gap-x-6 gap-y-3"><a className="text-flixie-light underline py-3" href="/privacy">Privacy Policy</a><a className="text-flixie-light underline py-3" href="/contact">Contact &amp; Support</a><a className="text-flixie-light underline py-3" href="/contact#account-deletion">Request account deletion</a></nav>
 </article></div>;
}
