import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TRIAL_DAYS, TRIAL_MINUTES, isTrialPlan, seatsForPlan,
  trialEndsAt, trialActive,
} from "../src/lib/trial.ts";

test("trial window is 14 days from the plan pick", () => {
  assert.equal(TRIAL_DAYS, 14);
  assert.equal(TRIAL_MINUTES, 40);
  const start = new Date("2026-10-29T12:00:00Z");
  assert.equal(trialEndsAt(start).toISOString(), "2026-11-12T12:00:00.000Z");
  assert.equal(trialActive(start, new Date("2026-11-11T23:59:59Z")), true);
  assert.equal(trialActive(start, new Date("2026-11-12T12:00:01Z")), false);
  assert.equal(trialActive(null, new Date()), false);
});

test("plan allowlist and seats per plan", () => {
  assert.equal(isTrialPlan("pro"), true);
  assert.equal(isTrialPlan("enterprise"), false);
  assert.equal(seatsForPlan("essential"), 1);
  assert.equal(seatsForPlan("pro"), 3);
  assert.equal(seatsForPlan("business"), 5);
  assert.equal(seatsForPlan("unknown"), 1);
});
