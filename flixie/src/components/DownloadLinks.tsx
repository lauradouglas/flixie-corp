import { site } from '../site';

export default function DownloadLinks() {
  return <div className="space-y-4">
    <div className="flex flex-wrap gap-3">
      <a href={site.iosUrl} className="inline-flex min-h-11 items-center justify-center px-5 py-3 rounded-xl bg-flixie-brand text-white font-bold hover:bg-flixie-brand-hover">{site.iosLabel}</a>
      <a href={site.androidUrl} className="inline-flex min-h-11 items-center justify-center px-5 py-3 rounded-xl border border-border-custom text-text-primary hover:bg-bg-elevated">{site.androidLabel}</a>
    </div>
    <p className="text-sm text-text-secondary max-w-xl">{site.availability} <a href="/contact" className="text-flixie-light underline">Contact support</a>.</p>
  </div>;
}
