import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signOut,
  sendPasswordResetEmail,
  browserLocalPersistence,
  setPersistence,
  type User,
  type Auth,
} from "firebase/auth";
import { FlixieApi, ApiError, type Identity } from "./api";
import { webConfig, type WebConfig } from "./config";
import type { Account, JsonObject } from "./models";

export interface Session {
  user: Account | null;
  identity: User | null;
  loading: boolean;
  error: string;
  api: FlixieApi;
  local: boolean;
  signIn: (name: string, password: string) => Promise<void>;
  join: (email: string, password: string, data: JsonObject) => Promise<void>;
  provider: (name: "google" | "apple") => Promise<void>;
  signOut: () => Promise<void>;
  reset: (email: string) => Promise<void>;
  reloadProfile: () => Promise<void>;
}
export const SessionContext = createContext<Session | null>(null);
export function authMessage(error: unknown, provider?: "google" | "apple"): string {
  const code =
    typeof error === "object" && error && "code" in error
      ? String(error.code)
      : "";
  if (
    [
      "auth/invalid-credential",
      "auth/user-not-found",
      "auth/wrong-password",
      "auth/invalid-login-credentials",
    ].includes(code)
  )
    return provider
      ? `${provider === "apple" ? "Apple" : "Google"} sign-in could not be completed. Please try again.`
      : "Check your email or username and password.";
  if (code === "auth/email-already-in-use")
    return "This email already has an account. Sign in instead.";
  if (code === "auth/weak-password")
    return "Choose a password with at least six characters.";
  if (code === "auth/popup-closed-by-user")
    return "Sign-in was closed. You can try again.";
  if (code === "auth/popup-blocked")
    return "Allow pop-ups for Flixie, then try signing in again.";
  if (code === "auth/account-exists-with-different-credential")
    return "This email already uses another sign-in method. Sign in using that method.";
  if (code === "auth/too-many-requests")
    return "Too many attempts. Wait a moment, then try again.";
  if (
    code === "auth/unauthorized-domain" ||
    code === "auth/operation-not-allowed"
  )
    return "That sign-in option is not available here. Try email and password.";
  if (error instanceof ApiError) return error.message;
  return "We could not sign you in. Please try again.";
}
function firebase(config: WebConfig): Auth | null {
  if (
    !config.firebase.apiKey ||
    !config.firebase.projectId ||
    !config.firebase.appId
  )
    return null;
  const name = config.local ? "flixie-web-local" : "flixie-web";
  const app =
    getApps().find((a) => a.name === name) ??
    initializeApp(config.firebase, name);
  const auth = getAuth(app);
  if (config.local && !auth.emulatorConfig)
    connectAuthEmulator(auth, "http://127.0.0.1:9099", {
      disableWarnings: true,
    });
  return auth;
}
export function AuthProvider({ children }: { children: ReactNode }) {
  const config = useMemo(webConfig, []),
    auth = useMemo(() => firebase(config), [config]);
  const [identity, setIdentity] = useState<User | null>(null),
    [user, setUser] = useState<Account | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const current = useRef<Identity | null>(null),
    generation = useRef(0),
    lastUid = useRef<string | null>(null);
  const api = useMemo(
    () => new FlixieApi(config.apiUrl, () => current.current),
    [config.apiUrl],
  );
  const ensureLocal = async () => {
    if (config.local) {
      const response = await fetch(config.apiUrl + "/healthcheck/local", {
        signal: AbortSignal.timeout(5000),
        cache: "no-store",
      });
      const body = await response.json();
      if (
        body.mode !== "local" ||
        body.firebaseProjectId !== "demo-flixie-local"
      )
        throw new Error("Local services unavailable");
    }
  };
  const reloadProfile = async () => {
    const active = auth?.currentUser;
    if (!active) return;
    const ticket = ++generation.current;
    current.current = {
      uid: active.uid,
      token: (force) => active.getIdToken(force),
    };
    const profile = await api.profile(active.uid);
    if (
      ticket === generation.current &&
      auth?.currentUser?.uid === active.uid
    ) {
      setUser(profile);
      setError("");
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    let mounted = true;
    void setPersistence(auth, browserLocalPersistence).catch(() => {});
    const stop = onIdTokenChanged(auth, (active) => {
      if (!mounted) return;
      const ticket = ++generation.current;
      const changed = lastUid.current !== active?.uid;
      lastUid.current = active?.uid ?? null;
      current.current = active
        ? { uid: active.uid, token: (force) => active.getIdToken(force) }
        : null;
      setIdentity(active);
      setError("");
      if (changed) setUser(null);
      if (!active) {
        setUser(null);
        setLoading(false);
        return;
      }
      if (changed) setLoading(true);
      void api
        .profile(active.uid)
        .then((profile) => {
          if (mounted && ticket === generation.current) setUser(profile);
        })
        .catch((e) => {
          if (mounted && ticket === generation.current)
            setError(
              e instanceof ApiError
                ? e.message
                : "Your profile could not be loaded. Please retry.",
            );
        })
        .finally(() => {
          if (mounted && ticket === generation.current) setLoading(false);
        });
    });
    return () => {
      mounted = false;
      generation.current++;
      current.current = null;
      stop();
    };
  }, [auth, api]);
  const requireAuth = () => {
    if (!auth)
      throw new ApiError(
        "Sign-in is not available right now. Please try again later.",
      );
    return auth;
  };
  const value: Session = {
    user,
    identity,
    loading,
    error,
    api,
    local: config.local,
    reloadProfile,
    signIn: async (name, password) => {
      const sdk = requireAuth();
      await ensureLocal();
      const email = name.includes("@")
        ? name.trim()
        : await api.usernameEmail(
            name.trim(),
            password,
            config.firebase.apiKey,
          );
      await signInWithEmailAndPassword(sdk, email, password);
    },
    join: async (email, password, data) => {
      const sdk = requireAuth();
      await ensureLocal();
      const credential =
        sdk.currentUser ??
        (await createUserWithEmailAndPassword(sdk, email.trim(), password))
          .user;
      current.current = {
        uid: credential.uid,
        token: (force) => credential.getIdToken(force),
      };
      await api.createProfile({
        ...data,
        email: credential.email,
        termsAccepted: true,
      });
      await reloadProfile();
    },
    provider: async (name) => {
      const sdk = requireAuth();
      if (config.local)
        throw new ApiError("Use the local email and password to test sign-in.");
      // Firebase owns the whole exchange, as in the user-verified Apple flow.
      await signInWithPopup(sdk, name === "google"
        ? new GoogleAuthProvider()
        : new OAuthProvider("apple.com"));
    },
    signOut: async () => {
      generation.current++;
      current.current = null;
      setUser(null);
      setIdentity(null);
      if (auth) await signOut(auth);
    },
    reset: async (email) => {
      await ensureLocal();
      await sendPasswordResetEmail(requireAuth(), email.trim());
    },
  };
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("AuthProvider is required");
  return value;
}
