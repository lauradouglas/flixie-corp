import CinemaStatus from "./CinemaStatus";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useSession } from "./auth";
import { useLoad } from "./hooks";
import { imageUrl, type Film } from "./models";
import { matchesSavedProvider, offerLabel, providerOffers, type ProviderOffer } from "./watchProviders";
import "./provider-overview.css";

function ProviderLogo({ offer }: { offer: ProviderOffer }) {
  const [failed, setFailed] = useState(false);
  const src = imageUrl(offer.logo, "w92");
  return src && !failed ? <img src={src} width={34} height={34} alt="" onError={() => setFailed(true)} /> :
    <span className="fx-provider-initial" aria-hidden="true">{offer.name.slice(0, 1)}</span>;
}

export function ProviderOverview({ film, onOptions, onSignIn }: {
  film: Film;
  onOptions: () => void;
  onSignIn: () => void;
}) {
  const { api, user, identity } = useSession();
  const country = /^[A-Za-z]{2}$/.test(user?.country ?? "") ? user!.country.toUpperCase().replace(/^UK$/, "GB") : "GB";
  const countryName = new Intl.DisplayNames(["en-GB"], { type: "region" }).of(country) ?? country;
  const availability = useLoad(`overview-offers:${film.kind}:${film.id}:${country}`, signal =>
    api.options(film, country, signal).then(raw => providerOffers(raw, film)));
  const services = useLoad(`overview-services:${identity?.uid ?? "guest"}:${user?.id ?? "none"}`, signal =>
    user ? api.savedProviders(user.id, signal) : Promise.resolve(null));
  const offers = availability.data ?? [];
  const matches = user && services.data ? offers.filter(offer => matchesSavedProvider(offer, services.data)) : [];
  const visible = (matches.length ? matches : offers).slice(0, 3);
  const loading = availability.loading || Boolean(offers.length && user && services.loading);
  const hasPaidOnly = visible.some(offer => !offer.kinds.includes("stream"));
  return <section className="fx-provider-overview" aria-label="Where to watch" aria-busy={loading}>
    <div className="fx-provider-overview-heading">
      <div><h3>{matches.length ? "On your services" : "Where to watch"}</h3><span>{countryName}</span></div>
      <button className="fx-text-button" type="button" onClick={onOptions}>All options<ArrowUpRight size={14} aria-hidden="true" /></button>
    </div>
    {film.kind === "movie" && <CinemaStatus id={film.id} region={country} countryName={countryName}/>}
    {availability.error ? <div className="fx-provider-overview-message" role="alert"><p>{availability.error}</p><button className="fx-text-button" onClick={availability.retry}>Try again</button></div> :
      loading ? <p className="fx-provider-overview-note" role="status">Checking your viewing options…</p> : <>
        {offers.length > 0 && user && services.error && <div className="fx-provider-overview-message" role="alert"><p>Your services couldn’t be checked. These are the listed viewing options.</p><button className="fx-text-button" onClick={services.retry}>Retry your services</button></div>}
        {offers.length > 0 && user && services.data && !services.error && !matches.length && <p className="fx-provider-overview-note">{services.data.length ? "No matches for your saved services." : "Add your services in the Flixie app to highlight your matches."}</p>}
        {visible.length ? <ul className="fx-overview-provider-list">
          {visible.map(offer => {
            const contents = <><ProviderLogo offer={offer} /><span><strong>{offer.name}</strong><small>{offerLabel(offer)}</small></span></>;
            return <li key={offer.id}>{offer.href ? <a className="fx-overview-provider" href={offer.href} target="_blank" rel="noopener noreferrer" aria-label={`${offer.name}, ${offerLabel(offer)} — viewing details on TMDB`}>{contents}</a> : <div className="fx-overview-provider">{contents}</div>}</li>;
          })}
        </ul> : <p className="fx-provider-overview-note">No viewing options are listed for {countryName}.</p>}
        {offers.length > 0 && !user && <button className="fx-text-button" type="button" onClick={onSignIn}>Sign in to highlight your services</button>}
        {visible.length > 0 && <p className="fx-provider-overview-source">TMDB / JustWatch{hasPaidOnly ? " · Rentals and purchases cost extra." : ""}</p>}
      </>}
  </section>;
}
