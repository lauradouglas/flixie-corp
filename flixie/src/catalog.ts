import snapshot from "./catalog/titles.json";
import { titleMetadata } from "./titleMetadata";
import type { MediaKind } from "./web/models";
export interface CatalogTitle {
  id: number;
  kind: MediaKind;
  title: string;
  posterPath: string;
  releaseDate: string;
  runtime: number | null;
  overview: string;
  tagline: string;
  genres: string[];
}
export const catalogTitles = snapshot.titles as CatalogTitle[];
export const catalogDate = snapshot.updatedAt;
export const catalogPath = (title: CatalogTitle) =>
  `/${title.kind === "movie" ? "movies" : "shows"}/${title.id}`;
export const catalogKey = (title: CatalogTitle) =>
  `title-${title.kind}-${title.id}`;
export const catalogTitle = (key: string) =>
  catalogTitles.find(
    (title) => catalogKey(title) === key || catalogPath(title) === key,
  );
export const catalogPages = Object.fromEntries(
  catalogTitles.map((title) => [
    catalogKey(title),
    {
      path: catalogPath(title),
      ...titleMetadata(title),
      label: title.title,
    },
  ]),
) as Record<
  `title-${MediaKind}-${number}`,
  { path: string; title: string; description: string; label: string }
>;
