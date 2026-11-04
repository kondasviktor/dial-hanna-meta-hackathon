/** Consecutive-miss retry counter for Twilio <Gather> (pure, unit-tested).
 *
 * A missed turn (silence, STT miss, answered during Hanna's <Play>) must loop
 * back and ask again — it must never play Goodbye and end the document, which
 * drops the call mid-order. Only the third consecutive miss says goodbye.
 */

export const FIRST_RETRY = 1;
export const LAST_RETRY = 3;

export function parseRetry(raw: unknown): number {
  const n = typeof raw === "string" ? Number.parseInt(raw, 10) : NaN;
  if (!Number.isFinite(n)) return FIRST_RETRY;
  return Math.min(Math.max(Math.trunc(n), FIRST_RETRY), LAST_RETRY);
}

/** What the gather route should do when a turn arrives with no speech. */
export function missOutcome(retry: number): "retry" | "bye" {
  return retry >= LAST_RETRY ? "bye" : "retry";
}
