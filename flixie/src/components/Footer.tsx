import { ArrowUpRight, Instagram } from "lucide-react";
import BrandLogo from "./BrandLogo";
import { site } from "../site";
import { featureContent, featurePageIds } from "../featureContent";

export default function Footer({
  year,
  compact = false,
}: {
  year: number;
  compact?: boolean;
}) {
  return (
    <footer className="site-footer" id="main-footer" data-shared-footer>
      <div className="site-footer-inner">
        <div className="site-footer-main">
          <div className="site-footer-brand">
            <a
              href="/"
              aria-label="Flixie home"
              className="site-footer-logo"
              id="footer-logo-button"
            >
              <BrandLogo className="site-footer-wordmark" alt="" />
              <span className="site-footer-theme-wordmark" aria-hidden="true" />
            </a>
            <p className="site-footer-tagline">
              Your films. Your people.
              <br />
              Your next good watch.
            </p>
            <p className="site-footer-copy">
              Discover, track and plan. Watch through your own services.
            </p>
            <a
              className="site-footer-link site-footer-social"
              href="https://www.instagram.com/flixie_co/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram size={18} aria-hidden="true" />
              @flixie_co
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </div>
          <nav
            aria-labelledby="footer-explore-title"
            className="site-footer-nav"
          >
            <h2 className="site-footer-title" id="footer-explore-title">
              Explore
            </h2>
            <a className="site-footer-link" href="/films">
              Films &amp; TV
            </a>
            <a className="site-footer-link" href="/app">
              Use Flixie on the web
            </a>
            <a className="site-footer-link" href="/features">
              Features
            </a>
            <a className="site-footer-link" href="/about">
              About Flixie
            </a>
          </nav>
          <nav aria-labelledby="footer-help-title" className="site-footer-nav">
            <h2 className="site-footer-title" id="footer-help-title">
              Here to help
            </h2>
            <a className="site-footer-link" href="/faqs">
              FAQs
            </a>
            <a className="site-footer-link" href="/contact">
              Contact &amp; support
            </a>
            <a className="site-footer-link" href="/privacy">
              Privacy Policy
            </a>
            <a className="site-footer-link" href="/terms">
              Terms of Use
            </a>
            <a className="site-footer-link" href="/contact#account-deletion">
              Delete account
            </a>
          </nav>
          <section
            className="site-footer-download"
            id="download"
            aria-labelledby="footer-download-title"
          >
            <h2 className="site-footer-title" id="footer-download-title">
              Flixie on your phone
            </h2>
            <p className="site-footer-copy">
              Your watchlist, film diary and friends, wherever you are.
            </p>
            <div className="site-footer-stores">
              <a
                className="site-footer-store"
                href={site.iosUrl}
                aria-label="Download Flixie on the App Store"
              >
                <span>Download on the</span>
                <strong>App Store</strong>
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
              <a
                className="site-footer-store"
                href={site.androidUrl}
                aria-label="Get Flixie on Google Play"
              >
                <span>Get it on</span>
                <strong>Google Play</strong>
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            </div>
          </section>
        </div>
        {!compact && (
          <nav
            className="site-footer-features"
            aria-label="Explore Flixie features"
          >
            {featurePageIds.map((key) => (
              <a
                className="site-footer-link"
                key={key}
                href={featureContent[key].path}
              >
                {featureContent[key].label}
              </a>
            ))}
          </nav>
        )}
        <div className="site-footer-bottom">
          <p className="site-footer-copyright">© {year} Flixie App</p>
          <div className="site-footer-credits">
            <p>
              This product uses the{" "}
              <a
                href="https://www.themoviedb.org/"
                className="site-footer-link"
              >
                TMDB API
              </a>{" "}
              but is not endorsed or certified by TMDB.
            </p>
            <p>
              Watch-provider data is supplied through TMDB, powered by{" "}
              <a href="https://www.justwatch.com/" className="site-footer-link">
                JustWatch
              </a>
              . Availability varies by country; rentals and purchases may cost
              extra.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
