import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash, webcrypto } from "node:crypto";
import { JSDOM } from "jsdom";
import { APPLE_CLIENT_ID, APPLE_REDIRECT_URI, APPLE_SDK_URL, createAppleSignIn, loadAppleSdk, type AppleSdk } from "../src/web/appleSignIn";

const crypto = webcrypto as Crypto;
function fixture() {
  let config: Parameters<AppleSdk["init"]>[0];
  let resolve: (value: unknown) => void;
  let reject: (error: unknown) => void;
  const calls: string[] = [];
  const sdk: AppleSdk = {
    init(value) { config = value; calls.push("init"); },
    signIn() { calls.push("popup"); return new Promise((yes, no) => { resolve = yes; reject = no; }); },
  };
  let time = 0;
  const flow = createAppleSignIn({ crypto, load: async () => sdk, now: () => time });
  const credentials: { idToken: string; rawNonce: string }[] = [];
  return { flow, calls, credentials, config: () => config,
    exchange: async (value: { idToken: string; rawNonce: string }) => { calls.push("exchange"); credentials.push(value); },
    success: () => resolve({ authorization: { id_token: "fictional-apple-token", state: config.state } }),
    response: (value: unknown) => resolve(value), fail: (value: unknown) => reject(value),
    advance: () => { time += 11 * 60_000; },
  };
}
test("Apple opens synchronously from the gesture, uses registered identity and exchanges a nonce-bound credential once", async () => {
  const f = fixture(); await f.flow.prepare();
  const pending = f.flow.signIn(f.exchange);
  assert.deepEqual(f.calls, ["init", "popup"]); // No async work before opening.
  const config = f.config();
  assert.equal(config.clientId, APPLE_CLIENT_ID);
  assert.equal(config.redirectURI, APPLE_REDIRECT_URI);
  assert.equal(config.usePopup, true);
  assert.match(config.nonce, /^[a-f0-9]{64}$/);
  assert.match(config.state, /^[a-f0-9]{64}$/);
  await assert.rejects(f.flow.signIn(f.exchange), { code: "auth/cancelled-popup-request" });
  f.success(); await pending;
  assert.equal(f.credentials.length, 1);
  assert.equal(createHash("sha256").update(f.credentials[0].rawNonce).digest("hex"), config.nonce);
  assert.notEqual(config.state, config.nonce);
  assert.deepEqual(f.calls, ["init", "popup", "exchange"]);
  await assert.rejects(f.flow.signIn(f.exchange), { code: "auth/apple-not-ready" });
});
test("missing token or wrong state never reaches Firebase", async () => {
  for (const invalid of [null, {}, { state: "wrong", id_token: "fictional" }, { state: "correct" }, { state: "correct", id_token: "" }]) {
    const f = fixture(); await f.flow.prepare(); const pending = f.flow.signIn(f.exchange);
    const authorization = invalid && invalid.state === "correct" ? { ...invalid, state: f.config().state } : invalid;
    f.response({ authorization });
    await assert.rejects(pending, { code: "auth/apple-invalid-response" });
    assert.equal(f.credentials.length, 0);
  }
});
test("cancel, blocked popup and Firebase failure allow a fresh, independent retry", async () => {
  for (const [error, expected] of [
    [{ error: "user_cancelled_authorize" }, "auth/popup-closed-by-user"],
    [{ error: "popup_closed_by_user" }, "auth/popup-closed-by-user"],
    [{ error: "popup_blocked_by_browser" }, "auth/popup-blocked"],
  ] as const) {
    const f = fixture(); await f.flow.prepare(); const pending = f.flow.signIn(f.exchange);
    const first = f.config(); f.fail(error); await assert.rejects(pending, { code: expected });
    await f.flow.prepare(); const retry = f.flow.signIn(f.exchange);
    assert.notEqual(f.config().nonce, first.nonce); assert.notEqual(f.config().state, first.state);
    f.success(); await retry; assert.equal(f.credentials.length, 1);
  }
  const f = fixture(); await f.flow.prepare();
  const failed = f.flow.signIn(async () => { throw { code: "auth/account-exists-with-different-credential" }; });
  f.success(); await assert.rejects(failed, { code: "auth/account-exists-with-different-credential" });
  await f.flow.prepare(); const retry = f.flow.signIn(f.exchange); f.success(); await retry;
});
test("unprepared or expired attempts never open a popup; preparing again restores sign-in", async () => {
  const f = fixture(); await assert.rejects(f.flow.signIn(f.exchange), { code: "auth/apple-not-ready" });
  await f.flow.prepare(); f.advance(); await assert.rejects(f.flow.signIn(f.exchange), { code: "auth/apple-not-ready" });
  assert.deepEqual(f.calls, []); await f.flow.prepare();
  const pending = f.flow.signIn(f.exchange); f.success(); await pending;
});
test("the official script loads once, fails cleanly and can be retried without starting authentication", async () => {
  const dom = new JSDOM("<!doctype html><head></head>");
  Object.assign(globalThis, { window: dom.window, document: dom.window.document });
  try {
    const first = loadAppleSdk(); assert.equal(loadAppleSdk(), first);
    let script = dom.window.document.querySelector("script")!;
    assert.equal(script.src, APPLE_SDK_URL);
    script.dispatchEvent(new dom.window.Event("error"));
    await assert.rejects(first, { code: "auth/apple-sdk-unavailable" });
    assert.equal(dom.window.document.querySelectorAll("script").length, 0);
    const retry = loadAppleSdk();
    let called = false;
    const sdk = { init() { called = true; }, async signIn() { called = true; } };
    Object.assign(dom.window, { AppleID: { auth: sdk } });
    script = dom.window.document.querySelector("script")!;
    script.dispatchEvent(new dom.window.Event("load"));
    assert.equal(await retry, sdk); assert.equal(called, false);
  } finally { dom.window.close(); }
});
