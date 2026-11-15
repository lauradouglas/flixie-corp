import { connectionState, friendRequests, inboxPage, peopleSearch } from './social';
import {discoveryFilms, discoveryCountry, validDiscoveryCountry} from './publicDiscovery';
import { castMembers, friendOpinions, titlePhotos } from "./titleDetails";
import { savedProviders } from "./watchProviders";
import { directorPeople, talent, talentCredits } from "./personDetails";
import { userProfile, profilePosts, profileFriends } from './userProfiles';
import { rankedFavourites, sameFavouriteMembership, type RankedFavourite } from './favouriteRanking';
import { showSeasons } from './showSeasons';
import { planReceiptMatches, type PlanCreateInput } from './watchPlanCreation';
import { pickGroups, pickRequest, pickResults, type PickPreferences } from './pickForUs';
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
export interface MovieWatchInput {
  movieId: number;
  watchedAt: string;
  rating: number | null;
  recommended: boolean | null;
  notes: string;
  watchedAtCinema: boolean;
}
export interface MovieReviewInput {
  title: string;
  body: string;
  rating: number;
  recommended: boolean;
  containsSpoilers: boolean;
}
export class FlixieApi {
  constructor(
    readonly baseUrl: string,
    private identity: () => Identity | null,
    private transport: typeof fetch = globalThis.fetch.bind(globalThis),
  ) {}
  assertIdentity(uid: string) {
    if (this.identity()?.uid !== uid) throw new SessionChanged();
  }
  async discovery(kind:MediaKind,signal?:AbortSignal,region='GB') {
    if(!validDiscoveryCountry(region))throw new Error('Choose a supported country.');
    return discoveryFilms(await this.request(kind==='movie'?`/movies/popular?region=${encodeURIComponent(discoveryCountry(region))}`:'/shows/popular',{public:true,signal:signal?AbortSignal.any([signal,AbortSignal.timeout(15000)]):undefined}),kind);
  }
  async detectedCountry(signal?:AbortSignal):Promise<string|null> {
    const raw=object(await this.request('/guest/country',{public:true,signal:signal?AbortSignal.any([signal,AbortSignal.timeout(4000)]):AbortSignal.timeout(4000)}));
    return validDiscoveryCountry(raw.country);
  }
  async cinemaDiscovery(region:string,signal?:AbortSignal) {
    if(discoveryCountry(region)!==region)throw new Error('Choose a supported cinema country.');
    return discoveryFilms(await this.request(`/movies/now_playing?region=${encodeURIComponent(region)}`,{public:true,signal:signal?AbortSignal.any([signal,AbortSignal.timeout(15000)]):undefined}),'movie');
  }
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
      const raw = await this.request(
        `/users/external-id/${encodeURIComponent(uid)}?profileOnly=true`,
      );
      return raw === null ? null : account(raw, uid);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  }
  async userProfile(id: string, signal?: AbortSignal) {
    return userProfile(await this.request(`/profiles/${encodeURIComponent(id)}`,{signal}),id==='me'?undefined:id);
  }
  async profileSection(id:string,section:'activity'|'reviews',cursor?:string|null,signal?:AbortSignal) {
    return profilePosts(await this.request(`/profiles/${encodeURIComponent(id)}/${section}${cursor?'?cursor='+encodeURIComponent(cursor):''}`,{signal}));
  }
  async searchPeople(uid:string,ownerId:string,query:string,signal?:AbortSignal){
    this.assertIdentity(uid);const q=query.trim().replace(/^@/,'');
    if(q.length<2||q.length>50)throw new ApiError('Enter between 2 and 50 characters of a username.');
    return peopleSearch(await this.request(`/users/search?q=${encodeURIComponent(q)}`,{signal}),ownerId);
  }
  async friendRequests(uid:string,ownerId:string,signal?:AbortSignal){
    this.assertIdentity(uid);return friendRequests(await this.request('/profiles/me/friend-requests',{signal}),ownerId);
  }
  async sendFriendRequest(uid:string,ownerId:string,target:{id:string;username:string}){
    this.assertIdentity(uid);if(!target.id||target.id===ownerId||!target.username)throw new ApiError('Choose another person to invite.');
    const [friends,requests]=await Promise.all([this.profileFriends(),this.friendRequests(uid,ownerId)]);
    if(connectionState(target.id,ownerId,friends,requests)!=='none')return;
    this.assertIdentity(uid);
    await this.request('/requests',{method:'POST',body:{requesterId:ownerId,recipientId:target.id,responderUsername:target.username,type:'FRIEND_REQUEST',message:''}});
    const latest=await this.friendRequests(uid,ownerId);
    if(!latest.some(r=>r.from.id===ownerId&&r.to.id===target.id&&r.status==='PENDING'))throw new ApiError('The friend request could not be confirmed. Refresh requests before sending again.');
  }
  async replyToFriend(uid:string,ownerId:string,id:string,status:'ACCEPTED'|'DECLINED'){
    const current=(await this.friendRequests(uid,ownerId)).find(r=>r.id===id);
    if(!current||current.to.id!==ownerId)throw new ApiError('This incoming request is unavailable. Refresh your requests.');
    if(current.status===status)return;
    if(current.status!=='PENDING')throw new ApiError('This request already has a reply. Refresh your requests.');
    this.assertIdentity(uid);await this.request('/requests/update',{method:'POST',body:{id,status,response:''}});
    const latest=(await this.friendRequests(uid,ownerId)).find(r=>r.id===id);
    if(latest?.status!==status)throw new ApiError('Your reply could not be confirmed. Refresh your requests.');
  }
  async cancelFriendRequest(uid:string,ownerId:string,id:string){
    const current=(await this.friendRequests(uid,ownerId)).find(r=>r.id===id);
    if(!current)return;
    if(current.from.id!==ownerId||current.status!=='PENDING')throw new ApiError('Only your pending outgoing requests can be cancelled. Refresh requests.');
    this.assertIdentity(uid);await this.request('/requests',{method:'DELETE',body:{id,userId:ownerId}});
    if((await this.friendRequests(uid,ownerId)).some(r=>r.id===id))throw new ApiError('Cancellation could not be confirmed. Refresh requests.');
  }
  async removeFriend(uid:string,ownerId:string,id:string){
    this.assertIdentity(uid);if(!(await this.profileFriends()).some(p=>p.id===id))return;
    this.assertIdentity(uid);await this.request(`/friends/${encodeURIComponent(ownerId)}/friend/${encodeURIComponent(id)}`,{method:'DELETE'});
    if((await this.profileFriends()).some(p=>p.id===id))throw new ApiError('The friendship change could not be confirmed. Refresh your friends.');
  }
  async inbox(uid:string,ownerId:string,cursor?:string|null,signal?:AbortSignal){
    this.assertIdentity(uid);return inboxPage(await this.request(`/notifications/user/${encodeURIComponent(ownerId)}?page=true${cursor?'&cursor='+encodeURIComponent(cursor):''}`,{signal}),ownerId);
  }
  async setNotificationRead(uid:string,id:string,read:boolean){
    this.assertIdentity(uid);const row=object(await this.request('/notifications/update',{method:'POST',body:{id,read}}));
    if(row.id!==id||row.read!==read)throw new ApiError('The read status could not be confirmed. Refresh your inbox.');
  }
  async readAllNotifications(uid:string){
    this.assertIdentity(uid);const row=object(await this.request('/notifications/read-all',{method:'POST',body:{}}));
    if(row.success!==true)throw new ApiError('Your inbox could not be marked read. Refresh it before trying again.');
  }
  async watchPlan(uid:string,id:string,signal?:AbortSignal){
    this.assertIdentity(uid);const value=plan(await this.request(`/watch-plans/${encodeURIComponent(id)}`,{signal}));
    if(value.id!==id)throw new ApiError('This Watch Plan could not be loaded.');return value;
  }
  async profileFriends(signal?:AbortSignal) {
    return profileFriends(await this.request('/profiles/me/friends',{signal}));
  }
  async favouriteRanking(ownerUid: string, ownerId: string, kind: MediaKind, signal?: AbortSignal) {
    this.assertIdentity(ownerUid);
    return rankedFavourites(await this.request(`/users/${encodeURIComponent(ownerId)}/${kind}/favorites`, { signal }), ownerId, kind);
  }
  async setFavourite(ownerUid: string, ownerId: string, kind: MediaKind, mediaId: number, enabled: boolean) {
    this.assertIdentity(ownerUid);
    if (!Number.isSafeInteger(mediaId) || mediaId <= 0) throw new ApiError('Choose a valid film or show.');
    const current = await this.favouriteRanking(ownerUid, ownerId, kind);
    if (current.some(item => item.film.id === mediaId) === enabled) return current;
    if (enabled && current.length >= 10)
      throw new ApiError(`You can have up to 10 favourite ${kind === 'movie' ? 'films' : 'shows'}. Remove one from your profile to make room.`, 400, 'FAVOURITE_LIMIT');
    this.assertIdentity(ownerUid);
    // The native bulk route imports missing catalogue titles and preserves existing ranks.
    const raw = await this.request(enabled
      ? `/users/${encodeURIComponent(ownerId)}/${kind === 'movie' ? 'movies' : 'shows'}/favorites`
      : `/users/${encodeURIComponent(ownerId)}/${kind}/favorite/${mediaId}`, {
      method: enabled ? 'POST' : 'DELETE',
      ...(enabled ? { body: { [kind === 'movie' ? 'movieIds' : 'showIds']: [mediaId] } } : {}),
    });
    const saved = rankedFavourites(raw, ownerId, kind);
    if (saved.some(item => item.film.id === mediaId) !== enabled)
      throw new ApiError('The favourite change could not be confirmed. Reload your favourites before trying again.');
    return saved;
  }
  async saveFavouriteRanking(ownerUid: string, ownerId: string, kind: MediaKind, draft: RankedFavourite[]) {
    this.assertIdentity(ownerUid);
    if (!draft.length || !sameFavouriteMembership(draft, draft)) throw new ApiError('Choose a valid favourite order.');
    const current = await this.favouriteRanking(ownerUid, ownerId, kind);
    if (!sameFavouriteMembership(draft, current))
      throw new ApiError('Your favourites changed. Reload the list before saving your order.', 409, 'FAVOURITES_CHANGED');
    this.assertIdentity(ownerUid);
    const field = kind === 'movie' ? 'movies' : 'shows';
    const saved = rankedFavourites(await this.request(`/users/${encodeURIComponent(ownerId)}/${kind}/favorites/update-rankings`, {
      method: 'PUT', body: { [field]: draft.map(item => ({ id: item.id })) },
    }), ownerId, kind);
    if (!sameFavouriteMembership(draft, saved) || saved.some((item, index) => item.id !== draft[index].id || item.rank !== index + 1))
      throw new ApiError('The saved order could not be confirmed. Your draft is still here; reload or try saving again.');
    return saved;
  }
  async avatars(signal?:AbortSignal) {
    const row=object(await this.request('/avatars',{signal}));
    if (!Array.isArray(row.avatars)) throw new Error('Avatars could not be loaded.');
    return row.avatars.map(object).filter(a=>Number.isSafeInteger(a.id)&&Number(a.id)>0);
  }
  async chooseAvatar(ownerUid:string,id:number|null) {
    this.assertIdentity(ownerUid);
    return this.request('/users/me/avatar',id===null?{method:'DELETE'}:{method:'PATCH',body:{avatarId:id}});
  }
  async chooseBorder(ownerUid:string,border:string) {
    this.assertIdentity(ownerUid);
    return this.request('/users/me/avatar-border',{method:'PATCH',body:{border}});
  }
  async editProfile(ownerUid:string,owner:string,field:'username'|'bio',value:string) {
    this.assertIdentity(ownerUid);
    return this.request(`/users/update/field/${encodeURIComponent(owner)}`,{method:'PUT',body:{[field]:value}});
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
  async credits(id: number, kind: MediaKind, signal?: AbortSignal) {
    const raw = await this.request(
      `/${kind === "movie" ? "movies" : "shows"}/${id}/credits`,
      { public: true, signal },
    );
    return {
      cast: castMembers(raw),
      directors: directorPeople(raw),
    };
  }
  async person(id: number, signal?: AbortSignal) {
    return talent(await this.request(`/people/${id}`, { public: true, signal }), id);
  }
  async personCredits(id: number, signal?: AbortSignal) {
    return talentCredits(await this.request(`/people/${id}/credits`, { public: true, signal }));
  }
  async images(id: number, kind: MediaKind, signal?: AbortSignal) {
    return titlePhotos(
      await this.request(
        `/${kind === "movie" ? "movies" : "shows"}/${id}/images`,
        { public: true, signal },
      ),
    );
  }
  async titleFriends(id: number, kind: MediaKind, signal?: AbortSignal) {
    const raw =
      kind === "movie"
        ? object(
            await this.request(`/movies/${id}/friend-recommendation`, {
              signal,
            }),
          )
        : object(
            list(
              object(
                await this.request("/shows/friend-recommendations", {
                  method: "POST",
                  body: { showIds: [id] },
                  signal,
                }),
              ).items,
            )[0],
          );
    if (String(raw.showId ?? raw.movieId) !== String(id))
      throw new ApiError(
        "Friends’ opinions could not be loaded. Please try again.",
      );
    return friendOpinions(raw);
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
  async createWatchPlan(uid: string, ownerId: string, input: PlanCreateInput) {
    this.assertIdentity(uid);
    const raw = await this.request('/watch-plans', {method:'POST', body: input});
    if (!planReceiptMatches(raw, input, ownerId)) throw new ApiError('The saved plan could not be confirmed. Check Watch Plans, or retry the same invitation.', 0, 'PLAN_RECEIPT_MISSING');
    return plan(raw);
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
    input: MovieWatchInput,
  ) {
    const raw = object(await this.request(`/users/${encodeURIComponent(owner)}/movie/watches`, {
      method: "POST",
      body: input,
    }));
    if (!text(raw.id)) throw new ApiError("We could not confirm the saved watch. Check your diary before logging again.", 0, "WATCH_RECEIPT_MISSING");
    return { id: text(raw.id) };
  }
  async addMovieReview(owner: string, movieId: number, watchEntryId: string, input: MovieReviewInput) {
    return this.request("/users/add/MOVIE/review", {
      method: "POST",
      body: { review: { ...input, userId: owner, mediaId: movieId, watchEntryId, language: "en" } },
    });
  }
  async providerChoices(signal?:AbortSignal) {
    const raw=await this.request('/utils/watch-providers',{signal});
    return savedProviders(raw);
  }
  async saveProviders(uid:string,ownerId:string,ids:number[]) {
    this.assertIdentity(uid);
    if(ids.some(id=>!Number.isSafeInteger(id)||id<1))throw new ApiError('Choose valid streaming services.');
    await this.request(`/users/${encodeURIComponent(ownerId)}/watch-providers`,{method:'PUT',body:{watchProviderIds:[...new Set(ids)]}});
    const saved=await this.savedProviders(ownerId);const expected=[...new Set(ids)];
    if(saved.length!==expected.length||expected.some(id=>!saved.some(p=>p.id===id)))throw new ApiError('Your services could not be confirmed. Reload them before trying again.');
    return saved;
  }
  async savedProviders(owner: string, signal?: AbortSignal) {
    return savedProviders(await this.request(`/users/${encodeURIComponent(owner)}/watch-providers`, { signal }));
  }
  async cinemaStatus(id:number,region:string,signal?:AbortSignal) {
    return this.request(`/movies/${id}/cinema-status?region=${encodeURIComponent(region)}`, {public:true,signal});
  }
  async options(title: Film, country: string, signal?: AbortSignal) {
    return this.request(
      `/${title.kind === "movie" ? "movies" : "shows"}/${title.id}/${encodeURIComponent(country)}/watch/providers`,
      { public: true, signal },
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
  async pickerGroups(uid:string,ownerId:string,signal?:AbortSignal){
    this.assertIdentity(uid);
    return pickGroups(await this.request(`/groups/user/${encodeURIComponent(ownerId)}`,{signal}),ownerId);
  }
  async pickForUs(uid:string,preferences:PickPreferences){
    this.assertIdentity(uid);
    return pickResults(await this.request('/recommendations/pick-for-us',{method:'POST',timeout:65000,body:pickRequest(preferences)}));
  }
  async showProgress(owner: string, id: number) {
    return object(
      await this.request(
        `/shows/id/${id}?userId=${encodeURIComponent(owner)}&includeFriendSummary=false&includeTrailers=false`,
      ),
    );
  }
  async seasons(id:number,owner?:{uid:string;id:string},signal?:AbortSignal){
    if(owner)this.assertIdentity(owner.uid);
    return showSeasons(await this.request(`/shows/id/${id}?${owner?`userId=${encodeURIComponent(owner.id)}&`:''}includeFriendSummary=false&includeTrailers=false`,{public:!owner,signal}),id);
  }
  async setEpisodeProgress(uid:string,owner:string,showId:number,episodeId:number,watched:boolean){
    this.assertIdentity(uid);
    if(!Number.isSafeInteger(showId)||showId<1||!Number.isSafeInteger(episodeId)||episodeId<1)throw new ApiError('Choose a valid episode.');
    const raw=object(await this.request(`/users/${encodeURIComponent(owner)}/shows/${showId}/episodes/${episodeId}/progress`,{method:'PATCH',body:{watched,recordWatchDate:false}})),progress=object(raw.progress);
    if(progress.userId!==owner||progress.showId!==showId||progress.episodeId!==episodeId||progress.watched!==watched)throw new ApiError('The episode update could not be confirmed. Reload the episode list before trying again.');
    return {watched};
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
