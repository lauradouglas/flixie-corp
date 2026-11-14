import { catalogTitle, catalogPath } from "./catalog";
import { featureContent, isFeaturePage } from "./featureContent";
import { isIndexable, pages, site, type PageId } from "./site";

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ]!,
  );
export function renderHead(page: PageId) {
  const metadata = pages[page];
  const title = catalogTitle(page);
  const url = site.origin + metadata.path;
  const image = site.origin + "/og/flixie-companion.png";
  const graph: Record<string, unknown>[] = [
    {
      "@type": "Organization",
      "@id": site.origin + "/#organization",
      name: site.name,
      url: site.origin + "/",
      logo: site.origin + "/flixie-icon.png",
      sameAs: ["https://www.instagram.com/flixie_co/"],
    },
    {
      "@type": "WebSite",
      "@id": site.origin + "/#website",
      name: site.name,
      url: site.origin + "/",
      inLanguage: "en-GB",
      publisher: { "@id": site.origin + "/#organization" },
    },
    {
      "@type": "SoftwareApplication",
      "@id": site.origin + "/#app",
      name: site.name,
      url: site.origin + "/",
      applicationCategory: "EntertainmentApplication",
      operatingSystem: "iOS, Android",
      description:
        "Your movie and TV companion: find tonight’s film, keep up with your shows, track your viewing and plan film nights.",
      installUrl: [site.iosUrl, site.androidUrl],
      featureList: [
        "Personal film picks for mood, time and services",
        "Solo, friend and group film choices",
        "Film diary and rewatches",
        "TV episode and season tracking",
        "Movie and TV watchlists",
        "Personal ratings out of 10",
        "Friends’ ratings and recommendation signals",
        "Film and TV genre communities",
        "Movie-night Watch Plans",
        "Watch-provider information",
      ],
    },
    {
      "@type": "WebPage",
      "@id": url + "#webpage",
      url,
      name: metadata.title,
      description: metadata.description,
      isPartOf: { "@id": site.origin + "/#website" },
      about: { "@id": site.origin + "/#app" },
    },
  ];
  if (title) {
    const entity = {
      "@type": title.kind === "movie" ? "Movie" : "TVSeries",
      "@id": url + "#title",
      name: title.title,
      description: title.overview,
      image: "https://image.tmdb.org/t/p/w500" + title.posterPath,
      ...(title.releaseDate
        ? { datePublished: title.releaseDate.slice(0, 10) }
        : {}),
      genre: title.genres,
      ...(title.kind === "movie" && title.runtime
        ? { duration: `PT${title.runtime}M` }
        : {}),
    };
    graph.push(entity);
    graph.find((entity) => entity["@type"] === "WebPage")!.mainEntity = {
      "@id": url + "#title",
    };
  }
  if (page !== "home")
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: site.origin + "/",
        },
        ...(isFeaturePage(page)
          ? [
              {
                "@type": "ListItem",
                position: 2,
                name: "Features",
                item: site.origin + "/features",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: metadata.label,
                item: url,
              },
            ]
          : [
              {
                "@type": "ListItem",
                position: 2,
                name: metadata.label,
                item: url,
              },
            ]),
      ],
    });
  if (isFeaturePage(page))
    graph.push({
      "@type": "FAQPage",
      "@id": url + "#questions",
      mainEntity: featureContent[page].faqs.map(([name, text]) => ({
        "@type": "Question",
        name,
        acceptedAnswer: { "@type": "Answer", text },
      })),
    });
  const tags = [
    `<title>${escapeHtml(metadata.title)}</title>`,
    `<meta name="description" content="${escapeHtml(metadata.description)}">`,
    `<meta name="robots" content="${isIndexable(page) ? "index, follow" : "noindex"}">`,
  ];
  if (page !== "notFound" && page !== "invite")
    tags.push(
      `<meta name="apple-itunes-app" content="app-id=6779375028${title ? ", app-argument=" + escapeHtml(url) : ""}">`,
    );
  // Private invitations and error responses have no public canonical/entity graph.
  if (isIndexable(page)) tags.push(`<link rel="canonical" href="${url}">`);
  for (const [property, value] of Object.entries({
    "og:type": "website",
    "og:site_name": site.name,
    "og:locale": "en_GB",
    "og:title": metadata.title,
    "og:description": metadata.description,
    "og:url": url,
    "og:image": image,
    "og:image:width": "1200",
    "og:image:height": "630",
    "og:image:alt": "Flixie - your movie and TV companion",
  }))
    tags.push(`<meta property="${property}" content="${escapeHtml(value)}">`);
  for (const [name, value] of Object.entries({
    "twitter:card": "summary_large_image",
    "twitter:title": metadata.title,
    "twitter:description": metadata.description,
    "twitter:image": image,
    "twitter:image:alt": "Flixie - your movie and TV companion",
  }))
    tags.push(`<meta name="${name}" content="${escapeHtml(value)}">`);
  if (isIndexable(page))
    tags.push(
      `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")}</script>`,
    );
  return tags.join("\n    ");
}
