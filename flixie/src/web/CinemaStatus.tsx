import { Ticket } from "lucide-react";
import { useSession } from "./auth";
import { useLoad } from "./hooks";
import { currentCinemaStatus } from "./cinemaEvidence";
export default function CinemaStatus({
  id,
  region,
  countryName,
}: {
  id: number;
  region: string;
  countryName: string;
}) {
  const { api } = useSession();
  const result = useLoad(`cinema:${id}:${region}`, (signal) =>
    api.cinemaStatus(id, region, signal),
  );
  const current = currentCinemaStatus(result.data, region);
  if (!current) return null;
  return (
    <div className="fx-cinema-status">
      <Ticket size={20} aria-hidden="true" />
      <div>
        <strong>In cinemas</strong>
        <span>{countryName} · Check local showtimes</span>
        <details>
          <summary>About this listing</summary>
          <p>
            Listed by TMDB as now playing in {countryName}. Checked{" "}
            {new Date(current.checkedAt).toLocaleDateString("en-GB")}.
            Availability at individual cinemas can vary.
          </p>
        </details>
      </div>
    </div>
  );
}
