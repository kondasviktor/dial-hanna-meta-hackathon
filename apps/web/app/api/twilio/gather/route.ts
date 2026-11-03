import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client.ts";
import { businessProfiles, faqs, organizations } from "@/db/schema.ts";
import { chat, MODELS } from "@/lib/meta.ts";
import { replyTwiml } from "@/lib/twilio_twiml.ts";
import { detectTtsLang, type TtsLang } from "@/lib/elevenlabs.ts";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function loadKnowledge(): Promise<string> {
  const db = getDb();
  if (!db) return "No business knowledge loaded yet.";
  const org = (await db.select().from(organizations).limit(1))[0];
  if (!org) return "No organization configured.";
  const prof = (await db.select().from(businessProfiles).where(eq(businessProfiles.orgId, org.id)).limit(1))[0];
  const allFaqs = await db.select().from(faqs).where(eq(faqs.orgId, org.id));
  const { renderBusinessKnowledge } = await import("@/lib/business_knowledge.ts");
  return renderBusinessKnowledge(
    (prof?.profile ?? null) as Parameters<typeof renderBusinessKnowledge>[0],
    allFaqs,
    { fallbackName: org.name },
  );
}

function callLang(req: Request, speech: string): TtsLang {
  const q = new URL(req.url).searchParams.get("lang")?.toLowerCase();
  if (q === "hu" || q === "en") return q;
  return detectTtsLang(speech);
}

/** Twilio Gather callback — SpeechResult → Muse Spark → ElevenLabs reply. */
export async function POST(req: Request) {
  const form = await req.formData();
  const speech = String(form.get("SpeechResult") ?? "").trim();
  const confidence = String(form.get("Confidence") ?? "");
  const lang = callLang(req, speech);

  console.log("twilio-gather", { speech, confidence, lang });

  if (!speech) {
    const retry =
      lang === "hu"
        ? "Nem hallottam semmit. Elmondaná újra?"
        : "I did not hear anything. Could you say that again?";
    return new NextResponse(replyTwiml(retry, true, lang), {
      headers: { "Content-Type": "text/xml; charset=utf-8" },
    });
  }

  const lower = speech.toLowerCase();
  if (
    /\b(goodbye|bye|hang up|that's all|thats all)\b/.test(lower) ||
    /\b(viszlát|viszontlátásra|köszönöm.?ennyi|legyen.?szép)\b/i.test(speech)
  ) {
    const bye = lang === "hu" ? "Köszönöm a hívást. Viszontlátásra!" : "Thanks for calling. Goodbye!";
    return new NextResponse(replyTwiml(bye, false, lang), {
      headers: { "Content-Type": "text/xml; charset=utf-8" },
    });
  }

  let spoken =
    lang === "hu"
      ? "Még beüzemelés alatt vagyok. Kérem, hagyjon üzenetet a tulajdonosnak, visszahívják."
      : "I am still getting set up. Please leave a message for the owner and they will call you back.";
  try {
    const knowledge = await loadKnowledge();
    const replyLang = lang === "hu" ? "Hungarian" : "English";
    spoken = await chat({
      model: MODELS.live,
      reasoningEffort: "minimal",
      maxTokens: 220,
      messages: [
        {
          role: "system",
          content: `You are Hanna, a warm AI phone receptionist for the business in the knowledge block. Never call yourself "Dial Hanna" — only Hanna.
Keep replies under 2 short sentences for phone TTS (except when reading back an order). Reply in ${replyLang}.
Disclose you are an AI if asked.
Use the full knowledge: hours, address, phone, products/prices, policies, and approved FAQs. Do not invent facts.
If the caller wants to order: collect product/size, pickup time in opening hours, name and phone; read back once; say the shop will confirm price if missing.
If unknown, offer to take a message for the owner.
Knowledge:
${knowledge}`,
        },
        { role: "user", content: speech },
      ],
    });
    spoken = spoken.replace(/\s+/g, " ").trim().slice(0, 500);
  } catch (e) {
    console.error("gather-spark", e);
  }

  return new NextResponse(replyTwiml(spoken, true, lang), {
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}
