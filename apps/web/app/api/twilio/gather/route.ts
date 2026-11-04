import { NextResponse } from "next/server";
import { chat, MODELS } from "@/lib/meta.ts";
import { detectTtsLang, type TtsLang } from "@/lib/elevenlabs.ts";
import {
  endCallSession,
  ensureCallSession,
  saveCallTurns,
  type CallTurn,
} from "@/lib/call_memory.ts";
import {
  historyForLlm,
  loadKnowledge,
  maybeLogKnowledgeGap,
  softphoneSystemPrompt,
} from "@/lib/twilio_turn.ts";
import { replyTwiml } from "@/lib/twilio_twiml.ts";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

/** Twilio Gather — SpeechResult + CallSid history → Spark → reply (no filler). */
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

    const turnsForLlm: CallTurn[] = [...prior, { role: "user", content: speech }];
    const history = historyForLlm(turnsForLlm);

    const tLlm = Date.now();
    spoken = await chat({
      model: MODELS.live,
      reasoningEffort: "minimal",
      maxTokens: 450,
      messages: [
        {
          role: "system",
          content: softphoneSystemPrompt(loaded.businessName, replyLang, loaded.knowledge),
        },
        ...history.map((t) => ({ role: t.role, content: t.content })),
      ],
    });
    spoken = spoken.replace(/\s+/g, " ").trim().slice(0, 500);

    if (callId) {
      await saveCallTurns(callId, [
        ...prior,
        { role: "user", content: speech },
        { role: "assistant", content: spoken },
      ]);
      if (loaded.orgId) {
        await maybeLogKnowledgeGap({
          orgId: loaded.orgId,
          callId,
          question: speech,
          spoken,
        });
      }
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
