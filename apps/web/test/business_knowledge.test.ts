import { test } from "node:test";
import assert from "node:assert/strict";
import { renderBusinessKnowledge } from "../src/lib/business_knowledge.ts";

test("renders hours phone services policies and approved faqs", () => {
  const text = renderBusinessKnowledge(
    {
      name: "Daubner Cukrászda",
      phone: "***REMOVED***",
      address: "1025 Budapest, Szépvölgyi út 50.",
      hours: [{ weekday: 3, open: "09:00", close: "19:00" }],
      services: [{ name: "Sacher torta", price_text: "ár egyeztetés szerint" }],
      policies: { parking: "épület alatt, korlátozott" },
    },
    [
      { qHu: "Mikor vagytok nyitva?", aHu: "Sze–Vas 9–19", status: "approved" },
      { qHu: "Draft only", aHu: "x", status: "draft" },
    ],
  );
  assert.match(text, /Daubner/);
  assert.match(text, /Szépvölgyi/);
  assert.match(text, /329/);
  assert.match(text, /szerda/);
  assert.match(text, /Sacher/);
  assert.match(text, /parking/);
  assert.match(text, /Mikor vagytok nyitva/);
  assert.doesNotMatch(text, /Draft only/);
});

test("prompt order rules mention take_order and full knowledge", async () => {
  const { renderPrompt } = await import("../src/lib/prompt.ts");
  const { prompt } = renderPrompt({
    businessName: "Teszt",
    knowledge: "Név: Teszt",
    playbooks: ["ordering"],
    bookingAllowed: true,
    transferAllowed: false,
    blocklist: [],
    nowIso: "2026-11-03T12:00:00+01:00",
    weekdayHu: "kedd",
    channel: "phone",
    callerNumber: "+3612345678",
  });
  assert.match(prompt, /take_order/);
  assert.match(prompt, /website import/);
});
