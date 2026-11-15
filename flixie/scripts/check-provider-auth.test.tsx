import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import { JSDOM } from "jsdom";
import { act, createElement } from "react";

// Exercise the real AuthProvider and AccountGate, substituting only Firebase's
// network boundary. No real account, token, popup or profile request is used.
const firebaseBoundary = `
export const control={calls:[],pending:[],listeners:new Set()};
const auth={currentUser:null};
export const getAuth=()=>auth;
export function onIdTokenChanged(_,listener){control.listeners.add(listener);queueMicrotask(()=>listener(auth.currentUser));return()=>control.listeners.delete(listener);}
export const browserLocalPersistence={};
export const setPersistence=async()=>{};
export const connectAuthEmulator=()=>{};
export class OAuthProvider{constructor(id){this.providerId=id;}}
export class GoogleAuthProvider{providerId='google.com';}
export function signInWithPopup(_,provider){control.calls.push(provider.providerId);return new Promise((resolve,reject)=>control.pending.push({
complete(){const user={uid:'fictional-provider',email:'film@example.invalid',getIdToken:async()=> 'fictional-token'};auth.currentUser=user;control.listeners.forEach(fn=>fn(user));resolve({user});},reject}));}
export const signOut=async()=>{auth.currentUser=null;control.listeners.forEach(fn=>fn(null));};
export const sendPasswordResetEmail=async()=>{};
export const signInWithEmailAndPassword=async()=>{throw Error('Not part of provider fixture');};
export const createUserWithEmailAndPassword=async()=>{throw Error('Must not create an email account');};
`;
let sequence = 0;
async function setup(newMember = false) {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', { url: "https://www.flixie.co.uk/app/sign-in" });
  let profileCalls = 0;
  const originalFetch = globalThis.fetch;
  Object.assign(globalThis, { window: dom.window, document: dom.window.document,
    HTMLElement: dom.window.HTMLElement, HTMLInputElement: dom.window.HTMLInputElement,
    Event: dom.window.Event, IS_REACT_ACT_ENVIRONMENT: true,
    fetch: async (url: string, options: RequestInit) => {
      profileCalls++;
      assert.match(String(url), /\/users\/external-id\/fictional-provider\?profileOnly=true$/);
      assert.equal(new Headers(options.headers).get("Authorization"), "Bearer fictional-token");
      return new Response(JSON.stringify(newMember ? {} : { id: "fictional-existing", externalId: "fictional-provider", username: "film_friend" }), { status: newMember ? 404 : 200, headers: { "Content-Type": "application/json" } });
    },
  });
  const output = resolve(`.impeccable/review/provider-auth-${process.pid}-${sequence++}.mjs`);
  await mkdir(resolve(".impeccable/review"), { recursive: true });
  const result = await build({
    stdin: { contents: `export {AuthProvider,useSession} from './src/web/auth'; export {default as AccountGate} from './src/web/AccountGate'; export {control} from 'firebase/auth';`, resolveDir: process.cwd(), loader: "tsx" },
    bundle: true, write: false, format: "esm", platform: "node", packages: "external", jsx: "automatic",
    define: { "import.meta.env": "{}" },
    plugins: [{ name: "fictional-firebase-boundary", setup(plugin) {
      plugin.onResolve({ filter: /^firebase\/(auth|app)$/ }, args => ({ path: args.path, namespace: "fictional-firebase" }));
      plugin.onLoad({ filter: /.*/, namespace: "fictional-firebase" }, args => ({ contents: args.path === "firebase/auth" ? firebaseBoundary : `export const getApps=()=>[{name:'flixie-web'}]; export const initializeApp=()=>({}); export const getApp=()=>({});`, loader: "js" }));
    } }],
  });
  await writeFile(output, result.outputFiles[0].contents);
  const runtime = await import(pathToFileURL(output).href);
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(dom.window.document.getElementById("root")!);
  function Member() { const {user,identity} = runtime.useSession(); return createElement("p", null, `Member home: ${user?.id}/${identity?.uid}`); }
  await act(async () => root.render(createElement(runtime.AuthProvider, null,
    createElement(runtime.AccountGate, { initialJoin: false, onComplete() {} }, createElement(Member)))));
  const button = (label: string) => [...dom.window.document.querySelectorAll("button")].find(node => node.textContent?.trim() === label)!;
  return { dom, control: runtime.control, button, profileCalls: () => profileCalls,
    async close() { await act(async () => root.unmount()); dom.window.close(); globalThis.fetch = originalFetch; await unlink(output); } };
}
test("Apple and Google use Firebase's complete provider exchange and restore the same existing member", async () => {
  for (const [label, id] of [["Apple", "apple.com"], ["Google", "google.com"]]) {
    const t = await setup();
    try {
      const button = t.button(`Sign in with ${label}`);
      await act(async () => { button.click(); button.click(); });
      assert.deepEqual(t.control.calls, [id]);
      assert.match(t.dom.window.document.body.textContent!, new RegExp(`Finish signing in with ${label}`));
      assert.equal(t.dom.window.document.querySelectorAll("form").length, 0);
      await act(async () => t.control.pending[0].complete());
      assert.match(t.dom.window.document.body.textContent!, /Member home: fictional-existing\/fictional-provider/);
      assert.equal(t.dom.window.document.querySelectorAll("input[type=checkbox]").length, 0);
      assert.equal(t.profileCalls(), 1);
      assert.equal(t.dom.window.document.querySelectorAll('script[src*="appleid"]').length, 0);
    } finally { await t.close(); }
  }
});
test("a closed Firebase Apple window restores one sign-in form and initiating button focus", async () => {
  const t = await setup();
  try {
    await act(async () => t.button("Sign in with Apple").click());
    await act(async () => t.control.pending[0].reject({ code: "auth/popup-closed-by-user" }));
    assert.match(t.dom.window.document.body.textContent!, /Sign-in was closed/);
    assert.equal(t.dom.window.document.querySelectorAll("form").length, 1);
    assert.equal(t.dom.window.document.activeElement?.textContent?.trim(), "Sign in with Apple");
    assert.equal(t.profileCalls(), 0);
  } finally { await t.close(); }
});
test("an Apple credential error stays on one form without asking for an email password", async () => {
  const t = await setup();
  try {
    await act(async () => t.button("Sign in with Apple").click());
    await act(async () => t.control.pending[0].reject({ code: "auth/invalid-credential" }));
    assert.match(t.dom.window.document.body.textContent!, /Apple sign-in could not be completed/);
    assert.doesNotMatch(t.dom.window.document.body.textContent!, /Check your email or username and password/);
    assert.equal(t.dom.window.document.querySelectorAll("form").length, 1);
  } finally { await t.close(); }
});
test("an Apple identity without a Flixie profile requires explicit setup and unchecked Terms", async () => {
  const t = await setup(true);
  try {
    await act(async () => t.button("Sign in with Apple").click());
    await act(async () => t.control.pending[0].complete());
    assert.match(t.dom.window.document.body.textContent!, /Make Flixie yours/);
    const checks = t.dom.window.document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
    assert.equal(checks.length, 2); assert.equal(checks[1].checked, false);
    assert.equal(t.dom.window.document.querySelectorAll("form").length, 1);
  } finally { await t.close(); }
});
