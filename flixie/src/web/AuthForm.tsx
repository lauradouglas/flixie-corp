import { useEffect, useRef, useState, type FormEvent } from "react";
import { authMessage, useSession } from "./auth";
import { navigate, safeNext } from "./routing";
import { ErrorState } from "./components";
export function AuthProgress({ provider }: { provider?: "google" | "apple" }) {
  const name = provider === "apple" ? "Apple" : "Google";
  return (
    <div className="fx-auth fx-auth-progress" role="status" aria-live="polite">
      <img src="/web/flixie-f.png" alt="" width={56} height={56} />
      <h1>{provider ? `Finish signing in with ${name}` : "Opening your Flixie account…"}</h1>
      <p className="fx-muted">
        {provider ? `Complete sign-in in the ${name} window.` : "Getting your films, shows and people ready."}
      </p>
      {provider && <p className="fx-small fx-muted">Close that window to return to this page.</p>}
    </div>
  );
}

export default function AuthForm({
  initialJoin = false,
  onComplete,
}: {
  initialJoin?: boolean;
  onComplete?: () => void;
}) {
  const session = useSession();
  const [join, setJoin] = useState(
    initialJoin ||
      Boolean(session.identity && !session.user && !session.loading),
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
  const [pendingProvider, setPendingProvider] = useState<"google" | "apple" | null>(null);
  const submitLock = useRef(false);
  const providerButtons = useRef<Record<"google" | "apple", HTMLButtonElement | null>>({google: null, apple: null});
  const previousProvider = useRef<"google" | "apple" | null>(null);
  useEffect(() => {
    if (!pendingProvider && previousProvider.current && !session.identity)
      providerButtons.current[previousProvider.current]?.focus();
    previousProvider.current = pendingProvider;
  }, [pendingProvider, session.identity]);
  useEffect(() => {
    if (initialJoin) setJoin(true);
  }, [initialJoin]);
  useEffect(() => {
    if (session.identity && !busy) setPassword("");
  }, [session.identity?.uid, busy]);
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
  const isJoining =
    join || Boolean(session.identity && !session.user && !session.loading);
  const email = session.identity?.email || name;
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitLock.current) return;
    submitLock.current = true;
    setError("");
    setNotice("");
    setBusy(true);
    try {
      if (isJoining) {
        if (!accepted)
          throw new Error("Please read and agree to the Terms of Use.");
        await session.join(email, password, {
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
      submitLock.current = false;
      setBusy(false);
    }
  }
  async function continueWithProvider(provider: "google" | "apple") {
    if (submitLock.current) return;
    submitLock.current = true;
    setError("");
    setNotice("");
    setBusy(true);
    setPendingProvider(provider);
    try {
      await session.provider(provider);
    } catch (e) {
      setError(authMessage(e, provider));
    } finally {
      submitLock.current = false;
      setBusy(false);
      setPendingProvider(null);
    }
  }
  function useDifferentAccount() {
    if (submitLock.current) return;
    void session
      .signOut()
      .then(() => {
        setJoin(false);
        setName("");
        setPassword("");
        setFirstName("");
        setUsername("");
        setAccepted(false);
        setSharing(true);
        setError("");
        setNotice("");
      })
      .catch((e) => setError(authMessage(e)));
  }
  if (pendingProvider) return <AuthProgress provider={pendingProvider} />;
  if (session.loading && !busy) return <AuthProgress />;
  if (session.error && session.identity && !busy)
    return (
      <div className="fx-auth">
        <ErrorState
          message={session.error}
          retry={() => void session.reloadProfile()}
        />
        <button
          type="button"
          className="fx-text-button"
          onClick={useDifferentAccount}
        >
          Use a different account
        </button>
      </div>
    );
  return (
    <div className="fx-auth">
      <h1>{isJoining ? "Make Flixie yours" : "Welcome back."}</h1>
      <p className="fx-muted">
        {isJoining
          ? "Keep your films, shows and people together."
          : "Your watchlist and diary are waiting for you."}
      </p>
      <form onSubmit={submit} aria-busy={busy}>
        {isJoining && (
          <>
            <label htmlFor="fx-first-name">First name</label>
            <input
              disabled={busy}
              id="fx-first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              maxLength={100}
              autoComplete="given-name"
            />
            <label htmlFor="fx-username">Username</label>
            <input
              disabled={busy}
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
        <label htmlFor="fx-email">
          {isJoining ? "Email" : "Email or username"}
        </label>
        <input
          id="fx-email"
          type={isJoining ? "email" : "text"}
          value={email}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete={isJoining ? "email" : "username"}
          disabled={busy || (isJoining && Boolean(session.identity))}
        />
        {(!session.identity || (busy && password.length > 0)) && (
          <>
            <label htmlFor="fx-password">Password</label>
            <input
              disabled={busy}
              id="fx-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={isJoining ? 6 : 1}
              autoComplete={isJoining ? "new-password" : "current-password"}
            />
          </>
        )}
        {isJoining && (
          <>
            <label className="fx-check">
              <input
                disabled={busy}
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
                disabled={busy}
                type="checkbox"
                required
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              <span>
                I agree to the{" "}
                <a href="/terms" target="_blank" rel="noopener noreferrer">
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
          {busy ? "Please wait…" : isJoining ? "Create account" : "Sign in"}
        </button>
      </form>
      {!session.identity && (
        <>
          <div className="fx-provider-buttons">
            <button
              ref={node => { providerButtons.current.google = node; }}
              type="button"
              className="fx-provider-button fx-provider-google"
              disabled={busy || session.local}
              onClick={() => void continueWithProvider("google")}
            >
              <img src="/web/providers/google-icon.svg" alt="" width={44} height={44} />
              <span>Sign in with Google</span>
            </button>
            <button
              ref={node => { providerButtons.current.apple = node; }}
              type="button"
              className="fx-provider-button fx-provider-apple"
              disabled={busy || session.local}
              onClick={() => void continueWithProvider("apple")}
            >
              <img src="/web/providers/apple-logo-white.png" alt="" width={44} height={44} />
              <span>Sign in with Apple</span>
            </button>
          </div>
          {session.local && (
            <p className="fx-small fx-muted">
              In this local preview, use the demo email and password. Google and
              Apple sign-in are disabled.
            </p>
          )}
        </>
      )}
      {!session.identity && (
        <button
          type="button"
          className="fx-text-button"
          disabled={busy}
          onClick={() => {
            setJoin(!join);
            setError("");
          }}
        >
          {isJoining
            ? "Already have an account? Sign in"
            : "New to Flixie? Create an account"}
        </button>
      )}
      {!isJoining && (
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
          disabled={busy}
          onClick={useDifferentAccount}
        >
          Use a different account
        </button>
      )}
    </div>
  );
}
