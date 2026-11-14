import { useEffect, useState, type FormEvent } from "react";
import { authMessage, useSession } from "./auth";
import { navigate, safeNext } from "./routing";
import { ErrorState,Loading } from "./components";
export default function AuthForm({
  initialJoin = false,
  onComplete,
}: {
  initialJoin?: boolean;
  onComplete?: () => void;
}) {
  const session = useSession();
  const [join, setJoin] = useState(
    initialJoin || Boolean(session.identity && !session.user),
  );
  const [name, setName] = useState(session.identity?.email ?? ""),
    [password, setPassword] = useState(""),
    [firstName, setFirstName] = useState(""),
    [username, setUsername] = useState(""),
    [accepted, setAccepted] = useState(false),
    [sharing, setSharing] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  useEffect(()=>{if(initialJoin)setJoin(true);},[initialJoin]);
  useEffect(() => {
    if (session.user) {
      onComplete?.();
      if (!onComplete)
        navigate(
          safeNext(new URLSearchParams(window.location.search).get("next")),
          true,
        );
    }
  }, [session.user]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      if (join) {
        if (!accepted)
          throw new Error("Please read and agree to the Terms of Use.");
        await session.join(name, password, {
          firstName: firstName.trim(),
          username: username.trim(),
          lastName: "",
          communitySharing: sharing,
          termsAccepted: true,
        });
      } else await session.signIn(name, password);
    } catch (e) {
      setError(
        e instanceof Error &&
          e.message === "Please read and agree to the Terms of Use."
          ? e.message
          : authMessage(e),
      );
    } finally {
      setBusy(false);
    }
  }
  if(session.loading&&session.identity)return <Loading label="Opening your Flixie account…"/>;
  return (
    <div className="fx-auth">
      <h1>{join ? "Make Flixie yours" : "Welcome back."}</h1>
      <p className="fx-muted">
        {join
          ? "Keep your films, shows and people together."
          : "Your watchlist and diary are waiting for you."}
      </p>
      <form onSubmit={submit}>
        {join && (
          <>
            <label htmlFor="fx-first-name">First name</label>
            <input
              id="fx-first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              maxLength={100}
              autoComplete="given-name"
            />
            <label htmlFor="fx-username">Username</label>
            <input
              id="fx-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={20}
              autoComplete="username"
            />
          </>
        )}
        <label htmlFor="fx-email">{join ? "Email" : "Email or username"}</label>
        <input
          id="fx-email"
          type={join ? "email" : "text"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete={join ? "email" : "username"}
          disabled={join && Boolean(session.identity)}
        />
        {!session.identity && (
          <>
            <label htmlFor="fx-password">Password</label>
            <input
              id="fx-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={join ? 6 : 1}
              autoComplete={join ? "new-password" : "current-password"}
            />
          </>
        )}
        {join && (
          <>
            <label className="fx-check">
              <input
                type="checkbox"
                checked={sharing}
                onChange={(e) => setSharing(e.target.checked)}
              />
              Share my ratings and reviews with the Flixie community
            </label>
            <p className="fx-small fx-muted">
              Your private diary notes stay private.
            </p>
            <label className="fx-check">
              <input
                type="checkbox"
                required
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              <span>
                I agree to the{" "}
                <a
                  href="/web/terms.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms of Use
                </a>{" "}
                and have read the{" "}
                <a href="/privacy" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>
                .
              </span>
            </label>
          </>
        )}
        {error && <ErrorState message={error} />}
        <button type="submit" className="fx-button fx-primary" disabled={busy}>
          {busy ? "Please wait…" : join ? "Create account" : "Sign in"}
        </button>
      </form>
      {!session.identity && (
        <div className="fx-provider-buttons">
          <button
            className="fx-button"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              void session
                .provider("google")
                .catch((e) => setError(authMessage(e)))
                .finally(() => setBusy(false));
            }}
          >
            Continue with Google
          </button>
          <button
            className="fx-button"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              void session
                .provider("apple")
                .catch((e) => setError(authMessage(e)))
                .finally(() => setBusy(false));
            }}
          >
            Continue with Apple
          </button>
        </div>
      )}
      {!session.identity && (
        <button
          type="button"
          className="fx-text-button"
          onClick={() => {
            setJoin(!join);
            setError("");
          }}
        >
          {join
            ? "Already have an account? Sign in"
            : "New to Flixie? Create an account"}
        </button>
      )}
      {!join && (
        <button
          type="button"
          className="fx-text-button"
          disabled={busy}
          onClick={() => {
            if (!name.includes("@")) {
              setError("Enter your email address to reset your password.");
              return;
            }
            setBusy(true);
            void session
              .reset(name)
              .then(() =>
                setNotice(
                  "If this address has an account, a reset link is on its way.",
                ),
              )
              .catch((e) => setError(authMessage(e)))
              .finally(() => setBusy(false));
          }}
        >
          Forgot your password?
        </button>
      )}
      {notice && <p role="status">{notice}</p>}
      {session.identity && !session.user && (
        <button
          type="button"
          className="fx-text-button"
          onClick={() => void session.signOut()}
        >
          Use a different account
        </button>
      )}
    </div>
  );
}
