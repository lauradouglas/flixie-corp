import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { act } from "react";
import { SessionContext, type Session } from "../src/web/auth";
import AccountGate from "../src/web/AccountGate";
import AuthForm from "../src/web/AuthForm";
import { FlixieApi } from "../src/web/api";
import type { User } from "firebase/auth";
import { account } from "../src/web/models";

const identity = {
  uid: "fictional-signup",
  email: "signup@example.invalid",
} as User;
const member = account(
  { id: "fictional-member", externalId: identity.uid, username: "film_friend" },
  identity.uid,
);
async function setup(initialJoin = true) {
  const dom = new JSDOM('<!doctype html><div id="test"></div>', {
    url: "http://localhost/app/join",
  });
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    HTMLInputElement: dom.window.HTMLInputElement,
    Event: dom.window.Event,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(dom.window.document.getElementById("test")!);
  const session: Session = {
    identity: null,
    user: null,
    loading: false,
    error: "",
    local: true,
    api: new FlixieApi(
      "http://localhost:3000",
      () => null,
      async () => {
        throw Error("No real network in component tests");
      },
    ),
    signIn: async () => {},
    join: async () => {},
    provider: async () => {},
    signOut: async () => {},
    reset: async () => {},
    reloadProfile: async () => {},
  };
  const render = async (authDialogOpen = false) => {
    await act(async () => {
      root.render(
        <SessionContext.Provider value={{ ...session }}>
          <AccountGate
            initialJoin={initialJoin}
            authDialogOpen={authDialogOpen}
            onComplete={() => {}}
          >
            <p>Member home</p>
          </AccountGate>
          {authDialogOpen && <AuthForm initialJoin onComplete={() => {}} />}
        </SessionContext.Provider>,
      );
    });
  };
  await render();
  const input = (id: string) =>
    dom.window.document.getElementById(id) as HTMLInputElement;
  const type = async (id: string, value: string) => {
    await act(async () => {
      Object.getOwnPropertyDescriptor(
        dom.window.HTMLInputElement.prototype,
        "value",
      )!.set!.call(input(id), value);
      input(id).dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    });
  };
  const checks = () => [
    ...dom.window.document.querySelectorAll<HTMLInputElement>(
      "input[type=checkbox]",
    ),
  ];
  const fill = async () => {
    await type("fx-first-name", "Sam");
    await type("fx-username", "film_friend");
    await type("fx-email", identity.email!);
    await type("fx-password", "FictionalOnly1!");
    await act(async () => {
      checks()[0].click();
      checks()[1].click();
    });
  };
  const submit = async (times = 1) => {
    await act(async () => {
      for (let i = 0; i < times; i++)
        dom.window.document
          .querySelector("form")!
          .dispatchEvent(
            new dom.window.Event("submit", { bubbles: true, cancelable: true }),
          );
    });
  };
  const close = async () => {
    await act(async () => root.unmount());
    dom.window.close();
  };
  return { dom, session, render, input, type, checks, fill, submit, close };
}
function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}


test("email sign-up keeps one filled form and exactly two chosen checkboxes while Firebase and profile creation finish", async () => {
  const t = await setup();
  try {
    await t.fill();
    const form = t.dom.window.document.querySelector("form");
    const first = t.input("fx-first-name");
    const original = t.checks();
    const pending = deferred();
    let calls = 0;
    t.session.join = async (email, password, data) => {
      calls++;
      assert.equal(email, identity.email);
      assert.equal(password, "FictionalOnly1!");
      assert.equal(data.firstName, "Sam");
      assert.equal(data.username, "film_friend");
      assert.equal(data.communitySharing, false);
      assert.equal(data.termsAccepted, true);
      return pending.promise;
    };
    await t.render();
    await t.submit();
    t.session.identity = identity;
    t.session.loading = true;
    await t.render();
    assert.equal(
      t.dom.window.document.querySelector("form"),
      form,
      "Firebase loading must not unmount the active form",
    );
    assert.equal(t.input("fx-first-name"), first);
    assert.equal(t.input("fx-first-name").value, "Sam");
    assert.equal(t.input("fx-username").value, "film_friend");
    assert.equal(t.checks().length, 2);
    assert.equal(t.checks()[0], original[0]);
    assert.equal(t.checks()[1], original[1]);
    assert.equal(t.checks()[0].checked, false);
    assert.equal(t.checks()[1].checked, true);
    t.session.loading = false;
    await t.render();
    assert.equal(t.dom.window.document.querySelectorAll("form").length, 1);
    assert.equal(t.checks().length, 2);
    assert.equal(
      t.dom.window.document.querySelector<HTMLButtonElement>(
        "button[type=submit]",
      )!.disabled,
      true,
    );
    assert.equal(calls, 1);
    t.session.user = member;
    await t.render();
    await act(async () => pending.resolve());
    assert.equal(t.dom.window.document.body.textContent, "Member home");
    assert.equal(
      t.dom.window.document.querySelectorAll("input[type=checkbox]").length,
      0,
    );
  } finally {
    await t.close();
  }
});
test("an immediate repeated submit creates one request; a failed signup preserves the draft for one explicit retry", async () => {
  const t = await setup();
  try {
    await t.fill();
    const pending = deferred();
    let calls = 0;
    t.session.join = async () => {
      calls++;
      return pending.promise;
    };
    await t.render();
    await t.submit(2);
    assert.equal(calls, 1);
    t.session.identity = identity;
    t.session.loading = true;
    await t.render();
    t.session.loading = false;
    await t.render();
    await act(async () => pending.reject(Error("Temporary problem")));
    assert.equal(t.input("fx-first-name").value, "Sam");
    assert.equal(t.input("fx-username").value, "film_friend");
    assert.equal(t.checks().length, 2);
    assert.equal(t.checks()[0].checked, false);
    assert.equal(t.checks()[1].checked, true);
    assert.equal(
      t.dom.window.document.querySelector<HTMLButtonElement>(
        "button[type=submit]",
      )!.disabled,
      false,
    );
    t.session.join = async () => {
      calls++;
    };
    await t.render();
    await t.submit();
    assert.equal(calls, 2);
  } finally {
    await t.close();
  }
});

test("switching to a different account clears the previous profile draft and Terms choice", async () => {
  const t = await setup();
  try {
    await t.fill();
    t.session.identity = identity;
    t.session.signOut = async () => {
      t.session.identity = null;
    };
    await t.render();
    await act(async () => {
      [...t.dom.window.document.querySelectorAll("button")]
        .find((b) => b.textContent === "Use a different account")!
        .click();
    });
    await t.render();
    await act(async () => {
      [...t.dom.window.document.querySelectorAll("button")]
        .find((b) => b.textContent === "New to Flixie? Create an account")!
        .click();
    });
    assert.equal(t.input("fx-first-name").value, "");
    assert.equal(t.input("fx-username").value, "");
    assert.equal(t.input("fx-email").value, "");
    assert.equal(t.input("fx-password").value, "");
    assert.equal(t.checks().length, 2);
    assert.equal(t.checks()[1].checked, false);
  } finally {
    await t.close();
  }
});

test("existing-account email sign-in never flashes registration checkboxes during the profile lookup", async () => {
  const t = await setup(false);
  try {
    await t.type("fx-email", identity.email!);
    await t.type("fx-password", "FictionalOnly1!");
    const pending = deferred();
    t.session.signIn = () => pending.promise;
    await t.render();
    await t.submit();
    t.session.identity = identity;
    t.session.loading = true;
    await t.render();
    assert.equal(t.checks().length, 0);
    assert.equal(t.input("fx-first-name"), null);
    assert.equal(t.dom.window.document.querySelectorAll("form").length, 1);
    t.session.user = member;
    t.session.loading = false;
    await t.render();
    await act(async () => pending.resolve());
    assert.equal(t.dom.window.document.body.textContent, "Member home");
  } finally {
    await t.close();
  }
});

test("a pending login dialog and an auth page never render two signup forms or duplicate checkbox controls", async () => {
  const t = await setup();
  try {
    await t.render(true);
    const document = t.dom.window.document;
    assert.equal(document.querySelectorAll(".fx-auth form").length, 1);
    assert.equal(document.querySelectorAll("input[type=checkbox]").length, 2);
    const ids = [...document.querySelectorAll("[id]")].map(
      (element) => element.id,
    );
    assert.equal(new Set(ids).size, ids.length);
    await t.render(false);
    assert.equal(document.querySelectorAll(".fx-auth form").length, 1);
    assert.equal(document.querySelectorAll("input[type=checkbox]").length, 2);
  } finally {
    await t.close();
  }
});

test('Apple and Google keep one branded waiting screen and restore the form after a closed provider window', async () => {
  for (const provider of ['apple','google'] as const) {
    const t=await setup(false);
    try {
      t.session.local=false;
      const pending=deferred(), calls:string[]=[];
      t.session.provider=name=>{calls.push(name);return pending.promise;};
      await t.render();
      await t.type('fx-email','draft@example.invalid');
      const label=provider==='apple'?'Apple':'Google';
      const button=[...t.dom.window.document.querySelectorAll('button')].find(b=>b.textContent===`Sign in with ${label}`)!;
      await act(async()=>button.click());
      const status=t.dom.window.document.querySelector('[role=status]')!;
      assert(status.textContent?.includes(`Finish signing in with ${label}`));
      assert.equal(status.querySelector('img')?.getAttribute('src'),'/web/flixie-f.png');
      assert.equal(t.dom.window.document.querySelectorAll('form').length,0);
      assert.equal(t.dom.window.document.querySelectorAll('.fx-auth').length,1);
      assert.deepEqual(calls,[provider]);
      await act(async()=>pending.reject(Object.assign(new Error('Closed'),{code:'auth/popup-closed-by-user'})));
      assert.equal(t.dom.window.document.querySelectorAll('form').length,1);
      assert.equal(t.input('fx-email').value,'draft@example.invalid');
      assert(t.dom.window.document.body.textContent?.includes('Sign-in was closed. You can try again.'));
      assert.equal(t.checks().length,0);
      assert.equal(t.dom.window.document.activeElement?.textContent,`Sign in with ${label}`);
    } finally { await t.close(); }
  }
});

test('provider success hands off to the branded profile loading state without flashing signup fields for an existing member', async () => {
  const t=await setup(false);
  try {
    t.session.local=false;
    const pending=deferred();t.session.provider=()=>pending.promise;
    await t.render();
    await act(async()=>[...t.dom.window.document.querySelectorAll('button')].find(b=>b.textContent==='Sign in with Apple')!.click());
    t.session.identity=identity;t.session.loading=true;
    await t.render();
    await act(async()=>pending.resolve());
    assert(t.dom.window.document.body.textContent?.includes('Opening your Flixie account…'));
    assert.equal(t.dom.window.document.querySelectorAll('form').length,0);
    assert.equal(t.checks().length,0);
    t.session.user=member;t.session.loading=false;
    await t.render();
    assert.equal(t.dom.window.document.body.textContent,'Member home');
  } finally { await t.close(); }
});
