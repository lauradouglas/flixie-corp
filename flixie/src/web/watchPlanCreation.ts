import { list, object, text, type Film, type Person, type Plan } from './models';
import type { PickGroup, PickPreferences } from './pickForUs';

export type PlanPlaceKind = 'home' | 'cinema' | 'separately' | 'undecided';
export interface PlanCreateInput {
  id: string;
  friendIds: string[];
  groupId: string | null;
  movies: number[];
  where: { kind: PlanPlaceKind; hostId: string | null; venue: string };
  schedule: { at: string; dateOnly: boolean } | null;
  arranged: false;
}
export interface PickPlanContext { viewer: PickPreferences['viewer']; place: PlanPlaceKind }
export function pickerPlanContext(preferences: PickPreferences): PickPlanContext {
  return { viewer: { ...preferences.viewer }, place: preferences.venue === 'cinema' ? 'cinema' : preferences.watching === 'separately' ? 'separately' : 'home' };
}
export function localCalendarDay(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
export function createPlanSchedule(day: string, time: string, now = new Date()): PlanCreateInput['schedule'] {
  if (!day) { if (time) throw new Error('Choose a date before adding a time.'); return null; }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error('Choose a valid date.');
  const [year, month, date] = day.split('-').map(Number), calendar = new Date(Date.UTC(year, month - 1, date, 12));
  if (calendar.toISOString().slice(0, 10) !== day || year < 1900 || day < localCalendarDay(now)) throw new Error('Choose today or a future date.');
  // The shared API treats date-only UTC calendar components as a day, never a clock time.
  if (!time) return { at: calendar.toISOString(), dateOnly: true };
  if (!/^\d{2}:\d{2}$/.test(time)) throw new Error('Choose a valid time.');
  const [hour, minute] = time.split(':').map(Number), at = new Date(year, month - 1, date, hour, minute);
  if (hour > 23 || minute > 59 || at.getFullYear() !== year || at.getMonth() !== month - 1 || at.getDate() !== date || at.getHours() !== hour || at.getMinutes() !== minute) throw new Error('That local time is unavailable. Choose another time.');
  if (at.getTime() <= now.getTime()) throw new Error('Choose a time in the future.');
  return { at: at.toISOString(), dateOnly: false };
}
export function createPlanInput(draft: {
  id: string; ownerId: string; film: Film; audience: 'solo' | 'friends' | 'group'; friendIds: string[]; groupId: string;
  friends: Person[]; groups: PickGroup[]; place: PlanPlaceKind; hostId: string; venue: string; day: string; time: string;
}, now = new Date()): PlanCreateInput {
  if (!/^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(draft.id) || !draft.ownerId || draft.film.kind !== 'movie' || !Number.isSafeInteger(draft.film.id) || draft.film.id < 1) throw new Error('Choose a film and try again.');
  const friendIds = draft.audience === 'friends' ? [...new Set(draft.friendIds)] : [], group = draft.audience === 'group' ? draft.groups.find(g => g.id === draft.groupId) : null;
  if (draft.audience === 'friends' && (!friendIds.length || friendIds.length > 20 || friendIds.some(id => id === draft.ownerId || !draft.friends.some(p => p.id === id)))) throw new Error('Choose between 1 and 20 current friends to invite.');
  if (draft.audience === 'group' && (!group || !group.members.some(p => p.id === draft.ownerId))) throw new Error('Choose an available group.');
  const people = group ? group.members.map(p => p.id) : [draft.ownerId, ...friendIds];
  if (!['home', 'cinema', 'separately', 'undecided'].includes(draft.place)) throw new Error('Choose where you’re watching.');
  const hostId = draft.place === 'home' ? draft.hostId : null;
  if (hostId && !people.includes(hostId)) throw new Error('Choose a host who is part of this plan.');
  if (draft.venue.trim().length > 150) throw new Error('Keep the venue under 150 characters.');
  return { id: draft.id, friendIds, groupId: group?.id ?? null, movies: [draft.film.id], where: { kind: draft.place, hostId: hostId || null, venue: draft.place === 'cinema' ? draft.venue.trim() : '' }, schedule: createPlanSchedule(draft.day, draft.time, now), arranged: false };
}
export function planReceiptMatches(value: unknown, input: PlanCreateInput, ownerId: string) {
  const row = object(value), participants = list(row.people).map(value => object(value));
  if (row.id !== input.id || row.ownerId !== ownerId || (row.groupId ?? null) !== input.groupId || row.selectedMovieId !== input.movies[0] || !list(row.films).some(value => object(value).id === input.movies[0]) || !participants.some(p => object(p.user).id === ownerId && p.response === 'joined')) return false;
  const ids = participants.map(p => text(object(p.user).id));
  if (ids.some(id => !id) || new Set(ids).size !== ids.length) return false;
  // An idempotent retry may return a plan whose invitations have already been answered.
  return input.groupId ? ids.length >= 2 : ids.length === input.friendIds.length + 1 && input.friendIds.every(id => ids.includes(id));
}

/** Freeze an uncertain attempt, so an explicit retry cannot create a second plan or invite a changed audience. */
export class WatchPlanSubmission {
  snapshot: PlanCreateInput | null = null;
  private pending: Promise<Plan> | null = null;
  private saved: Plan | null = null;
  private ambiguous = false;
  save(build: () => PlanCreateInput, send: (input: PlanCreateInput) => Promise<Plan>): Promise<Plan> {
    if (this.saved) return Promise.resolve(this.saved);
    if (this.pending) return this.pending;
    const input = this.snapshot ?? build();
    this.snapshot = structuredClone(input);
    this.pending = Promise.resolve().then(() => send(structuredClone(input))).then(plan => { this.saved = plan; return plan; }).catch(error => {
      const status = object(error).status;
      if (typeof status === 'number' && status >= 400 && status < 500 && !this.ambiguous) this.snapshot = null;
      else this.ambiguous = true;
      throw error;
    }).finally(() => { this.pending = null; });
    return this.pending;
  }
}
