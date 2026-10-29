import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { landing, waitlistHref } from "../src/i18n/landing.ts";

test("CTAs are waitlist, not free trial start", () => {
  for (const lang of ["hu", "en"] as const) {
    const d = landing[lang];
    assert.match(d.hero.primary, /várólist|waitlist/i, `${lang} hero`);
    assert.doesNotMatch(d.hero.primary, /ingyen kipróbál|try it free/i, `${lang} hero`);
    assert.match(d.finalTitle, /Ne veszíts|Stop losing/i, `${lang} final`);
    assert.doesNotMatch(d.finalTitle, /Hívd fel Hannát|Call Hanna and hear/i, `${lang} final`);
  }
});

test("waitlistHref builds query", () => {
  assert.equal(waitlistHref("hu"), "/waitlist");
  assert.equal(waitlistHref("en", "Pro"), "/waitlist?lang=en&plan=pro");
});

test("no Claude attribution comment in landing i18n", () => {
  const src = readFileSync(new URL("../src/i18n/landing.ts", import.meta.url), "utf8");
  assert.doesNotMatch(src, /Source: Claude/, "attribution scrub");
});
