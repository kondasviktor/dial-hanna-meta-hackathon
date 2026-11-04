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

const BARE_NO_EN =
  /^(no|nope|nah|no,?\s+thanks?|no,?\s+thank you|not really|that'?s (it|all)|that is (it|all)|nothing else|thanks?|thank you)\.?$/i;
const BARE_NO_HU = /^(nem|nem,?\s+köszönöm|köszönöm|köszi|ennyi(\s+volt)?)\.?$/i;

/** Standalone "no / thanks, that's all" with no other content. */
export function isBareNo(speech: string): boolean {
  const s = speech.trim();
  if (s.length > 40) return false;
  return BARE_NO_EN.test(s) || BARE_NO_HU.test(s);
}

const ANYTHING_ELSE_EN = /anything else|else i can|anything more/i;
const ANYTHING_ELSE_HU = /még valam|van-?e még|egyéb/i;

/** Did Hanna just ask whether the caller needs anything else? */
export function askedAnythingElse(lastAssistant: string | null | undefined): boolean {
  if (!lastAssistant) return false;
  return ANYTHING_ELSE_EN.test(lastAssistant) || ANYTHING_ELSE_HU.test(lastAssistant);
}

/**
 * Natural closing: bare "no / thanks" only ends the call when it answers
 * Hanna's anything-else question. Mid-order "no" stays a normal turn.
 */
export function closesConversation(speech: string, lastAssistant: string | null | undefined): boolean {
  return isBareNo(speech) && askedAnythingElse(lastAssistant);
}
