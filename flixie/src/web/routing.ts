import { useEffect, useState } from "react";
import type { MediaKind } from "./models";
export type WebRoute =
  | {
      page:
        | "home"
        | "watchlist"
        | "diary"
        | "friends"
        | "plans"
        | "sign-in"
        | "join"
        | "search";
      query?: string;
    }
  | { page: "title"; id: number; kind: MediaKind };
export function parseRoute(path: string, search = ""): WebRoute {
  const match = /^\/(movies|shows)\/([1-9]\d*)\/?$/.exec(path);
  if (match && Number(match[2]) <= 2147483647)
    return {
      page: "title",
      kind: match[1] === "movies" ? "movie" : "show",
      id: Number(match[2]),
    };
  const part = path.replace(/^\/app\/?/, "").replace(/\/$/, "");
  const known = [
    "watchlist",
    "diary",
    "friends",
    "plans",
    "sign-in",
    "join",
    "search",
  ] as const;
  return known.includes(part as (typeof known)[number])
    ? {
        page: part as (typeof known)[number],
        query: new URLSearchParams(search).get("q") ?? "",
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
    return /^\/(app(?:\/|$)|movies\/\d+$|shows\/\d+$)/.test(url.pathname)
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
