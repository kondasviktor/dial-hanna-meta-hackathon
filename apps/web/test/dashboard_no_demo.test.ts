import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Owner decision: the dashboard renders real tenant data or an empty state.
// No fictional businesses, callers, or made-up minute counts in the UI.

const FICTION = /Szalon Viola|Kovács Anna|Nagy Eszter|Gyors Műhely|Hideg-Meleg Szerviz|kitalált|62 \/ 250|188 \/ 250/;

test("dashboard overview contains no fictional content", () => {
  const page = readFileSync(new URL("../app/dashboard/page.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(page, FICTION, "dashboard/page.tsx");
  assert.doesNotMatch(page, /DEMO_ORG/, "no DEMO_ORG");
});

test("dashboard nav has no hardcoded salon fiction", () => {
  const nav = readFileSync(new URL("../app/dashboard/nav.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(nav, FICTION, "dashboard/nav.tsx");
  assert.match(nav, /orgName/, "nav takes orgName prop");
});

test("versions page has no hardcoded Szalon Viola", () => {
  const page = readFileSync(new URL("../app/dashboard/versions/page.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(page, /Szalon Viola/, "versions");
  assert.doesNotMatch(page, /DEMO_ORG/, "versions no DEMO_ORG");
});
