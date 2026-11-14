import {
  imageUrl,
  list,
  number,
  object,
  person,
  text,
  type Person,
} from "./models";

export interface CastMember {
  id: number;
  name: string;
  character: string;
  portrait: string;
  order: number;
}
export interface TitlePhoto {
  id: string;
  path: string;
  kind: "still" | "poster";
  width: number | null;
  height: number | null;
}
export interface FriendOpinion {
  person: Person;
  rating: number | null;
  watched: boolean;
  recommends: boolean;
}
export interface FriendOpinions {
  friends: FriendOpinion[];
  average: number | null;
  watchedCount: number;
  recommendedCount: number;
  ratedCount: number;
}

export function castMembers(value: unknown): CastMember[] {
  const raw = object(value),
    seen = new Set<number>();
  return list(raw.castMembers ?? raw.cast)
    .flatMap((value, index) => {
      const row = object(value),
        id = number(row.id),
        name = text(row.name);
      if (!id || !Number.isSafeInteger(id) || id < 1 || !name || seen.has(id))
        return [];
      seen.add(id);
      return [
        {
          id,
          name,
          character: text(row.character),
          portrait: text(row.profileImage, text(row.profile_path)),
          order: number(row.order) ?? index,
        },
      ];
    })
    .sort((a, b) => a.order - b.order);
}
export function titlePhotos(value: unknown): TitlePhoto[] {
  const row = object(value),
    seen = new Set<string>();
  return (["backdrops", "posters"] as const).flatMap((key) =>
    list(row[key]).flatMap((value) => {
      const image = object(value),
        path = text(image.imageUrl, text(image.file_path));
      if (!imageUrl(path) || seen.has(path)) return [];
      seen.add(path);
      return [
        {
          id: key + ":" + path,
          path,
          kind: key === "posters" ? ("poster" as const) : ("still" as const),
          width: number(image.width),
          height: number(image.height),
        },
      ];
    }),
  );
}
export function friendOpinions(value: unknown): FriendOpinions {
  const seen = new Set<string>();
  const friends = list(object(value).friends).flatMap((value) => {
    const row = object(value),
      id = text(row.userId, text(row.id));
    if (!id || seen.has(id)) return [];
    const rawRating = number(row.rating),
      rating =
        rawRating !== null && rawRating >= 1 && rawRating <= 10
          ? rawRating
          : null;
    const watched = row.watched === true,
      recommends = row.recommends === true;
    if (rating === null && !watched && !recommends) return [];
    seen.add(id);
    // Review snippets have no spoiler flag in this contract. Deliberately omit them.
    return [
      {
        person: person({
          ...row,
          id,
          avatar: row.avatar ?? { imageUrl: row.avatarUrl },
        }),
        rating,
        watched,
        recommends,
      },
    ];
  });
  const ratings = friends.flatMap((row) =>
    row.rating === null ? [] : [row.rating],
  );
  return {
    friends,
    average: ratings.length
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : null,
    ratedCount: ratings.length,
    watchedCount: friends.filter((row) => row.watched).length,
    recommendedCount: friends.filter((row) => row.recommends).length,
  };
}
