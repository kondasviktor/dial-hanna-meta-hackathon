import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Owner decision: the dashboard renders real tenant data or an empty state.
// No fictional businesses, callers, or made-up minute counts in the UI.

const FICTION = /Szalon Viola|Kovács Anna|Nagy Eszter|Gyors Műhely|Hideg-Meleg Szerviz|kitalált|62 \/ 250|188 \/ 250/;

test("dashboard overview contains no fictional content", () => {
  const page = readFileSync(new URL("../app/dashboard/page.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(page, FICTION, "dashboard/page.tsx");
  assert.doesNotMatch(page, /const DEMO\b/, "no DEMO fallback");
});
