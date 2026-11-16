import { after, test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import { JSDOM } from "jsdom";
import { act, createElement } from "react";
import { FlixieApi } from "../src/web/api";
import { account, film } from "../src/web/models";
import { pickResults, type PickPreferences } from "../src/web/pickForUs";
import type { Session } from "../src/web/auth";

// Bundle the real flows, omitting CSS only in this headless behavioral test.
const output = resolve(`.impeccable/review/mobile-tasks-${process.pid}.mjs`);
await mkdir(resolve(".impeccable/review"), { recursive: true });
const compiled = await build({ stdin: { contents: `export {Sheet} from './src/web/components';export {WatchLog} from './src/web/WatchLog';export {default as Picker} from './src/web/PickForUsDialog';export {SessionContext} from './src/web/auth';`, resolveDir: process.cwd(), loader: "tsx" }, bundle: true, write: false, format: "esm", platform: "node", packages: "external", jsx: "automatic", loader: { ".css": "empty" }, define: { "import.meta.env": "{}" } });
await writeFile(output, compiled.outputFiles[0].contents);
const runtime = await import(pathToFileURL(output).href);
after(() => unlink(output));
const identity = { uid: "fictional-mobile", token: async () => "fixture-token" };
const user = account({ id: "fictional-owner", externalId: identity.uid, username: "preview" }, identity.uid);
const title = film({ id: 348, title: "Alien", releaseDate: "1979-05-25" });

async function setup(api: FlixieApi) {
  const dom = new JSDOM('<!doctype html><button id="opener">Open task</button><div id="root"></div>', { url: "http://127.0.0.1/app" });
  const media = Object.assign(new dom.window.EventTarget(), { matches: true });
  const viewport = Object.assign(new dom.window.EventTarget(), { height: 840, offsetTop: 0, scale: 1 });
  Object.defineProperty(dom.window, "matchMedia", { value: () => media });
  Object.defineProperty(dom.window, "visualViewport", { value: viewport });
  dom.window.HTMLElement.prototype.scrollTo = () => {};
  dom.window.HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  dom.window.HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, HTMLInputElement: dom.window.HTMLInputElement, Event: dom.window.Event, IS_REACT_ACT_ENVIRONMENT: true });
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(dom.window.document.getElementById("root")!);
  const session: Session = { user, identity: null, api, loading: false, error: "", local: true, signIn: async () => {}, join: async () => {}, provider: async () => {}, signOut: async () => {}, reset: async () => {}, reloadProfile: async () => {} };
  dom.window.document.body.style.overflow = "auto";
  dom.window.document.getElementById("opener")!.focus();
  return { dom, media, viewport,
    button: (text: string) => [...dom.window.document.querySelectorAll("button")].find(b => b.textContent?.trim() === text)!,
    dialog: () => dom.window.document.querySelector("dialog")!,
    render: async (content: React.ReactNode) => { await act(async () => root.render(createElement(runtime.SessionContext.Provider, { value: session }, content))); },
    resize: async () => { await act(async () => viewport.dispatchEvent(new dom.window.Event("resize"))); },
    type: async (id: string, value: string) => { await act(async () => {
      const input = dom.window.document.getElementById(id)!;
      const prototype = input.tagName === "TEXTAREA" ? dom.window.HTMLTextAreaElement.prototype : dom.window.HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(prototype, "value")!.set!.call(input, value);
      input.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    }); },
    close: async () => { await act(async () => root.unmount()); assert.equal(dom.window.document.body.style.overflow, "auto"); assert.equal(dom.window.document.activeElement?.id, "opener"); dom.window.close(); },
  };
}
const noNetwork = () => new FlixieApi("http://127.0.0.1:3000", () => identity, async () => { throw Error("No network expected"); });

test('dialog padding preserves a draft, backdrop dismisses it, and stacked tasks have unique accessible labels',async()=>{
  const t=await setup(noNetwork());let closes=0;
  const content=(dismissible=true)=>createElement('div',{},
    createElement(runtime.Sheet,{title:'First task',description:'First description',dismissible,onClose(){closes++;}},'Draft'),
    createElement(runtime.Sheet,{title:'Second task',description:'Second description',onClose(){}},'Other draft'));
  try{
    await t.render(content());
    const dialogs=[...t.dom.window.document.querySelectorAll('dialog')];
    assert.notEqual(dialogs[0].getAttribute('aria-labelledby'),dialogs[1].getAttribute('aria-labelledby'));
    for(const dialog of dialogs){
      assert(dialog.contains(t.dom.window.document.getElementById(dialog.getAttribute('aria-labelledby')!)));
      assert(dialog.contains(t.dom.window.document.getElementById(dialog.getAttribute('aria-describedby')!)));
    }
    const dialog=dialogs[0];dialog.getBoundingClientRect=()=>({left:20,right:300,top:40,bottom:500,width:280,height:460,x:20,y:40,toJSON(){}});
    const click=async(x:number,y:number)=>act(async()=>dialog.dispatchEvent(new t.dom.window.MouseEvent('click',{bubbles:true,clientX:x,clientY:y})));
    await click(25,45);assert.equal(closes,0);
    await click(10,45);assert.equal(closes,1);
    await t.render(content(false));await click(10,45);assert.equal(closes,1,'busy tasks cannot be dismissed');
  }finally{await t.close();}
});

test("mobile task follows keyboard area, clears sizing for desktop/zoom and removes listeners on close", async () => {
  const t = await setup(noNetwork());
  let closed = false;
  try {
    await t.render(createElement(runtime.Sheet, { title: "Task", presentation: "modal", mobileFullScreen: true, onClose() {} }, "Content"));
    const dialog = t.dialog();
    assert.equal(dialog.style.getPropertyValue("--fx-task-height"), "840px");
    t.viewport.height = 360; t.viewport.offsetTop = 12; await t.resize();
    assert.equal(dialog.style.getPropertyValue("--fx-task-height"), "360px");
    assert.equal(dialog.style.getPropertyValue("--fx-task-top"), "12px");
    t.viewport.scale = 2; await t.resize(); assert.equal(dialog.style.getPropertyValue("--fx-task-height"), "");
    t.viewport.scale = 1; t.media.matches = false;
    t.media.dispatchEvent(new t.dom.window.Event("change"));
    assert.equal(dialog.style.getPropertyValue("--fx-task-height"), "");
    t.media.matches = true; t.media.dispatchEvent(new t.dom.window.Event("change"));
    await t.close();
    closed = true;
    t.viewport.height = 500; t.viewport.dispatchEvent(new t.dom.window.Event("resize"));
    assert.equal(dialog.style.getPropertyValue("--fx-task-height"), "");
  } finally { if (!closed) await t.close(); }
});
test("rating/review draft survives keyboard resizing and saves one watch with its linked review", async () => {
  const writes: { url: string; body: Record<string, unknown> }[] = [];
  const api = new FlixieApi("http://127.0.0.1:3000", () => identity, async (url, options) => {
    writes.push({ url: String(url), body: JSON.parse(String(options?.body)) });
    return new Response(JSON.stringify({ id: writes.length === 1 ? "fictional-watch" : "fictional-review" }), { status: 201, headers: { "Content-Type": "application/json" } });
  });
  const t = await setup(api); let saved = false;
  try {
    await t.render(createElement(runtime.WatchLog, { film: title, onClose() {}, onSaved(review: boolean) { saved = review; } }));
    await act(async () => (t.dom.window.document.getElementById("fx-rating-8") as HTMLInputElement).click());
    await act(async () => t.dom.window.document.getElementById("fx-recommend-yes")!.click());
    await t.type("fx-review-title", "A fictional favourite"); await t.type("fx-review-body", "A fictional no-spoiler review.");
    t.viewport.height = 360; await t.resize();
    assert.equal((t.dom.window.document.getElementById("fx-review-body") as HTMLTextAreaElement).value, "A fictional no-spoiler review.");
    await act(async () => t.button("Save watch & review").click());
    assert.equal(saved, true); assert.equal(writes.length, 2);
    assert.equal((writes[1].body.review as Record<string, unknown>).watchEntryId, "fictional-watch");
    assert.equal((writes[1].body.review as Record<string, unknown>).rating, 8);
  } finally { await t.close(); }
});
test("picker keeps chosen mood/time through resizing and opens the returned film", async () => {
  let preferences: PickPreferences | undefined;
  class FixtureApi extends FlixieApi {
    async profileFriends() { return []; } async pickerGroups() { return []; } async savedProviders() { return []; }
    async pickForUs(_uid: string, value: PickPreferences) { preferences = value; return pickResults({ choices: [{ id: 348, title: "Alien", reasonDetails: [{ text: "Fictional fixture pick" }] }] }); }
  }
  const t = await setup(new FixtureApi("http://127.0.0.1:3000", () => identity)); let chosen = 0;
  try {
    await t.render(createElement(runtime.Picker, { onClose() {}, onChoose(value: {id:number}) { chosen = value.id; }, onPlanSaved() {}, onViewPlans() {} }));
    await act(async () => t.button("Get hooked").click()); await act(async () => t.button("Continue").click());
    await act(async () => t.button("2 hours").click());
    t.viewport.height = 360; await t.resize();
    await act(async () => t.button("Find my film").click());
    assert.equal(preferences?.mood, "hooked"); assert.equal(preferences?.maxMinutes, 120);
    await act(async () => t.button("View film").click()); assert.equal(chosen, 348);
  } finally { await t.close(); }
});
