export default function NotFoundView() {
  return <section className="max-w-3xl mx-auto px-6 pt-36 pb-24 space-y-6">
    <h1 className="font-display text-4xl font-bold">This page could not be found</h1>
    <p className="text-text-secondary">The link may be out of date. Find your next film with Flixie, or contact us for help.</p>
    <div className="flex flex-wrap gap-6"><a className="text-flixie-light underline" href="/">Go to the homepage</a><a className="text-flixie-light underline" href="/contact">Contact support</a></div>
  </section>;
}
