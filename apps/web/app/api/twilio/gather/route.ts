import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client.ts";
import { businessProfiles, faqs } from "@/db/schema.ts";
import { chat, MODELS } from "@/lib/meta.ts";
import { resolveCallOrg } from "@/lib/org.ts";
import { replyTwiml } from "@/lib/twilio_twiml.ts";
import { detectTtsLang, type TtsLang } from "@/lib/elevenlabs.ts";
import { renderBusinessKnowledge } from "@/lib/business_knowledge.ts";
import {
  endCallSession,
  ensureCallSession,
  saveCallTurns,
  type CallTurn,
} from "@/lib/call_memory.ts";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function loadKnowledge(orgId?: string | null, toE164?: string | null): Promise<{
  knowledge: string;
  orgId: string | null;
  businessName: string;
}> {
  const org = await resolveCallOrg({ orgId, toE164 });
  if (!org) {
    return {
      knowledge: "No organization configured.",
      orgId: null,
      businessName: "the business",
    };
  }
  const db = getDb();
  if (!db) {
    return {
      knowledge: "No business knowledge loaded yet.",
      orgId: org.id,
      businessName: org.name,
    };
  }
  const prof = (
    await db.select().from(businessProfiles).where(eq(businessProfiles.orgId, org.id)).limit(1)
  )[0];
  const allFaqs = await db.select().from(faqs).where(eq(faqs.orgId, org.id));
  const profile = (prof?.profile ?? null) as Parameters<typeof renderBusinessKnowledge>[0];
  const knowledge = renderBusinessKnowledge(profile, allFaqs, { fallbackName: org.name });
  const businessName =
    (profile && typeof profile === "object" && "name" in profile && profile?.name?.trim()) ||
    org.name;
  return { knowledge, orgId: org.id, businessName };
}

function callLang(req: Request, speech: string): TtsLang {
  const q = new URL(req.url).searchParams.get("lang")?.toLowerCase();
  if (q === "hu" || q === "en") return q;
  return detectTtsLang(speech);
}

function isGoodbye(speech: string): boolean {
  const lower = speech.toLowerCase();
  return (
    /\b(goodbye|bye|hang up|that's all|thats all)\b/.test(lower) ||
    /\b(viszlát|viszontlátásra|köszönöm.?ennyi|legyen.?szép)\b/i.test(speech)
  );
}

function systemPrompt(businessName: string, replyLang: string, knowledge: string): string {
  return `You are Hanna, a warm AI phone receptionist for ${businessName}. Never call yourself "Dial Hanna" — only Hanna.
Keep replies under 2 short sentences for phone TTS (except when reading back an order). Reply in ${replyLang}.
Disclose you are an AI if asked.
Use the full knowledge: hours, address, phone, products/prices, policies, and approved FAQs. Do not invent facts.

MULTI-TURN MEMORY (critical):
- You receive the full conversation history. Treat earlier turns as known facts.
- NEVER re-ask for product, size/slices, pickup day/time, caller name, or phone number once the caller has already given them in this call.
- If the caller gave several fields in one utterance, extract all of them and only ask for what is still missing.
- Ask for at most one missing field at a time unless they volunteered everything.

ORDERS:
- Required slots: product (and size/slices if relevant), pickup day+time within opening hours, name, phone.
- When all slots are filled, read the full order back once for confirmation, then say the shop will confirm price/availability if needed.
- Do not restart the order flow after a partial answer.

If unknown and not an order in progress, offer to take a message for the owner.
Knowledge:
${knowledge}`;
}

/** Twilio Gather callback — SpeechResult → Muse Spark → ElevenLabs reply. */
export async function POST(req: Request) {
  const t0 = Date.now();
  const url = new URL(req.url);
  const form = await req.formData();
  const speech = String(form.get("SpeechResult") ?? "").trim();
  const confidence = String(form.get("Confidence") ?? "");
  const callSid = String(form.get("CallSid") ?? "").trim();
  const fromE164 = String(form.get("From") ?? "").trim();
  const toE164 = String(form.get("To") ?? form.get("Called") ?? "").trim();
  const orgFromQuery = url.searchParams.get("org");
  const lang = callLang(req, speech);

  console.log("twilio-gather", {
    speech,
    confidence,
    lang,
    orgFromQuery,
    toE164,
    callSid: callSid || null,
  });

  if (!speech) {
    const retry =
      lang === "hu"
        ? "Nem hallottam semmit. Elmondaná újra?"
        : "I did not hear anything. Could you say that again?";
    return new NextResponse(replyTwiml(retry, true, lang, orgFromQuery), {
      headers: { "Content-Type": "text/xml; charset=utf-8" },
    });
  }

  if (isGoodbye(speech)) {
    const bye = lang === "hu" ? "Köszönöm a hívást. Viszontlátásra!" : "Thanks for calling. Goodbye!";
    if (callSid) {
      const loaded = await loadKnowledge(orgFromQuery, toE164);
      if (loaded.orgId) {
        const session = await ensureCallSession({
          callSid,
          orgId: loaded.orgId,
          fromE164,
          toE164,
          language: lang,
        });
        if (session) await endCallSession(session.callId);
      }
    }
    return new NextResponse(replyTwiml(bye, false, lang, orgFromQuery), {
      headers: { "Content-Type": "text/xml; charset=utf-8" },
    });
  }

  let orgId = orgFromQuery;
  let spoken =
    lang === "hu"
      ? "Még beüzemelés alatt vagyok. Kérem, hagyjon üzenetet a tulajdonosnak, visszahívják."
      : "I am still getting set up. Please leave a message for the owner and they will call you back.";
  try {
    const loaded = await loadKnowledge(orgFromQuery, toE164);
    orgId = loaded.orgId ?? orgFromQuery;
    const replyLang = lang === "hu" ? "Hungarian" : "English";

    let prior: CallTurn[] = [];
    let callId: string | null = null;
    if (callSid && loaded.orgId) {
      const session = await ensureCallSession({
        callSid,
        orgId: loaded.orgId,
        fromE164,
        toE164,
        language: lang,
      });
      if (session) {
        callId = session.callId;
        prior = session.turns;
      }
    }

    const messages: { role: string; content: string }[] = [
      {
        role: "system",
        content: systemPrompt(loaded.businessName, replyLang, loaded.knowledge),
      },
      ...prior.map((t) => ({ role: t.role, content: t.content })),
      { role: "user", content: speech },
    ];

    const tLlm = Date.now();
    // Reasoning tokens eat the completion budget (DEVIATIONS #4) — keep headroom.
    spoken = await chat({
      model: MODELS.live,
      reasoningEffort: "minimal",
      maxTokens: 600,
      messages,
    });
    spoken = spoken.replace(/\s+/g, " ").trim().slice(0, 500);

    if (callId) {
      const nextTurns: CallTurn[] = [
        ...prior,
        { role: "user", content: speech },
        { role: "assistant", content: spoken },
      ];
      await saveCallTurns(callId, nextTurns);
    }

    console.log("twilio-gather-timing", {
      llmMs: Date.now() - tLlm,
      totalMs: Date.now() - t0,
      orgId,
      callId,
      priorTurns: prior.length,
      chars: spoken.length,
    });
  } catch (e) {
    console.error("gather-spark", e, { totalMs: Date.now() - t0 });
  }

  return new NextResponse(replyTwiml(spoken, true, lang, orgId), {
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}
