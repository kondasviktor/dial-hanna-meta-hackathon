import { test } from "node:test";
import assert from "node:assert/strict";
import { orgChangeTarget } from "../src/lib/dash_lang.ts";

// Creating/selecting an org must keep the owner in the same dashboard, in
// the same language — never bounce to the HU landing page.
test("org change stays in the shell and keeps EN", () => {
  assert.equal(orgChangeTarget("/dashboard/kb", "?lang=en"), "/dashboard/kb?lang=en");
  assert.equal(orgChangeTarget("/dashboard", "?lang=en"), "/dashboard?lang=en");
  assert.equal(orgChangeTarget("/create-org", ""), "/create-org");
  assert.equal(orgChangeTarget("/", ""), "/dashboard");
  assert.equal(orgChangeTarget("/en", ""), "/dashboard?lang=en");
  assert.equal(orgChangeTarget("/", "?lang=en"), "/dashboard?lang=en");
});
