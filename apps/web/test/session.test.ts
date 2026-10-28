import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSessionPayload } from "../src/lib/session.ts";

const rows = {
  orgId: "org1",
  businessName: "Rózsa Szépségszalon",
  timezone: "Europe/Budapest",
  knowledge: "Nyitva: H–P 9–18.",
  playbooks: ["faq", "booking"],
  bookingAllowed: true,
  transferAllowed: false,
  blocklist: [],
  keywords: ["Rózsa", "Blaha"],
  voiceId: "voice1",
  agentVersionId: "v3",
  draft: false,
};

test("session payload carries greeting, prompt, keywords", () => {
  const p = buildSessionPayload(rows, {
    channel: "browser",
    callerNumber: "unknown",
    nowIso: "2026-10-28T16:00:00+01:00",
    weekdayHu: "szerda",
  });
  assert.equal(p.orgId, "org1");
  assert.equal(p.draft, false);
  assert.match(p.greetingHu, /mesterséges intelligencia/);
  assert.match(p.systemPrompt, /CALL CONTEXT/);
  assert.ok(p.promptTokens > 0);
  assert.deepEqual(p.keywords, ["Rózsa", "Blaha"]);
});

test("keywords capped at 50 per stream handshake", () => {
  const p = buildSessionPayload(
    { ...rows, keywords: Array.from({ length: 60 }, (_, i) => `kw${i}`) },
    { channel: "phone", callerNumber: "+3612345678", nowIso: "x", weekdayHu: "szerda" },
  );
  assert.equal(p.keywords.length, 50);
});
