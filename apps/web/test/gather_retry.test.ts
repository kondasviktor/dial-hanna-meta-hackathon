import { test } from "node:test";
import assert from "node:assert/strict";
import { missOutcome, parseRetry } from "../src/lib/gather_retry.ts";

// A missed turn must ask again, never hang up — only the 3rd miss in a row
// may say goodbye. This is the regression test for mid-order disconnects.
test("missed turns retry twice before goodbye", () => {
  assert.equal(parseRetry(null), 1);
  assert.equal(parseRetry("abc"), 1);
  assert.equal(parseRetry("1"), 1);
  assert.equal(parseRetry("2"), 2);
  assert.equal(parseRetry("99"), 3);
  assert.equal(missOutcome(1), "retry");
  assert.equal(missOutcome(2), "retry");
  assert.equal(missOutcome(3), "bye");
});
