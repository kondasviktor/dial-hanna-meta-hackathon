import { test } from "node:test";
import assert from "node:assert/strict";
import { renderBusinessKnowledge } from "../src/lib/business_knowledge.ts";

test("renders hours phone services policies and approved faqs", () => {
  const text = renderBusinessKnowledge(
    {
      name: "Daubner Cukrászda",
      phone: "+36 20 123 4567",
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
  assert.match(text, /123 4567/);
  assert.match(text, /szerda/);
  assert.match(text, /Sacher/);
  assert.match(text, /parking/);
  assert.match(text, /Mikor vagytok nyitva/);
  assert.doesNotMatch(text, /Draft only/);
});

// Live calls render only the call's language. Rendering both HU+EN pairs
// doubled the block and pushed owner-answered FAQs past the 3500-char cap,
// so Hanna "did not know" answers that were in the knowledge base.
test("lang render keeps only that language's faq pairs", () => {
  const text = renderBusinessKnowledge(
    { name: "Pékség" },
    [
      {
        qHu: "Szállítotok Uber Eatsszel?",
        aHu: "Nem szállítunk, csak elvitelre.",
        qEn: "Can I order via Uber Eats?",
        aEn: "We don't offer delivery, pickup only.",
        status: "approved",
      },
    ],
    { lang: "en" },
  );
  assert.match(text, /Can I order via Uber Eats\?/);
  assert.doesNotMatch(text, /Szállítotok Uber Eatsszel\?/);
  const hu = renderBusinessKnowledge(
    { name: "Pékség" },
    [
      {
        qHu: "Szállítotok Uber Eatsszel?",
        aHu: "Nem szállítunk, csak elvitelre.",
        qEn: "Can I order via Uber Eats?",
        aEn: "We don't offer delivery, pickup only.",
        status: "approved",
      },
    ],
    { lang: "hu" },
  );
  assert.match(hu, /Szállítotok Uber Eatsszel\?/);
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
