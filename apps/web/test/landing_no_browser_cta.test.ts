import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { landing } from "../src/i18n/landing.ts";

// Owner decision: no user-placed browser calls (operator bears the cost).
// The /demo route and every "call Hanna from the browser" entry point stay
// removed; the trial covers real forwarded calls only.

test("no browser-call CTAs or trial wording in HU+EN copy", () => {
  for (const lang of ["hu", "en"] as const) {
    const d = landing[lang];
    assert.match(d.hero.secondary, /hogyan|how/i, `${lang} secondary must point at How-it-works`);
    assert.doesNotMatch(d.hero.secondary, /böngésző|browser/i, `${lang} secondary`);
    assert.doesNotMatch(d.trialBody, /böngésző|browser/i, `${lang} trialBody`);
  }
});

test("demo route and middleware entry are gone", () => {
  const demoDir = new URL("../app/demo", import.meta.url);
  assert.equal(existsSync(demoDir), false, "app/demo route must not exist");
  const middleware = readFileSync(new URL("../middleware.ts", import.meta.url), "utf8");
  assert.doesNotMatch(middleware, /"\/demo"/, "middleware must not list /demo");
});

test("dormant browser-call plumbing is deleted", () => {
  const tenants = readFileSync(new URL("../src/lib/tenants.ts", import.meta.url), "utf8");
  assert.doesNotMatch(tenants, /resolveByToken|demoAllowed|BrowserToken|expired_token/, "tenants.ts");
  const example = readFileSync(new URL("../../../.env.example", import.meta.url), "utf8");
  assert.doesNotMatch(example, /BROWSER_CALL_JWT_SECRET/, ".env.example");
  const seed = readFileSync(new URL("../seed/demo_calls.json", import.meta.url), "utf8");
  assert.doesNotMatch(seed, /"channel": "browser"/, "seed channels");
});
