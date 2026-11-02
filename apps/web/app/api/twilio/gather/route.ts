import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client.ts";
import { businessProfiles, faqs, organizations } from "@/db/schema.ts";
import { chat, MODELS } from "@/lib/meta.ts";
import { replyTwiml } from "@/lib/twilio_twiml.ts";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function loadKnowledge(): Promise<string> {
  const db = getDb();
  if (!db) return "No business knowledge loaded yet.";
  const org = (await db.select().from(organizations).limit(1))[0];
  if (!org) return "No organization configured.";
  const prof = (await db.select().from(businessProfiles).where(eq(businessProfiles.orgId, org.id)).limit(1))[0];
  const approved = await db.select().from(faqs).where(eq(faqs.orgId, org.id));
  const live = approved.filter((f) => f.status === "approved");
  const profile = (prof?.profile ?? {}) as { name?: string; address?: string; services?: { name: string }[] };
  const lines = [
    `Business: ${profile.name ?? org.name}`,
    profile.address ? `Address: ${profile.address}` : "",
    profile.services?.length
      ? `Services: ${profile.services.map((s) => s.name).join(", ")}`
      : "",
    "Approved FAQs:",
    ...live.map((f) => `Q: ${f.qEn || f.qHu}\nA: ${f.aEn || f.aHu}`),
  ].filter(Boolean);
  return lines.join("\n");
}

/** Twilio Gather callback — SpeechResult → Muse Spark → ElevenLabs reply. */
export async function POST(req: Request) {
  const form = await req.formData();
  const speech = String(form.get("SpeechResult") ?? "").trim();
  const confidence = String(form.get("Confidence") ?? "");

  console.log("twilio-gather", { speech, confidence });

  if (!speech) {
    return new NextResponse(
      replyTwiml("I did not hear anything. Could you say that again?", true),
      { headers: { "Content-Type": "text/xml; charset=utf-8" } },
    );
  }

  const lower = speech.toLowerCase();
  if (/\b(goodbye|bye|hang up|that's all|thats all)\b/.test(lower)) {
    return new NextResponse(
      replyTwiml("Thanks for calling. Goodbye!", false),
      { headers: { "Content-Type": "text/xml; charset=utf-8" } },
    );
  }

  let spoken =
    "I am still getting set up. Please leave a message for the owner and they will call you back.";
  try {
    const knowledge = await loadKnowledge();
    spoken = await chat({
      model: MODELS.live,
      reasoningEffort: "minimal",
      maxTokens: 220,
      messages: [
        {
          role: "system",
          content: `You are Dial Hanna, a warm AI phone receptionist. Keep replies under 2 short sentences for phone TTS.
Disclose you are an AI if asked. Use only this knowledge; if unknown, offer to take a message.
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

  return new NextResponse(replyTwiml(spoken, true), {
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}
