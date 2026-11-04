import { NextResponse } from "next/server";
import { detectTtsLang, type TtsLang } from "@/lib/elevenlabs.ts";
import { endCallSession, ensureCallSession, saveCallTurns } from "@/lib/call_memory.ts";
import { loadKnowledge } from "@/lib/twilio_turn.ts";
import { fillerThenThinkTwiml, replyTwiml } from "@/lib/twilio_twiml.ts";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

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

/**
 * Twilio Gather callback — acknowledge immediately (filler), then Redirect to
 * /api/twilio/think so Spark+TTS work while the caller already hears Hanna.
 */
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

  // Persist the user turn now, then play filler while /think runs Spark.
  let orgId = orgFromQuery;
  try {
    const loaded = await loadKnowledge(orgFromQuery, toE164);
    orgId = loaded.orgId ?? orgFromQuery;
    if (callSid && loaded.orgId) {
      const session = await ensureCallSession({
        callSid,
        orgId: loaded.orgId,
        fromE164,
        toE164,
        language: lang,
      });
      if (session) {
        await saveCallTurns(session.callId, [
          ...session.turns,
          { role: "user", content: speech },
        ]);
      }
    }
  } catch (e) {
    console.error("gather-persist", e);
  }

  console.log("twilio-gather-ack", { totalMs: Date.now() - t0, orgId, callSid: callSid || null });
  return new NextResponse(fillerThenThinkTwiml(lang, orgId), {
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}
