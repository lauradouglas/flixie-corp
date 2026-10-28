import { ArrowRight, ChevronRight } from 'lucide-react';
import { featureContent, type FeaturePageId } from '../featureContent';
import { featureVisuals } from '../featureVisuals';
import DownloadLinks from './DownloadLinks';

export default function FeatureLandingView({ page }: { page: FeaturePageId }) {
  const content = featureContent[page];
  const visual = featureVisuals[page];
  return <article className="feature-landing">
    <div className="feature-shell">
      <nav aria-label="Breadcrumb" className="feature-breadcrumb"><a href="/">Home</a><ChevronRight size={14} aria-hidden="true"/><a href="/features">Features</a><ChevronRight size={14} aria-hidden="true"/><span aria-current="page">{content.label}</span></nav>
      <header className="feature-hero feature-hero-diary">
        <div><h1>{content.heading}</h1><p className="feature-intro">{content.intro}</p><a className="feature-primary" href="#download">{content.action}<ArrowRight size={18} aria-hidden="true"/></a><p className="feature-platforms">For iPhone and Android. Films and episodes are watched outside Flixie.</p></div>
        <figure className={`feature-app-shot ${page === 'diary' ? 'feature-app-shot-diary' : ''}`}><a href={visual.src} target="_blank" rel="noreferrer" aria-label={`Open full-size ${content.label.toLowerCase()} screenshot`}><img src={visual.src} alt={visual.alt} width={visual.width} height={visual.height} fetchPriority="high"/></a><figcaption>{visual.caption} <a href={visual.src} target="_blank" rel="noreferrer">View full size</a></figcaption></figure>
      </header>
      {visual.detail && <section className="feature-visual-detail"><div><h2>{visual.detail.heading}</h2><p>{visual.detail.body}</p></div><figure className={visual.detail.width > visual.detail.height * .8 ? 'feature-detail-wide' : ''}><a href={visual.detail.src} target="_blank" rel="noreferrer" aria-label={`Open full-size ${visual.detail.heading.toLowerCase()} screenshot`}><img src={visual.detail.src} alt={visual.detail.alt} width={visual.detail.width} height={visual.detail.height} loading="lazy"/></a><figcaption>{visual.detail.caption}</figcaption></figure></section>}
      <div className="feature-reading-layout"><div>{content.sections.map(([heading, body]) => <section className="feature-section" key={heading}><h2>{heading}</h2><p>{body}</p></section>)}</div><aside className="feature-start"><h2>Make it part of your next watch</h2><ol>{content.steps.map(step => <li key={step}>{step}</li>)}</ol><a href="#download">Get Flixie <ArrowRight size={16} aria-hidden="true"/></a></aside></div>
      <section className="feature-questions" aria-labelledby="feature-questions-heading"><h2 id="feature-questions-heading">Questions about {content.label.toLowerCase()}</h2>{content.faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</section>
      <section className="feature-related"><h2>Bring the rest of your film life together</h2><div>{content.related.map(key => <a key={key} href={featureContent[key].path}>{featureContent[key].label}<ArrowRight size={18} aria-hidden="true"/></a>)}</div></section>
      <section className="feature-download"><h2>Your next watch starts here.</h2><DownloadLinks/></section>
    </div>
  </article>;
}
