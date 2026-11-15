/** Apple owns the provider window; Firebase still owns the resulting account. */
export const APPLE_SDK_URL = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
export const APPLE_CLIENT_ID = "com.flixie.web";
// Already registered for this Services ID. Popup mode returns by postMessage;
// it does not navigate Flixie through Firebase's Continue to the app helper.
export const APPLE_REDIRECT_URI = "https://flixie-9a8eb.firebaseapp.com/__/auth/handler";

export interface AppleSdk {
  init(config: { clientId: string; scope: string; redirectURI: string; state: string; nonce: string; usePopup: true }): void;
  signIn(): Promise<unknown>;
}
type AppleWindow = Window & { AppleID?: { auth?: AppleSdk } };
function failure(code: string) { return Object.assign(new Error(code), { code }); }
function sdkFrom(window: AppleWindow): AppleSdk | undefined {
  const sdk = window.AppleID?.auth;
  return sdk && typeof sdk.init === "function" && typeof sdk.signIn === "function" ? sdk : undefined;
}
let sdkPromise: Promise<AppleSdk> | undefined;
export function loadAppleSdk(): Promise<AppleSdk> {
  const ready = sdkFrom(window);
  if (ready) return Promise.resolve(ready);
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise<AppleSdk>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = APPLE_SDK_URL;
    script.async = true;
    script.referrerPolicy = "no-referrer";
    const timer = window.setTimeout(() => finish(), 10000);
    function finish() {
      window.clearTimeout(timer);
      script.onload = script.onerror = null;
      const sdk = sdkFrom(window);
      if (sdk) resolve(sdk);
      else { script.remove(); reject(failure("auth/apple-sdk-unavailable")); }
    }
    script.onload = script.onerror = finish;
    document.head.append(script);
  }).catch(error => { sdkPromise = undefined; throw error; });
  return sdkPromise;
}
function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : null;
}
function providerError(error: unknown) {
  const value = record(error);
  const code = String(value?.code ?? value?.error ?? "");
  if (["user_cancelled_authorize", "popup_closed_by_user"].includes(code)) return failure("auth/popup-closed-by-user");
  if (["popup_blocked_by_browser", "popup_blocked"].includes(code)) return failure("auth/popup-blocked");
  return error;
}
export function createAppleSignIn(options: {
  load?: () => Promise<AppleSdk>;
  crypto?: Crypto;
  now?: () => number;
} = {}) {
  const load = options.load ?? loadAppleSdk;
  const clock = options.now ?? Date.now;
  let prepared: { sdk: AppleSdk; rawNonce: string; nonce: string; state: string; at: number } | undefined;
  let preparation: Promise<void> | undefined;
  let active = false;
  async function prepare(): Promise<void> {
    if (prepared && clock() - prepared.at < 5 * 60_000) return;
    if (preparation) return preparation;
    preparation = (async () => {
      const crypto = options.crypto ?? globalThis.crypto;
      const hex = (data: Uint8Array) => Array.from(data, byte => byte.toString(16).padStart(2, "0")).join("");
      const rawNonce = hex(crypto.getRandomValues(new Uint8Array(32)));
      const state = hex(crypto.getRandomValues(new Uint8Array(32)));
      const [sdk, digest] = await Promise.all([load(), crypto.subtle.digest("SHA-256", new TextEncoder().encode(rawNonce))]);
      prepared = { sdk, rawNonce, state, nonce: hex(new Uint8Array(digest)), at: clock() };
    })().finally(() => { preparation = undefined; });
    return preparation;
  }
  async function signIn(exchange: (credential: { idToken: string; rawNonce: string }) => Promise<void>): Promise<void> {
    if (active) throw failure("auth/cancelled-popup-request");
    const attempt = prepared;
    if (!attempt || clock() - attempt.at >= 10 * 60_000) throw failure("auth/apple-not-ready");
    prepared = undefined; // Single use, including cancelled and failed attempts.
    active = true;
    try {
      attempt.sdk.init({ clientId: APPLE_CLIENT_ID, scope: "name email", redirectURI: APPLE_REDIRECT_URI, state: attempt.state, nonce: attempt.nonce, usePopup: true });
      // Keep this before the first await: Safari needs the original user gesture.
      const pending = attempt.sdk.signIn();
      const result = record(await pending);
      const authorization = record(result?.authorization);
      if (authorization?.state !== attempt.state || typeof authorization?.id_token !== "string" || !authorization.id_token || authorization.id_token.length > 20000)
        throw failure("auth/apple-invalid-response");
      await exchange({ idToken: authorization.id_token, rawNonce: attempt.rawNonce });
    } catch (error) { throw providerError(error); }
    finally { active = false; }
  }
  return { prepare, signIn };
}
