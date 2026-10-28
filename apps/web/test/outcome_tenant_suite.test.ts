import { test } from "node:test";
import assert from "node:assert/strict";
import { validateOutcome, outcomeConsistent } from "../src/lib/outcomes.ts";
import { resolveByNumber, resolveByToken, demoAllowed } from "../src/lib/tenants.ts";
import { runSuite, LOCKED_SCENARIOS } from "../src/lib/testsuite.ts";

const goodOutcome = {
  intent: "book",
  outcome: "booked",
  next_action: { type: "confirm_booking", due_by: null, summary_hu: "Visszaigazolás", summary_en: "Confirm" },
  caller: { name: "Kovács Anna", phone: "+36301234567", language: "hu" },
  booking_id: "bk_1",
  knowledge_gap_questions: [],
  sentiment: "positive",
  confidence: 0.9,
};

test("valid outcome passes; junk fails with reasons", () => {
  assert.equal(validateOutcome(goodOutcome).ok, true);
  const bad = validateOutcome({ ...goodOutcome, intent: "teleport", confidence: 7 });
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => e.startsWith("bad-intent")));
  assert.ok(bad.errors.includes("bad-confidence"));
});

test("consistency: booked needs booking id, gap needs question+action", () => {
  assert.deepEqual(outcomeConsistent({ ...goodOutcome, booking_id: null }), ["booked-without-booking-id"]);
  const gap = {
    ...goodOutcome, outcome: "knowledge_gap", booking_id: null,
    knowledge_gap_questions: [] as string[],
    next_action: { type: "none", due_by: null, summary_hu: "x", summary_en: "y" },
  };
  assert.deepEqual(outcomeConsistent(gap), ["gap-without-question", "gap-needs-approve-faq-action"]);
});

test("unknown number never resolves to a tenant", () => {
  const bindings = [{ e164: "+3612345678", orgId: "salon", liveVersionId: "v9" }];
  const hit = resolveByNumber("+36 1 234 5678", bindings);
  assert.equal(hit.kind, "tenant");
  assert.equal(resolveByNumber("+3699999999", bindings).kind, "unknown_number");
});

test("browser token expiry enforced", () => {
  const now = 1_000_000;
  assert.equal(resolveByToken({ orgId: "o", agentVersionId: "draft1", expiresAt: now + 600 }, now).kind, "tenant");
  assert.equal(resolveByToken({ orgId: "o", agentVersionId: "draft1", expiresAt: now - 1 }, now).kind, "expired_token");
});

test("demo rate limits", () => {
  assert.equal(demoAllowed(3, 4), true);
  assert.equal(demoAllowed(10, 1), false);
  assert.equal(demoAllowed(0, 6), false);
});

test("suite runs all 10 locked scenarios with mocks", async () => {
  const r = await runSuite(
    LOCKED_SCENARIOS,
    async (_h, s) => [
      { speaker: "caller", text: s.callerGoal },
      { speaker: "agent", text: "Megnézem." },
    ],
    async (_t, s) => ({ pass: s.id !== "angry", hardFail: false }),
  );
  assert.equal(r.results.length, 10);
  assert.ok(r.score < 100 && r.score > 0);
});

test("suite hard fail caps score via readiness", async () => {
  const r = await runSuite(
    LOCKED_SCENARIOS.slice(0, 2),
    async () => [{ speaker: "agent", text: "kamu ár: 1 Ft" }],
    async () => ({ pass: false, hardFail: true }),
  );
  assert.ok(r.score <= 50 && r.testable === false);
});

test("suite caps transcript at 10 turns each", async () => {
  const long = Array.from({ length: 30 }, (_, i) => ({
    speaker: (i % 2 === 0 ? "caller" : "agent") as "caller" | "agent",
    text: `t${i}`,
  }));
  const r = await runSuite(
    LOCKED_SCENARIOS.slice(0, 1),
    async () => long,
    async () => ({ pass: true, hardFail: false }),
  );
  assert.equal(r.transcripts["hours"].length, 20);
});
