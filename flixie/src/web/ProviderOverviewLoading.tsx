import {ArrowUpRight} from 'lucide-react';
import {Loading} from './Loading';

/** Public first-paint geometry; no authentication or live data is imported. */
export function ProviderOverviewLoading() {
  return <section className="fx-provider-overview" aria-label="Where to watch" aria-busy="true">
    <div className="fx-provider-overview-heading"><div><h3>Where to watch</h3><span>United Kingdom</span></div><a className="fx-text-button" href="/where-to-watch">All options<ArrowUpRight size={14} aria-hidden="true"/></a></div>
    <Loading layout="providers" label="Checking your viewing options…"/>
  </section>;
}
