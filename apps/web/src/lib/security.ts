// Signed voice-tool calls (Master Spec §6.7).
// HMAC-SHA256 over method + path + timestamp + body with TOOLS_HMAC_SECRET;
// reject if older than 60 s. Booking idempotency key = call_id + slot_start
// + service_id + seq (unique index in DB).

import { createHmac, timingSafeEqual } from "node:crypto";

export const TOOL_SKEW_SECONDS = 60;

export function signToolCall(
  method: string,
  path: string,
  timestamp: string,
  body: string,
  secret: string,
): string {
  return createHmac("sha256", secret)
    .update(`${method}\n${path}\n${timestamp}\n${body}`)
    .digest("hex");
}

export function verifyToolCall(
  signature: string,
  method: string,
  path: string,
  timestamp: string,
  body: string,
  secret: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): { ok: boolean; reason?: string } {
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return { ok: false, reason: "bad-timestamp" };
  if (Math.abs(nowSeconds - ts) > TOOL_SKEW_SECONDS) return { ok: false, reason: "stale" };
  const expected = signToolCall(method, path, timestamp, body, secret);
  try {
    const a = Buffer.from(signature, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, reason: "bad-signature" };
  } catch {
    return { ok: false, reason: "bad-signature" };
  }
  return { ok: true };
}

export function bookingIdempotencyKey(callId: string, slotStart: string, serviceId: string, seq: number): string {
  return `${callId}:${slotStart}:${serviceId}:${seq}`;
}
