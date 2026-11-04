import { test } from "node:test";
import assert from "node:assert/strict";
import {
  INTENTS,
  NEXT_ACTIONS,
  OUTCOMES,
  outcomeSystemPrompt,
  validateOutcome,
} from "../src/lib/outcomes.ts";

// The extractor prompt must name every allowed enum value: without the list
// the model invents values (e.g. inquiry/info_provided), validation drops the
// row, and the dashboard shows "? → ?".
test("outcome prompt lists all allowed enum values", () => {
  const p = outcomeSystemPrompt();
  for (const v of [...INTENTS, ...OUTCOMES, ...NEXT_ACTIONS]) {
    assert.ok(p.includes(v), `prompt missing enum value: ${v}`);
  }
});

test("a canonical extraction validates cleanly", () => {
  const { ok, errors } = validateOutcome({
    intent: "service_question",
    outcome: "answered",
    next_action: {
      type: "none",
      due_by: null,
      summary_hu: "Parkolási kérdés megválaszolva.",
      summary_en: "Parking question answered.",
    },
    caller: { name: null, phone: null, language: "en" },
    booking_id: null,
    knowledge_gap_questions: [],
    confidence: 0.9,
  });
  assert.equal(ok, true, errors.join(","));
});
