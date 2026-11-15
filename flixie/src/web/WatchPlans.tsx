import { ArrowRight, CalendarDays, Check, Clock3, MapPin, Users } from 'lucide-react';
import { Avatar, AvatarLink, Link, Poster, Sheet } from './components';
import type { Plan } from './models';
import { profilePath, titlePath } from './routing';
import { participantReply, planFilm, planPlace, planSchedule, planStatus, planTitle } from './watchPlanPresentation';
import './watch-plans.css';

function Status({ plan }: { plan: Plan }) {
  const status = planStatus(plan);
  return <span className="fx-plan-status" data-tone={status.tone}>
    {status.tone === 'confirmed' ? <Check size={15} aria-hidden="true" /> : <Clock3 size={15} aria-hidden="true" />}{status.label}
  </span>;
}

export function PlanCard({ plan, onOpen }: { plan: Plan; onOpen: () => void }) {
  const film = planFilm(plan) ?? plan.films[0], when = planSchedule(plan);
  return <article className="fx-plan-card">
    <button className="fx-plan-art" onClick={onOpen} aria-label={`View plan for ${planTitle(plan)}`}>
      {film ? <Poster film={film} /> : <span className="fx-plan-no-art"><CalendarDays size={30} aria-hidden="true" /><span>Film to be decided</span></span>}
    </button>
    <div className="fx-plan-card-copy">
      <h3>{planTitle(plan)}</h3>
      <Status plan={plan} />
      <p className="fx-plan-card-detail"><CalendarDays size={17} aria-hidden="true" /><span><time dateTime={when.dateTime}>{when.shortDate}</time>{!plan.dateOnly && when.dateTime && <> · {when.time}</>}</span></p>
      <p className="fx-plan-card-detail"><MapPin size={17} aria-hidden="true" /><span>{planPlace(plan)}</span></p>
      <div className="fx-plan-card-people">
        <div>{plan.people.slice(0, 4).map(person => <AvatarLink key={person.id} person={person} small />)}</div>
        <span>{plan.people.length ? `${plan.people.length} ${plan.people.length === 1 ? 'person' : 'people'}` : 'People to be decided'}</span>
      </div>
      <button className="fx-button fx-primary fx-plan-view" onClick={onOpen}>View plan <ArrowRight size={18} aria-hidden="true" /></button>
    </div>
  </article>;
}

export function WatchPlanPreview({ plan, onClose, created = false, onViewPlans }: { plan: Plan; onClose: () => void; created?: boolean; onViewPlans?: () => void }) {
  const film = planFilm(plan), when = planSchedule(plan);
  const shortlist = !film && plan.films.length > 0;
  return <Sheet title={created ? "Watch Plan created" : "Your Watch Plan"} presentation="modal" className="fx-plan-modal" onClose={onClose}>
    {created && <p className="fx-plan-created-note" role="status">{plan.people.length > 1 ? "Invitations sent. Your friends can join or decline in Flixie." : "Your film night is saved."}</p>}
    <div className="fx-plan-content">
      <div className={`fx-plan-summary ${film ? '' : 'fx-plan-unselected'}`}>
      <div className="fx-plan-hero">
        {film && <Link className="fx-plan-hero-art" to={titlePath(film.id, film.kind)} aria-label={`View ${film.title}`}><Poster film={film} /></Link>}
        <div>
          <h3>{film ? <Link to={titlePath(film.id, film.kind)}>{film.title}</Link> : planTitle(plan)}</h3>
          {film?.runtime ? <p className="fx-plan-runtime">{Math.floor(film.runtime / 60) ? `${Math.floor(film.runtime / 60)}h ` : ''}{film.runtime % 60 ? `${film.runtime % 60}m` : ''}</p> : null}
          <Status plan={plan} />
        </div>
      </div>
      <dl className="fx-plan-facts">
        <div><dt><CalendarDays size={18} aria-hidden="true" />Date</dt><dd><time dateTime={when.dateTime}>{when.date}</time></dd></div>
        <div><dt><Clock3 size={18} aria-hidden="true" />Time</dt><dd>{when.time}</dd></div>
        <div className="fx-plan-place"><dt><MapPin size={18} aria-hidden="true" />Where</dt><dd>{planPlace(plan)}</dd></div>
      </dl>
      </div>
      {shortlist && <section className="fx-plan-shortlist" aria-labelledby="plan-shortlist-title">
        <h3 id="plan-shortlist-title">Films in the running</h3>
        <div>{plan.films.map(film => <Link key={`${film.kind}:${film.id}`} to={titlePath(film.id, film.kind)}><Poster film={film} /><span>{film.title}</span></Link>)}</div>
      </section>}
      <section className="fx-plan-members" aria-labelledby="plan-members-title">
        <h3 id="plan-members-title"><Users size={20} aria-hidden="true" />Who’s watching <span>{plan.people.length}</span></h3>
        {plan.people.length ? <ul>{plan.people.map(person => <li key={person.id}>
          <Link to={profilePath(person.id)} className="fx-plan-member-link" aria-label={`View ${person.username}’s profile`}>
            <Avatar person={person} /><span><strong>{person.firstName || person.username}</strong>{person.firstName && <small>@{person.username}</small>}</span><ArrowRight size={17} aria-hidden="true" />
          </Link><span className="fx-plan-reply">{participantReply(person.response)}</span>
        </li>)}</ul> : <p className="fx-muted">People will appear here once they’re part of the plan.</p>}
      </section>
    </div>
    <div className="fx-plan-footer">
      <p>Manage this plan in the Flixie app.</p>
      <div>{onViewPlans ? <button className="fx-button" onClick={onViewPlans}>View Watch Plans</button> : <button className="fx-button" onClick={onClose}>Close plan</button>}<a href="/download" className="fx-button fx-primary">Open Flixie <ArrowRight size={18} aria-hidden="true" /></a></div>
    </div>
  </Sheet>;
}
