
export type LoadingLayout = 'collection' | 'discovery' | 'shows' | 'cinema' | 'saved' | 'rows' | 'posterRows' | 'episodes' | 'activity' | 'diary' | 'plans' | 'title' | 'person' | 'profile' | 'cast' | 'photos' | 'providers' | 'avatars' | 'form' | 'status';

function Block({ shape = 'line' }: { shape?: string }) {
  return <span className={`fx-skeleton fx-skeleton-${shape}`} />;
}
function Copy() {
  return <div className="fx-skeleton-copy"><Block shape="heading"/><Block/><Block shape="short"/></div>;
}
function Cards({ count }: { count: number }) {
  return <>{Array.from({length:count}, (_,i) => <div className="fx-skeleton-card" key={i}><Block shape="poster"/><Block shape="heading"/><Block shape="short"/></div>)}</>;
}

/** Decorative geometry follows the destination layout; only the status is announced. */
export function Loading({ label = 'Loading your films…', layout = 'collection', count, heading = false }: { label?: string; layout?: LoadingLayout; count?: number; heading?: boolean }) {
  const Label = heading ? 'h1' : 'p';
  const total = count ?? (layout === 'collection' ? 8 : layout === 'discovery' ? 6 : layout === 'shows' ? 4 : 3);
  let content;
  if (['collection','discovery','shows','cast'].includes(layout)) {
    const grid = layout === 'collection' ? 'fx-collection' : layout === 'cast' ? 'fx-cast-rail' : `fx-discovery-grid${layout === 'shows' ? ' fx-discovery-shows' : ''}`;
    content = <div className={grid}><Cards count={total}/></div>;
  } else if (layout === 'cinema') {
    content = <div className="fx-discovery-cinema-list">{Array.from({length:total}, (_,i) => <div className="fx-skeleton-cinema-card" key={i}><Block shape="poster"/><Copy/></div>)}</div>;
  } else if (layout === 'saved' || layout === 'plans') {
    content = <div className={layout === 'saved' ? 'fx-saved-preview' : 'fx-skeleton-plans'}>{Array.from({length:layout === 'saved' ? 3 : total}, (_,i) => <div className={layout === 'saved' ? 'fx-soon' : 'fx-plan-card'} key={i}><Block shape="poster"/><div className="fx-skeleton-copy"><Copy/><Block shape="control"/></div></div>)}</div>;
  } else if (layout === 'title' || layout === 'person') {
    content = <div className={`fx-skeleton-detail fx-skeleton-detail-${layout}`}><Block shape="poster"/><div className="fx-skeleton-copy"><Block shape="title"/><Copy/></div><div className="fx-skeleton-detail-lower"><Block shape="control"/><Copy/><Copy/></div></div>;
  } else if (layout === 'episodes') {
    content = <div className="fx-episode-list">{Array.from({length:total}, (_,i) => <div className="fx-skeleton-episode" key={i}><Block shape="photo"/><Copy/></div>)}</div>;
  } else if (layout === 'profile') {
    content = <div className="fx-skeleton-profile"><div className="fx-skeleton-identity"><Block shape="avatar"/><Copy/></div><Block shape="control"/><div className="fx-collection"><Cards count={6}/></div></div>;
  } else if (layout === 'photos') {
    content = <div className="fx-skeleton-photos">{Array.from({length:total}, (_,i) => <Block key={i} shape="photo"/>)}</div>;
  } else if (layout === 'avatars' || layout === 'providers') {
    content = <div className={`fx-skeleton-${layout}`}>{Array.from({length:layout === 'avatars' ? 8 : total}, (_,i) => <div key={i}><Block shape={layout === 'avatars' ? 'avatar' : 'logo'}/><Block shape="short"/></div>)}</div>;
  } else if (layout === 'form') {
    content = <div className="fx-skeleton-form"><Block shape="heading"/><Block shape="control"/><Block shape="heading"/><Block shape="control"/></div>;
  } else if (layout !== 'status') {
    content = <div className={`fx-skeleton-rows fx-skeleton-${layout}`}>{Array.from({length:total}, (_,i) => <div className="fx-skeleton-row" key={i}>{layout === 'diary' && <Block shape="date"/>}<Block shape={layout === 'activity' || layout === 'rows' ? 'avatar' : 'poster'}/><Copy/></div>)}</div>;
  }
  return <div className={`fx-loading fx-loading-${layout}`} role="status" aria-live="polite">
    <Label className="fx-loading-label"><span className="fx-loading-dot" aria-hidden="true"/>{label}</Label>
    {content && <div className="fx-loading-shapes" aria-hidden="true">{content}</div>}
  </div>;
}

export function StartupLoading() {
  return <div className="fx-startup"><img src="/web/flixie-f.png" width={56} height={56} alt="Flixie"/><Loading heading layout="status" label="Opening Flixie…"/></div>;
}
