import { number, object, text, type MediaKind } from "./models";

export interface SavedProvider { id: number; name: string }
export interface ProviderOffer extends SavedProvider {
  logo: string;
  href: string | null;
  kinds: ("stream" | "rent" | "buy")[];
  priority: number;
}
function providerIdentity(value: unknown): SavedProvider {
  const row = object(value);
  const id = number(row.id ?? row.providerId ?? row.provider_id);
  const name = text(row.providerName ?? row.provider_name).trim();
  if (!id || !Number.isSafeInteger(id) || id < 1 || !name) throw new Error("Viewing services could not be loaded. Please try again.");
  return { id, name };
}
export function savedProviders(value: unknown): SavedProvider[] {
  const rows = object(value).watchProviders;
  if (!Array.isArray(rows)) throw new Error("Your services could not be loaded. Please try again.");
  return rows.map(providerIdentity);
}
export function providerWatchUrl(raw: unknown, title: { id: number; kind: MediaKind }): string | null {
  try {
    const url = new URL(text(raw));
    const prefix = title.kind === "movie" ? "movie" : "tv";
    if (url.protocol !== "https:" || url.username || url.password || url.port ||
        !["themoviedb.org", "www.themoviedb.org"].includes(url.hostname) ||
        !new RegExp(`^/${prefix}/${title.id}(?:-[^/]+)?/watch/?$`).test(url.pathname)) return null;
    return url.href;
  } catch { return null; }
}
export function providerOffers(value: unknown, title: { id: number; kind: MediaKind }): ProviderOffer[] {
  const outer = object(value), groups = object(outer.watchProviders ?? outer);
  if (!["stream", "rent", "buy"].every(key => Array.isArray(groups[key])))
    throw new Error("Viewing options could not be loaded. Please try again.");
  const merged = new Map<number, ProviderOffer>();
  for (const kind of ["stream", "rent", "buy"] as const) {
    for (const value of groups[kind] as unknown[]) {
      const identity = providerIdentity(value), row = object(value);
      const existing = merged.get(identity.id);
      if (existing) {
        if (!existing.kinds.includes(kind)) existing.kinds.push(kind);
        continue;
      }
      merged.set(identity.id, { ...identity, kinds: [kind],
        logo: text(row.logoPath ?? row.logo_path),
        href: providerWatchUrl(row.watchUrl, title),
        priority: number(row.displayPriority ?? row.display_priority) ?? 999 });
    }
  }
  return [...merged.values()].sort((a, b) =>
    Number(b.kinds.includes("stream")) - Number(a.kinds.includes("stream")) ||
    a.priority - b.priority || a.name.localeCompare(b.name));
}
const matchKey = (name: string) => name.toLowerCase().replaceAll("&", "and").replace(/[^a-z0-9]/g, "");
export function matchesSavedProvider(offer: SavedProvider, selected: SavedProvider[]): boolean {
  return selected.some(provider => provider.id === offer.id || matchKey(provider.name) === matchKey(offer.name));
}
export function offerLabel(offer: ProviderOffer): string {
  if (offer.kinds.includes("stream")) return "Stream";
  return offer.kinds.includes("rent") && offer.kinds.includes("buy") ? "Rent or buy" : offer.kinds.includes("rent") ? "Rent" : "Buy";
}
