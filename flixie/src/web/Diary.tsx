import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  List,
  MessageSquare,
  Search,
} from "lucide-react";
import { Empty, Link, Poster, Sheet } from "./components";
import type { DiaryEntry } from "./models";
import { titlePath } from "./routing";
import {
  diaryCalendarDays,
  diaryDateKey,
  diaryDateLabel,
  diaryMonthEntries,
  shiftDiaryMonth,
} from "./diaryDates";

export function DiaryRow({ entry }: { entry: DiaryEntry }) {
  const [reading, setReading] = useState(false);
  const key = diaryDateKey(entry.watchedAt);
  return (
    <>
      <article className="fx-diary-entry">
        <div className="fx-diary-date">
          {key ? (
            <time dateTime={key}>
              <strong>{Number(key.slice(8))}</strong>
              <span>{diaryDateLabel(key, { month: "short" })}</span>
            </time>
          ) : (
            <span>Undated</span>
          )}
        </div>
        <Link to={titlePath(entry.movie.id)} className="fx-poster-button">
          <Poster film={entry.movie} />
        </Link>
        <div className="fx-diary-copy">
          <div className="fx-diary-title">
            <h3>
              <Link to={titlePath(entry.movie.id)}>{entry.movie.title}</Link>
            </h3>
            {entry.rating !== null && (
              <span
                className="fx-score"
                aria-label={`${entry.rating} out of 10`}
              >
                {entry.rating}
                <small>/10</small>
              </span>
            )}
          </div>
          {entry.notes && <p className="fx-diary-note">{entry.notes}</p>}
          {entry.watchedAtCinema && (
            <p className="fx-small fx-muted">At the cinema</p>
          )}
          {entry.review && (
            <button
              type="button"
              className="fx-text-button fx-diary-read"
              onClick={() => setReading(true)}
            >
              <MessageSquare size={16} aria-hidden="true" />
              Read your review
              {entry.review.containsSpoilers && (
                <span className="fx-spoiler-label">Spoilers</span>
              )}
            </button>
          )}
        </div>
      </article>
      {reading && (
        <ReviewReader entry={entry} onClose={() => setReading(false)} />
      )}
    </>
  );
}
export function ReviewReader({
  entry,
  onClose,
}: {
  entry: DiaryEntry;
  onClose: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const review = entry.review!;
  const key = diaryDateKey(entry.watchedAt);
  const hidden = review.containsSpoilers && !revealed;
  return (
    <Sheet
      title="Your review"
      presentation="modal"
      className="fx-review-reader"
      onClose={onClose}
    >
      <div className="fx-review-reader-content">
        <div className="fx-review-film">
          <Link
            to={titlePath(entry.movie.id)}
            onNavigate={onClose}
            className="fx-poster-button"
          >
            <Poster film={entry.movie} />
          </Link>
          <div>
            <h3>{entry.movie.title}</h3>
            {key && <p>Watched {diaryDateLabel(key)}</p>}
            {entry.rating !== null && (
              <span className="fx-score">
                {entry.rating}
                <small>/10</small>
              </span>
            )}
          </div>
        </div>
        {hidden ? (
          <div className="fx-review-spoiler">
            <Eye size={24} aria-hidden="true" />
            <h3>This review contains spoilers</h3>
            <p>Reveal it when you’re ready.</p>
            <button
              className="fx-button fx-primary"
              type="button"
              onClick={() => setRevealed(true)}
            >
              Reveal review
            </button>
          </div>
        ) : (
          <div className="fx-review-prose">
            {review.containsSpoilers && (
              <span className="fx-spoiler-label">Contains spoilers</span>
            )}
            {review.title && <h3>{review.title}</h3>}
            <p>{review.body}</p>
          </div>
        )}
      </div>
    </Sheet>
  );
}
export function DiaryViews({ entries }: { entries: DiaryEntry[] }) {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [query, setQuery] = useState("");
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const [month, setMonth] = useState(currentMonth),
    [selected, setSelected] = useState<string | null>(null);
  const filtered = useMemo(
    () =>
      entries.filter((entry) =>
        `${entry.movie.title} ${entry.notes} ${entry.review?.containsSpoilers ? "" : (entry.review?.title ?? "")}`
          .toLocaleLowerCase()
          .includes(query.trim().toLocaleLowerCase()),
      ),
    [entries, query],
  );
  const groups = new Map<string, DiaryEntry[]>();
  for (const entry of filtered) {
    const key = diaryDateKey(entry.watchedAt)?.slice(0, 7) ?? "undated";
    groups.set(key, [...(groups.get(key) ?? []), entry]);
  }
  const monthEntries = diaryMonthEntries(filtered, month);
  const selectedEntries = selected
    ? monthEntries.filter((entry) => diaryDateKey(entry.watchedAt) === selected)
    : monthEntries;
  function moveMonth(by: number) {
    setMonth(shiftDiaryMonth(month, by));
    setSelected(null);
  }
  return (
    <div className="fx-diary">
      <div className="fx-diary-tools">
        <div className="fx-diary-view" role="group" aria-label="Diary view">
          <button
            type="button"
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
          >
            <List size={18} />
            List
          </button>
          <button
            type="button"
            aria-pressed={view === "calendar"}
            onClick={() => setView("calendar")}
          >
            <CalendarDays size={18} />
            Calendar
          </button>
        </div>
        <label className="fx-diary-search">
          <Search size={18} aria-hidden="true" />
          <span className="fx-sr-only">Search your diary</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your diary"
          />
        </label>
        <span className="fx-small fx-muted" role="status">
          {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
        </span>
      </div>
      {view === "list" ? (
        <div className="fx-diary-list">
          {[...groups]
            .sort(([a], [b]) =>
              a === "undated" ? 1 : b === "undated" ? -1 : b.localeCompare(a),
            )
            .map(([group, items]) => (
              <section key={group}>
                <h2>
                  {group === "undated"
                    ? "Undated watches"
                    : diaryDateLabel(group, { month: "long", year: "numeric" })}
                </h2>
                <div>
                  {[...items]
                    .sort((a, b) =>
                      (diaryDateKey(b.watchedAt) ?? "").localeCompare(
                        diaryDateKey(a.watchedAt) ?? "",
                      ),
                    )
                    .map((entry) => (
                      <DiaryRow key={entry.id} entry={entry} />
                    ))}
                </div>
              </section>
            ))}
          {!filtered.length && (
            <Empty title="No diary entries match">
              Try another title or note.
            </Empty>
          )}
        </div>
      ) : (
        <>
          <div className="fx-diary-calendar-layout">
            <section className="fx-diary-calendar" aria-label="Watch calendar">
              <div className="fx-calendar-heading">
                <button
                  className="fx-icon-button"
                  aria-label="Previous month"
                  onClick={() => moveMonth(-1)}
                >
                  <ChevronLeft />
                </button>
                <h2 aria-live="polite">
                  {diaryDateLabel(month, { month: "long", year: "numeric" })}
                </h2>
                <button
                  className="fx-icon-button"
                  aria-label="Next month"
                  onClick={() => moveMonth(1)}
                >
                  <ChevronRight />
                </button>
                <button
                  className="fx-text-button"
                  onClick={() => {
                    setMonth(currentMonth);
                    setSelected(null);
                  }}
                >
                  This month
                </button>
              </div>
              <div className="fx-calendar-weekdays" aria-hidden="true">
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div className="fx-calendar-days">
                {diaryCalendarDays(month).map((key, index) => {
                  const watches = key
                    ? monthEntries.filter(
                        (entry) => diaryDateKey(entry.watchedAt) === key,
                      )
                    : [];
                  return key ? (
                    <button
                      key={key}
                      type="button"
                      className={`fx-calendar-day ${watches.length ? "fx-has-watches" : ""}`}
                      aria-pressed={selected === key}
                      aria-label={`${diaryDateLabel(key)}, ${watches.length} ${watches.length === 1 ? "watch" : "watches"}`}
                      onClick={() => setSelected(selected === key ? null : key)}
                    >
                      <span>{Number(key.slice(8))}</span>
                      {watches[0] && <Poster film={watches[0].movie} />}
                      <small>
                        {watches.length
                          ? watches.length > 1
                            ? `×${watches.length}`
                            : ""
                          : ""}
                      </small>
                    </button>
                  ) : (
                    <span
                      className="fx-calendar-blank"
                      key={`blank-${index}`}
                    />
                  );
                })}
              </div>
            </section>
            <section className="fx-calendar-selection">
              <div className="fx-section-head">
                <h2>
                  {selected
                    ? diaryDateLabel(selected, {
                        day: "numeric",
                        month: "long",
                      })
                    : "This month’s watches"}
                </h2>
                {selected && (
                  <button
                    className="fx-text-button"
                    onClick={() => setSelected(null)}
                  >
                    Show month
                  </button>
                )}
              </div>
              {selectedEntries.length ? (
                selectedEntries.map((entry) => (
                  <DiaryRow key={entry.id} entry={entry} />
                ))
              ) : (
                <p className="fx-muted">
                  {selected
                    ? "No watches logged on this date."
                    : "No watches logged this month."}
                </p>
              )}
            </section>
          </div>
          {groups.has("undated") && (
            <section className="fx-diary-undated">
              <h2>Undated watches</h2>
              <p className="fx-small fx-muted">
                These entries don’t have a watch date yet.
              </p>
              {groups.get("undated")!.map((entry) => (
                <DiaryRow key={entry.id} entry={entry} />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
