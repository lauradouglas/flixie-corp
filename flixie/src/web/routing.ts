import { useEffect, useState } from "react";
import type { MediaKind } from "./models";
export type WebRoute =
  | {
      page:
        | "home"
        | "explore"
        | "watchlist"
        | "diary"
        | "friends"
        | "profile"
        | "plans"
        | "notifications"
        | "sign-in"
        | "join"
        | "search";
      query?: string;
      planId?: string;
    }
  | { page: "title"; id: number; kind: MediaKind }
  | { page: "person"; id: number }
  | { page: "user-profile"; id: string };

/** Tab labels describe the screen without exposing private names or searches. */
export function appRouteTitle(route: WebRoute): string | undefined {
  switch (route.page) {
    case 'home': return 'Home | Flixie';
    case 'explore': return 'Explore Films & TV | Flixie';
    case 'watchlist': return 'Your Watchlist | Flixie';
    case 'diary': return 'Your Film Diary | Flixie';
    case 'friends': return 'Your People | Flixie';
    case 'profile': return 'Your Profile | Flixie';
    case 'user-profile': return 'Member Profile | Flixie';
    case 'plans': return 'Your Watch Plans | Flixie';
    case 'notifications': return 'Notifications | Flixie';
    case 'sign-in': return 'Sign In | Flixie';
    case 'join': return 'Join Flixie';
    case 'search': return 'Search Films & TV | Flixie';
    default: return undefined;
  }
}
export function parseRoute(path: string, search = ""): WebRoute {
  const profile=/^\/app\/profiles\/([A-Za-z0-9_-]{1,100})\/?$/.exec(path);
  if(profile) return {page:'user-profile',id:profile[1]};
  const person = /^\/people\/([1-9]\d*)\/?$/.exec(path);
  if (person && Number(person[1]) <= 2147483647) return { page: "person", id: Number(person[1]) };
  const match = /^\/(movies|shows)\/([1-9]\d*)\/?$/.exec(path);
  if (match && Number(match[2]) <= 2147483647)
    return {
      page: "title",
      kind: match[1] === "movies" ? "movie" : "show",
      id: Number(match[2]),
    };
  const part = path.replace(/^\/app\/?/, "").replace(/\/$/, "");
  const known = [
    "explore",
    "watchlist",
    "diary",
    "friends",
    "profile",
    "plans",
    "notifications",
    "sign-in",
    "join",
    "search",
  ] as const;
  return known.includes(part as (typeof known)[number])
    ? {
        page: part as (typeof known)[number],
        query: new URLSearchParams(search).get("q") ?? "",
        ...(part === "plans" && /^[A-Za-z0-9_-]{1,100}$/.test(new URLSearchParams(search).get("plan") ?? "") ? { planId: new URLSearchParams(search).get("plan")! } : {}),
      }
    : { page: "home" };
}
export function safeNext(raw: string | null): string {
  if (
    !raw ||
    !raw.startsWith("/") ||
    raw.startsWith("//") ||
    raw.includes("\\")
  )
    return "/app";
  try {
    const url = new URL(raw, "https://www.flixie.co.uk");
    return url.pathname==='/' || /^\/(app(?:\/|$)|movies\/[1-9]\d*$|shows\/[1-9]\d*$|people\/[1-9]\d*$)/.test(url.pathname)
      ? url.pathname + url.search
      : "/app";
  } catch {
    return "/app";
  }
}
export function navigate(path: string, replace = false) {
  const next = safeNext(path);
  if (replace) history.replaceState(null, "", next);
  else history.pushState(null, "", next);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "instant" });
}
export function useRoute() {
  const read = () =>
    parseRoute(window.location.pathname, window.location.search);
  const [route, setRoute] = useState<WebRoute>(read);
  useEffect(() => {
    const update = () => setRoute(read());
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);
  return route;
}
export const titlePath = (id: number, kind: MediaKind = "movie") =>
  `/${kind === "movie" ? "movies" : "shows"}/${id}`;
export const personPath = (id: number) => `/people/${id}`;
export const profilePath = (id: string) => `/app/profiles/${encodeURIComponent(id)}`;
