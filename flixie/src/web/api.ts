import {
  account,
  activity,
  continued,
  diaryEntry,
  film,
  list,
  object,
  pick,
  plan,
  review,
  text,
  watchlist,
  type Account,
  type Film,
  type MediaKind,
  type JsonObject,
} from "./models";
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status = 0,
    readonly code = "",
  ) {
    super(message);
    this.name = "ApiError";
  }
}
export class SessionChanged extends Error {
  constructor() {
    super("Your account changed. Please try again.");
  }
}
export interface Identity {
  uid: string;
  token(force?: boolean): Promise<string>;
}
export class FlixieApi {
  constructor(
    readonly baseUrl: string,
    private identity: () => Identity | null,
    private transport: typeof fetch = globalThis.fetch.bind(globalThis),
  ) {}
  async request(
    path: string,
    options: {
      method?: string;
      body?: unknown;
      public?: boolean;
      signal?: AbortSignal;
      timeout?: number;
    } = {},
  ): Promise<unknown> {
    if (!path.startsWith("/") || path.startsWith("//"))
      throw new Error("Invalid API path");
    const session = options.public ? null : this.identity(),
      method = options.method ?? "GET";
    if (!options.public && !session)
      throw new ApiError("Sign in to continue.", 401);
    const send = async (force = false): Promise<Response> => {
      const headers: Record<string, string> = { Accept: "application/json" };
      if (options.body !== undefined)
        headers["Content-Type"] = "application/json";
      if (session)
        headers.Authorization = `Bearer ${await session.token(force)}`;
      if (session && this.identity()?.uid !== session.uid)
        throw new SessionChanged();
      return this.transport(this.baseUrl + path, {
        method,
        headers,
        credentials: "omit",
        cache: "no-store",
        body:
          options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: options.signal ?? AbortSignal.timeout(options.timeout ?? 15000),
      });
    };
    let response: Response;
    try {
      response = await send();
      if (
        response.status === 401 &&
        session &&
        this.identity()?.uid === session.uid
      )
        response = await send(true);
    } catch (error) {
      if (error instanceof SessionChanged || options.signal?.aborted)
        throw error;
      throw new ApiError("The connection was interrupted. Please try again.");
    }
    if (session && this.identity()?.uid !== session.uid)
      throw new SessionChanged();
    const body = await response.text();
    let data: unknown;
    try {
      data = body ? JSON.parse(body) : null;
    } catch {
      data = null;
    }
    if (!response.ok) {
      const row = object(data),
        code = text(row.code),
        detail = text(row.error, text(row.message));
      const safe =
        detail &&
        detail.length < 250 &&
        !/prisma|sql|stack|<|https?:/i.test(detail);
      throw new ApiError(
        response.status === 401
          ? "Please sign in again."
          : response.status >= 500
            ? "Flixie could not complete that request. Please try again."
            : safe
              ? detail
              : "That could not be completed. Please try again.",
        response.status,
        code,
      );
    }
    return data;
  }
  async profile(uid: string): Promise<Account | null> {
    try {
      const raw=await this.request(`/users/external-id/${encodeURIComponent(uid)}?profileOnly=true`);
      return raw===null?null:account(raw,uid);
    } catch(error) {
      if(error instanceof ApiError && error.status===404)return null;
      throw error;
    }
  }
  async title(
    id: number,
    kind: MediaKind,
    signal?: AbortSignal,
  ): Promise<Film> {
    return film(
      await this.request(
        kind === "movie"
          ? `/movies/id/${id}?includeReviews=false&includeTmdbRating=true`
          : `/shows/id/${id}?summary=true`,
        { public: true, signal },
      ),
      kind,
    );
  }
  async publicReviews(id: number, kind: MediaKind, signal?: AbortSignal) {
    return list(
      await this.request(`/guest/titles/${kind}/${id}/reviews`, {
        public: !this.identity(),
        signal,
      }),
    ).map(review);
  }
  async search(query: string, signal?: AbortSignal) {
    const raw = object(
      await this.request(
        `/search?value=${encodeURIComponent(query)}&type=all&page=1`,
        { public: true, signal },
      ),
    );
    return list(raw.results ?? raw.movies)
      .filter((value) => {
        const row = object(value);
        return (
          row.media_type !== "person" &&
          row.mediaType !== "person" &&
          (row.title || row.name)
        );
      })
      .map((value) => {
        const row = object(value);
        return film(
          value,
          row.media_type === "tv" || row.mediaType === "tv" ? "show" : "movie",
        );
      });
  }
  async watchlist(owner: string) {
    return watchlist(
      await this.request(`/users/${encodeURIComponent(owner)}/watchlists`),
    );
  }
  async watchSoon() {
    const raw = object(await this.request("/users/me/watch-soon"));
    return list(raw.items).map((row) => film(object(row).movie));
  }
  async diary(owner: string, latest = false) {
    return list(
      await this.request(
        `/users/${encodeURIComponent(owner)}/movie/watches${latest ? "?preview=latest" : ""}`,
      ),
    )
      .filter((v) => object(v).removed !== true && object(v).movie)
      .map(diaryEntry);
  }
  async continued(owner: string) {
    return list(
      await this.request(
        `/users/${encodeURIComponent(owner)}/shows/continue-watching?limit=6`,
      ),
    ).map(continued);
  }
  async friends(owner: string) {
    return list(
      await this.request(
        `/friends/${encodeURIComponent(owner)}/activity-lists?days=14&limit=20`,
      ),
    ).map(activity);
  }
  async plans() {
    const raw = object(await this.request("/watch-plans"));
    return list(raw.plans).map(plan);
  }
  async save(owner: string, title: Film, enabled: boolean) {
    return this.request(
      `/users/${encodeURIComponent(owner)}/${title.kind}/watchlist/${title.id}`,
      { method: enabled ? "POST" : "DELETE" },
    );
  }
  async priority(id: number, enabled: boolean) {
    return this.request(`/users/me/watch-soon/${id}`, {
      method: "PUT",
      body: { enabled },
    });
  }
  async log(
    owner: string,
    input: {
      movieId: number;
      watchedAt: string;
      rating: number | null;
      recommended: boolean | null;
      notes: string;
      watchedAtCinema: boolean;
    },
  ) {
    return this.request(`/users/${encodeURIComponent(owner)}/movie/watches`, {
      method: "POST",
      body: input,
    });
  }
  async options(title: Film, country: string) {
    return this.request(
      `/${title.kind === "movie" ? "movies" : "shows"}/${title.id}/${encodeURIComponent(country)}/watch/providers`,
      { public: true },
    );
  }
  async pick(mood: string, maxMinutes: number | null) {
    const raw = object(
      await this.request("/recommendations/pick-for-us", {
        method: "POST",
        timeout: 65000,
        body: {
          mood,
          maxMinutes,
          venue: "streaming",
          watching: "together",
          openToRent: false,
          includePossible: true,
          allowRewatches: false,
          includeUnknownContent: false,
        },
      }),
    );
    return { choices: list(raw.choices).map(pick), message: text(raw.message) };
  }
  async showProgress(owner: string, id: number) {
    return object(
      await this.request(
        `/shows/id/${id}?userId=${encodeURIComponent(owner)}&includeFriendSummary=false&includeTrailers=false`,
      ),
    );
  }
  async markEpisode(owner: string, showId: number, episodeId: number) {
    return this.request(
      `/users/${encodeURIComponent(owner)}/shows/${showId}/episodes/${episodeId}/progress`,
      {
        method: "PATCH",
        body: {
          watched: true,
          recordWatchDate: true,
          watchedAt: new Date().toISOString(),
        },
      },
    );
  }
  async usernameEmail(username: string, password: string, apiKey: string) {
    const row = object(
      await this.request("/auth/username-session", {
        public: true,
        method: "POST",
        body: { username, password, apiKey },
      }),
    );
    if (!text(row.email))
      throw new ApiError("Check your username and password.");
    return text(row.email);
  }
  async createProfile(data: JsonObject) {
    return this.request("/users/", { method: "POST", body: data });
  }
  async terms() {
    return object(await this.request("/users/me/terms"));
  }
  async acceptTerms(version: string) {
    return this.request("/users/me/terms", {
      method: "POST",
      body: { termsAccepted: true, version },
    });
  }
}
