import { ArrowRight } from 'lucide-react';
import { featureContent, featurePageIds } from '../featureContent';
export default function FeaturesView() {
  return <div className="feature-landing"><div className="feature-shell">
    <header className="feature-hero"><div><h1>Your film life, with your people in it.</h1><p className="feature-intro">Find films through friends, join genre communities and plan movie nights together. Keep your own film diary, TV episode progress and watchlist alongside the conversations.</p><a className="feature-primary" href="#download">Get Flixie<ArrowRight size={18} aria-hidden="true"/></a></div></header>
    <div className="feature-directory">{featurePageIds.map(key => <section key={key}><h2><a href={featureContent[key].path}>{featureContent[key].label}<ArrowRight size={22} aria-hidden="true"/></a></h2><p>{featureContent[key].intro}</p><a className="feature-text-link" href={featureContent[key].path}>Explore {featureContent[key].label.toLowerCase()}</a></section>)}</div>
    <section className="feature-section"><h2>Useful before your friends join.</h2><p>Keep a personal movie diary, save films and shows, and track TV progress on your own. Friends and genre communities add new opinions and conversations when you want them.</p></section>
    <p className="feature-platforms">Flixie does not stream films or TV episodes. Watch through your chosen service or at the cinema.</p>
  </div></div>;
}
