import { test } from "node:test";
import assert from "node:assert/strict";
import { readinessScore } from "../src/lib/readiness.ts";

const ok = (id: string, locked = true) => ({ scenarioId: id, pass: true, hardFail: false, locked });
const fail = (id: string, locked = true) => ({ scenarioId: id, pass: false, hardFail: false, locked });

test("perfect run scores 100 and is testable", () => {
  const r = readinessScore([ok("s1"), ok("s2")]);
  assert.equal(r.score, 100);
  assert.equal(r.testable, true);
});

test("hard fail caps at 50", () => {
  const r = readinessScore([ok("s1"), { scenarioId: "s2", pass: true, hardFail: true, locked: true }]);
  assert.equal(r.score, 50);
  assert.deepEqual(r.hardFails, ["s2"]);
  assert.equal(r.testable, false);
});

test("below-80 is not testable", () => {
  const rows = [ok("s1"), fail("s2"), fail("s3"), fail("s4"), fail("s5")];
  const r = readinessScore(rows);
  assert.ok(r.score < 80 && r.testable === false);
});

test("locked scenarios weigh double", () => {
  const rows = [
    fail("locked-fail"), // weight 2
    ok("gen1", false), ok("gen2", false), ok("gen3", false), // weight 1 each
  ];
  const r = readinessScore(rows);
  assert.equal(r.score, 60); // 3/5 weighted
});
