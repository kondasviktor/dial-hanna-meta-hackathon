import { appBaseUrl, detectTtsLang, type TtsLang } from "@/lib/elevenlabs.ts";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function playUrl(text: string, lang?: TtsLang): string {
  const base = appBaseUrl();
  const l = lang ?? detectTtsLang(text);
  return `${base}/api/twilio/tts?lang=${l}&text=${encodeURIComponent(text)}`;
}

/** Short reject when the shop owner paused Hanna (forwarding may still be active). */
export function hannaPausedTwiml(lang: TtsLang = "en"): string {
  const msg =
    lang === "hu"
      ? "Köszönjük a hívást. Hanna, a mesterséges intelligencia asszisztens, jelenleg szünetel. Kérjük, hívjon vissza később."
      : "Thanks for calling. Hanna, the AI assistant, is paused right now. Please try again later. Goodbye.";
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${escapeXml(playUrl(msg, lang))}</Play>
  <Hangup/>
</Response>`;
}

function gatherActionUrl(lang: TtsLang, orgId?: string | null): string {
  const u = new URL(`${appBaseUrl()}/api/twilio/gather`);
  u.searchParams.set("lang", lang);
  if (orgId) u.searchParams.set("org", orgId);
  return u.toString();
}

function thinkActionUrl(lang: TtsLang, orgId?: string | null): string {
  const u = new URL(`${appBaseUrl()}/api/twilio/think`);
  u.searchParams.set("lang", lang);
  if (orgId) u.searchParams.set("org", orgId);
  return u.toString();
}

/** Instant acknowledgement while Spark thinks (static Hanna filler mp3). */
export function fillerThenThinkTwiml(lang: TtsLang = "en", orgId?: string | null): string {
  // Use public /api/twilio/tts (always allowlisted) so Clerk never 404s the Play URL.
  // Short text is Cache-Control cached after the first hit.
  const filler = playUrl(lang === "hu" ? "Egy pillanat." : "Okay.", lang);
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${escapeXml(filler)}</Play>
  <Redirect method="POST">${escapeXml(thinkActionUrl(lang, orgId))}</Redirect>
</Response>`;
}

/** Shared TwiML for inbound DID and browser softphone. */
export function dialHannaTwiml(
  lang: TtsLang = "en",
  opts?: { orgId?: string | null },
): string {
  const voiceUrl = process.env.VOICE_SERVICE_URL?.replace(/\/$/, "");
  const streamBase = voiceUrl
    ?.replace(/^https:/i, "wss:")
    .replace(/^http:/i, "ws:");

  if (streamBase) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${streamBase}/twilio" />
  </Connect>
</Response>`;
  }

  const greeting =
    lang === "hu"
      ? "Jó napot, Hanna vagyok, a mesterséges intelligencia asszisztens. Miben segíthetek?"
      : "Hi, this is Hanna, the AI receptionist. How can I help you today?";
  const miss =
    lang === "hu"
      ? "Elnézést, nem értettem. Viszontlátásra."
      : "Sorry, I did not catch that. Goodbye for now.";
  const gatherLang = lang === "hu" ? "hu-HU" : "en-US";
  const gather = gatherActionUrl(lang, opts?.orgId);
  const play = escapeXml(playUrl(greeting, lang));

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${play}</Play>
  <Gather input="speech" language="${gatherLang}" action="${escapeXml(gather)}" method="POST" speechTimeout="auto" timeout="6">
  </Gather>
  <Play>${escapeXml(playUrl(miss, lang))}</Play>
</Response>`;
}

export function replyTwiml(
  spoken: string,
  continueGather = true,
  lang?: TtsLang,
  orgId?: string | null,
): string {
  const l = lang ?? detectTtsLang(spoken);
  const gather = gatherActionUrl(l, orgId);
  const gatherLang = l === "hu" ? "hu-HU" : "en-US";
  const play = escapeXml(playUrl(spoken, l));
  const bye =
    l === "hu"
      ? "Köszönjük a hívást. Viszontlátásra."
      : "Thanks for calling. Goodbye.";
  if (!continueGather) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${play}</Play>
</Response>`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${play}</Play>
  <Gather input="speech" language="${gatherLang}" action="${escapeXml(gather)}" method="POST" speechTimeout="auto" timeout="6">
  </Gather>
  <Play>${escapeXml(playUrl(bye, l))}</Play>
</Response>`;
}
