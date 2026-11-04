import { NextResponse } from "next/server";
import { chat, MODELS } from "@/lib/meta.ts";
import type { TtsLang } from "@/lib/elevenlabs.ts";
import { ensureCallSession, saveCallTurns, type CallTurn } from "@/lib/call_memory.ts";
import {
  historyForLlm,
  loadKnowledge,
  maybeLogKnowledgeGap,
  softphoneSystemPrompt,
} from "@/lib/twilio_turn.ts";
import { replyTwiml } from "@/lib/twilio_twiml.ts";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function callLang(req: Request): TtsLang {
  const q = new URL(req.url).searchParams.get("lang")?.toLowerCase();
  if (q === "hu" || q === "en") return q;
  return "en";
}

/**
 * Continues after filler Play — runs Spark on stored history and speaks the reply.
 * Twilio Redirect POSTs CallSid/From/To (no SpeechResult).
 */
export async function POST(req: Request) {
  const t0 = Date.now();
  const url = new URL(req.url);
  const form = await req.formData().catch(() => null);
  const callSid = String(form?.get("CallSid") ?? "").trim();
  const fromE164 = String(form?.get("From") ?? "").trim();
  const toE164 = String(form?.get("To") ?? form?.get("Called") ?? "").trim();
  const orgFromQuery = url.searchParams.get("org");
  const lang = callLang(req);

  let orgId = orgFromQuery;
  let spoken =
    lang === "hu"
      ? "Egy pillanat, még dolgozom a válaszon."
      : "One moment — I am still putting that together.";

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

    // Last turn should be the user utterance saved by /gather.
    const lastUser = [...prior].reverse().find((t) => t.role === "user");
    if (!lastUser) {
      spoken =
        lang === "hu"
          ? "Nem hallottam semmit. Elmondaná újra?"
          : "I did not catch that. Could you say it again?";
      return new NextResponse(replyTwiml(spoken, true, lang, orgId), {
        headers: { "Content-Type": "text/xml; charset=utf-8" },
      });
    }

    // Avoid double-answering if Redirect retries.
    if (prior.length >= 2 && prior[prior.length - 1]?.role === "assistant") {
      spoken = prior[prior.length - 1]!.content;
      return new NextResponse(replyTwiml(spoken, true, lang, orgId), {
        headers: { "Content-Type": "text/xml; charset=utf-8" },
      });
    }

    const history = historyForLlm(prior);
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
      await saveCallTurns(callId, [...prior, { role: "assistant", content: spoken }]);
      if (loaded.orgId) {
        await maybeLogKnowledgeGap({
          orgId: loaded.orgId,
          callId,
          question: lastUser.content,
          spoken,
        });
      }
    }

    console.log("twilio-think-timing", {
      llmMs: Date.now() - tLlm,
      totalMs: Date.now() - t0,
      orgId,
      callId,
      priorTurns: prior.length,
      chars: spoken.length,
    });
  } catch (e) {
    console.error("think-spark", e, { totalMs: Date.now() - t0 });
    spoken =
      lang === "hu"
        ? "Elnézést, rövid technikai hibám volt. Elmondaná még egyszer?"
        : "Sorry, I had a brief glitch. Could you say that once more?";
  }

  return new NextResponse(replyTwiml(spoken, true, lang, orgId), {
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

export async function GET(req: Request) {
  return POST(req);
}
