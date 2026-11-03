import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client.ts";
import { businessProfiles, faqs } from "@/db/schema.ts";
import { chat, MODELS } from "@/lib/meta.ts";
import { resolveCallOrg } from "@/lib/org.ts";
import { replyTwiml } from "@/lib/twilio_twiml.ts";
import { detectTtsLang, type TtsLang } from "@/lib/elevenlabs.ts";
import { renderBusinessKnowledge } from "@/lib/business_knowledge.ts";

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

/** Twilio Gather callback — SpeechResult → Muse Spark → ElevenLabs reply. */
export async function POST(req: Request) {
  const t0 = Date.now();
  const url = new URL(req.url);
  const form = await req.formData();
  const speech = String(form.get("SpeechResult") ?? "").trim();
  const confidence = String(form.get("Confidence") ?? "");
  const toE164 = String(form.get("To") ?? form.get("Called") ?? "").trim();
  const orgFromQuery = url.searchParams.get("org");
  const lang = callLang(req, speech);

  console.log("twilio-gather", { speech, confidence, lang, orgFromQuery, toE164 });

  if (!speech) {
    const retry =
      lang === "hu"
        ? "Nem hallottam semmit. Elmondaná újra?"
        : "I did not hear anything. Could you say that again?";
    return new NextResponse(replyTwiml(retry, true, lang, orgFromQuery), {
      headers: { "Content-Type": "text/xml; charset=utf-8" },
    });
  }

  const lower = speech.toLowerCase();
  if (
    /\b(goodbye|bye|hang up|that's all|thats all)\b/.test(lower) ||
    /\b(viszlát|viszontlátásra|köszönöm.?ennyi|legyen.?szép)\b/i.test(speech)
  ) {
    const bye = lang === "hu" ? "Köszönöm a hívást. Viszontlátásra!" : "Thanks for calling. Goodbye!";
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
    const tLlm = Date.now();
    // Reasoning tokens eat the completion budget (DEVIATIONS #4) — keep headroom.
    spoken = await chat({
      model: MODELS.live,
      reasoningEffort: "minimal",
      maxTokens: 600,
      messages: [
        {
          role: "system",
          content: `You are Hanna, a warm AI phone receptionist for ${loaded.businessName}. Never call yourself "Dial Hanna" — only Hanna.
Keep replies under 2 short sentences for phone TTS (except when reading back an order). Reply in ${replyLang}.
Disclose you are an AI if asked.
Use the full knowledge: hours, address, phone, products/prices, policies, and approved FAQs. Do not invent facts.
If the caller wants to order: collect product/size, pickup time in opening hours, name and phone; read back once; say the shop will confirm price if missing.
If unknown, offer to take a message for the owner.
Knowledge:
${loaded.knowledge}`,
        },
        { role: "user", content: speech },
      ],
    });
    spoken = spoken.replace(/\s+/g, " ").trim().slice(0, 500);
    console.log("twilio-gather-timing", {
      llmMs: Date.now() - tLlm,
      totalMs: Date.now() - t0,
      orgId,
      chars: spoken.length,
    });
  } catch (e) {
    console.error("gather-spark", e, { totalMs: Date.now() - t0 });
  }

  return new NextResponse(replyTwiml(spoken, true, lang, orgId), {
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}
