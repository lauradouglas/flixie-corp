import type { Plan } from './models';

export function planFilm(plan: Plan) {
  return plan.films.find(film => film.id === plan.selectedMovieId) ?? null;
}
export function planTitle(plan: Plan) {
  return planFilm(plan)?.title ?? (plan.films.length ? 'Choosing a film' : 'Your next film night');
}
export function planStatus(plan: Plan) {
  if (plan.status === 'cancelled') return { label: 'Cancelled', tone: 'quiet' };
  if (!plan.confirmed && plan.selectedMovieId && plan.people.some(person => person.response === 'pending')) return { label: 'Awaiting replies', tone: 'pending' };
  if (plan.changesProposed) return { label: 'Changes proposed', tone: 'pending' };
  if (plan.confirmed) return { label: 'Confirmed', tone: 'confirmed' };
  return { label: 'Planning', tone: 'pending' };
}
export function planSchedule(plan: Plan, timeZone?: string) {
  const date = new Date(plan.date);
  if (!plan.date || !Number.isFinite(date.getTime()))
    return { date: 'Date to be decided', shortDate: 'Date to be decided', time: 'Time to be decided', dateTime: undefined };
  const zone = plan.dateOnly ? 'UTC' : timeZone;
  const options = { timeZone: zone };
  return {
    date: new Intl.DateTimeFormat('en-GB', { ...options, weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }).format(date),
    shortDate: new Intl.DateTimeFormat('en-GB', { ...options, day: 'numeric', month: 'short', year: 'numeric' }).format(date),
    time: plan.dateOnly ? 'Time to be decided' : new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date),
    dateTime: plan.dateOnly ? date.toISOString().slice(0, 10) : date.toISOString(),
  };
}
export function planPlace(plan: Plan) {
  if (plan.location) return plan.location;
  const host = plan.people.find(person => person.id === plan.hostId);
  if (plan.placeKind === 'home' && host) return `At ${host.firstName || host.username}’s place`;
  return ({ home: 'At home', cinema: 'At the cinema', separately: 'Watching separately' } as Record<string, string>)[plan.placeKind] ?? 'Place to be decided';
}
export function participantReply(response: Plan['people'][number]['response']) {
  return response ? { joined: 'Joining', included: 'Included', pending: 'Invited', declined: 'Declined' }[response] : 'Reply not available';
}
