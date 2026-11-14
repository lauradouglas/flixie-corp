export interface WebConfig {
  apiUrl: string;
  local: boolean;
  firebase: {
    apiKey: string;
    appId: string;
    projectId: string;
    authDomain: string;
  };
}
export function makeConfig(
  env: Record<string, unknown>,
  hostname: string,
): WebConfig {
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(hostname);
  const local = env.DEV === true || env.MODE === "local";
  if (local && !loopback)
    throw new Error("Local Flixie must run on this computer.");
  const apiUrl = String(
    env.VITE_FLIXIE_API_URL ||
      (local
        ? "http://127.0.0.1:3000"
        : "https://flixie-api-fmcehvaecwdheccm.northeurope-01.azurewebsites.net"),
  ).replace(/\/$/, "");
  const api = new URL(apiUrl);
  if (local && !["localhost", "127.0.0.1", "[::1]"].includes(api.hostname))
    throw new Error("Local Flixie requires the local backend.");
  if (!local && api.protocol !== "https:")
    throw new Error("Flixie requires a secure backend connection.");
  return {
    apiUrl,
    local,
    firebase: local
      ? {
          apiKey: "AIzaSyFlixieLocalDevelopment00000000000",
          appId: "1:123456789:web:flixie-local",
          projectId: "demo-flixie-local",
          authDomain: "demo-flixie-local.firebaseapp.com",
        }
      : {
          apiKey: String(env.VITE_FIREBASE_API_KEY || ""),
          appId: String(env.VITE_FIREBASE_APP_ID || ""),
          projectId: String(env.VITE_FIREBASE_PROJECT_ID || ""),
          authDomain: String(env.VITE_FIREBASE_AUTH_DOMAIN || ""),
        },
  };
}
export const webConfig = (): WebConfig =>
  makeConfig(import.meta.env, window.location.hostname);
