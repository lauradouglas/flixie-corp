import { site } from "../site";
export default function DownloadPrompt() {
  return (
    <section className="fx-download-prompt" aria-label="Download Flixie">
      <img src="/web/flixie-f.png" alt="" width="48" height="48" />
      <div>
        <h2>Download Flixie on your phone</h2>
        <p>Your watchlist, film diary and friends, on your phone.</p>
        <div className="fx-button-row">
          <a className="fx-button fx-primary" href={site.iosUrl}>
            Download on the App Store
          </a>
          <a className="fx-button" href={site.androidUrl}>
            Get it on Google Play
          </a>
        </div>
      </div>
    </section>
  );
}
