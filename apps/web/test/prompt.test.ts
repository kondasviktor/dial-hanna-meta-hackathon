import { test } from "node:test";
import assert from "node:assert/strict";
import { renderPrompt, approxTokens, KNOWLEDGE_TOKEN_WARN } from "../src/lib/prompt.ts";

const base = {
  businessName: "Teszt Szalon",
  knowledge: "Nyitva: H–P 9–18. Női hajvágás 12 500 Ft-tól.",
  playbooks: ["faq", "booking", "message_callback"],
  bookingAllowed: true,
  transferAllowed: false,
  blocklist: ["orvosi tanács"],
  nowIso: "2026-10-28T15:00:00+01:00",
  weekdayHu: "szerda",
  channel: "browser" as const,
  callerNumber: "unknown",
};

test("cache order: static → knowledge → playbooks → dynamic last", () => {
  const { prompt } = renderPrompt(base);
  const iRules = prompt.indexOf("[PLATFORM RULES");
  const iKnow = prompt.indexOf("[BUSINESS KNOWLEDGE");
  const iPlay = prompt.indexOf("[PLAYBOOKS");
  const iCtx = prompt.indexOf("[CALL CONTEXT");
  assert.ok(iRules < iKnow && iKnow < iPlay && iPlay < iCtx);
});

test("booking confirmation rule present, blocklist rendered", () => {
  const { prompt } = renderPrompt(base);
  assert.match(prompt, /before book_appointment/);
  assert.match(prompt, /orvosi tanács/);
});

test("size guard trips on huge knowledge", () => {
  const big = "x".repeat(KNOWLEDGE_TOKEN_WARN * 4 + 100);
  const r = renderPrompt({ ...base, knowledge: big });
  assert.equal(r.overLimit, true);
  assert.ok(r.tokens > 0 && approxTokens("abcd") === 1);
});
