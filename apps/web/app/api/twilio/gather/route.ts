import { after, NextResponse } from "next/server";
import { chat, MODELS } from "@/lib/meta.ts";
import { UUID_RE } from "@/lib/org.ts";
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
import { finalizeCallOutcome } from "@/lib/finalize_call.ts";
import { closesConversation, isBareNo, missOutcome, parseRetry } from "@/lib/gather_retry.ts";
import { replyTwiml } from "@/lib/twilio_twiml.ts";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const preferredRegion = "fra1";

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

  const retry = parseRetry(url.searchParams.get("retry"));
  if (!speech) {
    // Consecutive misses ask again; only the last retry says goodbye.
    if (missOutcome(retry) === "bye") {
      const bye =
        lang === "hu" ? "Köszönöm a hívást. Viszontlátásra!" : "Thanks for calling. Goodbye!";
      return new NextResponse(replyTwiml(bye, false, lang, orgFromQuery), {
        headers: { "Content-Type": "text/xml; charset=utf-8" },
      });
    }
    const again =
      lang === "hu"
        ? "Nem hallottam semmit. Elmondaná újra?"
        : "I did not hear anything. Could you say that again?";
    return new NextResponse(replyTwiml(again, true, lang, orgFromQuery, retry + 1), {
      headers: { "Content-Type": "text/xml; charset=utf-8" },
    });
  }

  if (isGoodbye(speech) || isBareNo(speech)) {
    const bye = lang === "hu" ? "Köszönöm a hívást. Viszontlátásra!" : "Thanks for calling. Goodbye!";
    if (callSid) {
      const loaded = await loadKnowledge(orgFromQuery, toE164, lang);
      if (loaded.orgId) {
        const session = await ensureCallSession({
          callSid,
          orgId: loaded.orgId,
          fromE164,
          toE164,
          language: lang,
        });
        // Bare "no / thanks" ends the call only when it answers Hanna's
        // anything-else question; otherwise it is a normal turn. Explicit
        // goodbyes always close.
        const lastAssistant = [...(session?.turns ?? [])]
          .reverse()
          .find((t) => t.role === "assistant")?.content;
        const closing = isGoodbye(speech) || closesConversation(speech, lastAssistant);
        if (closing) {
          if (session) {
            // Caller hung up: outcome extraction runs after the reply, using the
            // in-memory transcript — so the dashboard shows intent → outcome.
            const finalTurns = [
              ...session.turns,
              { role: "user" as const, content: speech },
              { role: "assistant" as const, content: bye },
            ];
            const lines = finalTurns.map((t) => `${t.role === "user" ? "caller" : "hanna"}: ${t.content}`);
            const callId = session.callId;
            const orgId = loaded.orgId;
            after(async () => {
              await finalizeCallOutcome(callId, orgId, lines);
              await endCallSession(callId);
            });
          }
          // Say goodbye and end the call.
          return new NextResponse(replyTwiml(bye, false, lang, orgFromQuery), {
            headers: { "Content-Type": "text/xml; charset=utf-8" },
          });
        }
        // Mid-order "no": fall through to the normal reply path below.
      }
    }
    // No call session (unknown org): still close politely on goodbye words.
    if (isGoodbye(speech)) {
      return new NextResponse(replyTwiml(bye, false, lang, orgFromQuery), {
        headers: { "Content-Type": "text/xml; charset=utf-8" },
      });
    }
    // Bare "no" without context: let the model answer it as a normal turn.
  }

  let orgId = orgFromQuery;
  let spoken =
    lang === "hu"
      ? "Még beüzemelés alatt vagyok. Kérem, hagyjon üzenetet a tulajdonosnak, visszahívják."
      : "I am still getting set up. Please leave a message for the owner and they will call you back.";

  try {
    // Softphone passes a resolved org UUID: load knowledge and call history
    // in parallel instead of waiting for knowledge first.
    const orgHint =
      orgFromQuery && UUID_RE.test(orgFromQuery) ? orgFromQuery : null;
    const [loaded, hintedSession] = await Promise.all([
      loadKnowledge(orgFromQuery, toE164, lang),
      callSid && orgHint
        ? ensureCallSession({
            callSid,
            orgId: orgHint,
            fromE164,
            toE164,
            language: lang,
          })
        : Promise.resolve(undefined),
    ]);
    orgId = loaded.orgId ?? orgFromQuery;
    const replyLang = lang === "hu" ? "Hungarian" : "English";

    let prior: CallTurn[] = [];
    let callId: string | null = null;
    const session =
      hintedSession && loaded.orgId === orgHint
        ? hintedSession
        : callSid && loaded.orgId
          ? await ensureCallSession({
              callSid,
              orgId: loaded.orgId,
              fromE164,
              toE164,
              language: lang,
            })
          : null;
    if (session) {
      callId = session.callId;
      prior = session.turns;
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
      // Persistence must not delay the spoken reply: run after TwiML is sent.
      const finalTurns: CallTurn[] = [
        ...prior,
        { role: "user", content: speech },
        { role: "assistant", content: spoken },
      ];
      const gapOrgId = loaded.orgId;
      after(async () => {
        await saveCallTurns(callId, finalTurns);
        if (gapOrgId) {
          await maybeLogKnowledgeGap({
            orgId: gapOrgId,
            callId,
            question: speech,
            spoken,
          });
        }
      });
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
