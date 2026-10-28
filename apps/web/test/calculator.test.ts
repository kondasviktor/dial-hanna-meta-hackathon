import { test } from "node:test";
import assert from "node:assert/strict";
import { calculate, formatHuf } from "../src/lib/calculator.ts";

test("calculator scales linearly", () => {
  const r = calculate({ avgJobHuf: 15000, missedPerWeek: 5, payingSharePct: 20 });
  assert.equal(r.jobsPerMonth, 4);
  assert.equal(r.extraRevenueHuf, 60000);
  assert.equal(r.jobsToCoverPlan, 3); // ceil(34900/15000)
});

test("zero misses means zero revenue", () => {
  const r = calculate({ avgJobHuf: 15000, missedPerWeek: 0, payingSharePct: 20 });
  assert.equal(r.extraRevenueHuf, 0);
});

test("HUF formatting", () => {
  assert.equal(formatHuf(34900), "34 900 Ft");
  assert.equal(formatHuf(60000), "60 000 Ft");
});
