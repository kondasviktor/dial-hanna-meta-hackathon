import { test } from "node:test";
import assert from "node:assert/strict";
import { forwardingCodes, DEFAULT_CONDITIONS } from "../src/lib/mmi.ts";
import { signToolCall, verifyToolCall, bookingIdempotencyKey } from "../src/lib/security.ts";

test("MMI codes embed the DID", () => {
  const c = forwardingCodes("busy", "+3612345678", "telekom");
  assert.equal(c.activate, "*67*+3612345678#");
  assert.equal(c.deactivate, "##67#");
  assert.equal(c.verifyPerCarrier, true);
  assert.deepEqual(DEFAULT_CONDITIONS, ["busy", "no_answer", "unreachable"]);
  assert.throws(() => forwardingCodes("busy", "12", "one"), /invalid DID/);
});

test("HMAC round-trip verifies", () => {
  const secret = "s3cret";
  const ts = String(Math.floor(Date.now() / 1000));
  const sig = signToolCall("POST", "/api/voice/tools/book_appointment", ts, '{"a":1}', secret);
  const r = verifyToolCall(sig, "POST", "/api/voice/tools/book_appointment", ts, '{"a":1}', secret);
  assert.equal(r.ok, true);
});

test("stale timestamp rejected", () => {
  const secret = "s3cret";
  const old = String(Math.floor(Date.now() / 1000) - 300);
  const sig = signToolCall("POST", "/p", old, "{}", secret);
  assert.equal(verifyToolCall(sig, "POST", "/p", old, "{}", secret).ok, false);
});

test("wrong body rejected", () => {
  const secret = "s3cret";
  const ts = String(Math.floor(Date.now() / 1000));
  const sig = signToolCall("POST", "/p", ts, '{"a":1}', secret);
  assert.equal(verifyToolCall(sig, "POST", "/p", ts, '{"a":2}', secret).ok, false);
});

test("idempotency key is deterministic and unique per seq", () => {
  const a = bookingIdempotencyKey("call1", "2026-10-30T15:00", "svc1", 1);
  assert.equal(a, bookingIdempotencyKey("call1", "2026-10-30T15:00", "svc1", 1));
  assert.notEqual(a, bookingIdempotencyKey("call1", "2026-10-30T15:00", "svc1", 2));
});
