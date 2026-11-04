// Call Outcome validation (Master Spec §7.4 / schemas/call_outcome.json).
// Post-call Spark extraction output is validated here before it is stored;
// invalid extractions are retried, never stored half-parsed.

export const INTENTS = [
  "book", "reschedule", "cancel", "price_question", "hours_question",
  "location_question", "service_question", "quote_request", "complaint",
  "callback_request", "wrong_number", "spam", "other",
] as const;

export const OUTCOMES = [
  "booked", "rescheduled", "cancelled", "answered", "message_taken",
  "callback_requested", "transferred", "knowledge_gap", "caller_hung_up",
  "spam_rejected", "failed",
] as const;

export const NEXT_ACTIONS = [
  "none", "call_back", "confirm_booking", "approve_faq",
  "review_complaint", "send_quote",
] as const;

export interface CallOutcome {
  intent: string;
  outcome: string;
  next_action: { type: string; due_by: string | null; summary_hu: string; summary_en: string };
  caller: { name: string | null; phone: string | null; language: string };
  booking_id: string | null;
  knowledge_gap_questions: string[];
  /** Optional — not stored (privacy: summary only). */
  sentiment?: string;
  confidence: number;
}

export function validateOutcome(o: unknown): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const c = o as Partial<CallOutcome>;
  if (!c || typeof c !== "object") return { ok: false, errors: ["not-an-object"] };
  if (!INTENTS.includes(c.intent as never)) errors.push(`bad-intent:${c.intent}`);
  if (!OUTCOMES.includes(c.outcome as never)) errors.push(`bad-outcome:${c.outcome}`);
  const na = c.next_action;
  if (!na || !NEXT_ACTIONS.includes(na.type as never)) errors.push("bad-next-action");
  else {
    if (!na.summary_hu?.trim()) errors.push("missing-summary-hu");
    if (!na.summary_en?.trim()) errors.push("missing-summary-en");
  }
  if (!c.caller || !["hu", "en"].includes(c.caller.language)) errors.push("bad-language");
  if (typeof c.confidence !== "number" || c.confidence < 0 || c.confidence > 1) {
    errors.push("bad-confidence");
  }
  if (!Array.isArray(c.knowledge_gap_questions)) errors.push("bad-gap-list");
  return { ok: errors.length === 0, errors };
}

/**
 * Extraction prompt listing the exact allowed enum values. The model invents
 * values like "inquiry"/"info_provided" when the prompt only says "enums from
 * Dial Hanna" — validateOutcome then drops the row and the dashboard shows ?.
 */
export function outcomeSystemPrompt(): string {
  return `Extract a call outcome JSON: {intent, outcome, next_action:{type,due_by,summary_hu,summary_en}, caller:{name,phone,language}, booking_id, knowledge_gap_questions:[], confidence}. Do not include sentiment.
intent must be exactly one of: ${INTENTS.join(", ")}.
outcome must be exactly one of: ${OUTCOMES.join(", ")}.
next_action.type must be exactly one of: ${NEXT_ACTIONS.join(", ")}.
caller.language is hu|en. confidence is a number 0..1.`;
}

// Consistency rules the validator enforces beyond the JSON schema.
export function outcomeConsistent(o: CallOutcome): string[] {
  const issues: string[] = [];
  if (o.outcome === "booked" && !o.booking_id) issues.push("booked-without-booking-id");
  if (o.outcome === "knowledge_gap" && o.knowledge_gap_questions.length === 0) {
    issues.push("gap-without-question");
  }
  if (o.next_action.type === "none" && o.outcome === "knowledge_gap") {
    issues.push("gap-needs-approve-faq-action");
  }
  return issues;
}
