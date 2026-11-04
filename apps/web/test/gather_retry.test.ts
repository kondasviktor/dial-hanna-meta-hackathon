import { test } from "node:test";
import assert from "node:assert/strict";
import {
  closesConversation,
  isBareNo,
  missOutcome,
  parseRetry,
} from "../src/lib/gather_retry.ts";

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

// Bare "no / thanks" ends the call only when it answers Hanna's
// anything-else question — never mid-order.
test("bare no closes only after the anything-else question", () => {
  assert.equal(isBareNo("No"), true);
  assert.equal(isBareNo("No, thanks."), true);
  assert.equal(isBareNo("Köszönöm"), true);
  assert.equal(isBareNo("No, I want chocolate instead"), false);
  assert.equal(
    closesConversation("No", "Is there anything else I can help you with?"),
    true,
  );
  assert.equal(
    closesConversation("No", "Should I make it 16 slices?"),
    false,
  );
  assert.equal(closesConversation("No", null), false);
});
