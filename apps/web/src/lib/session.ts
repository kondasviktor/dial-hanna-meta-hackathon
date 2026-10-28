// Voice session payload builder (Master Spec §6.3 step 1–2).
// Pure: DB rows in, signed-session payload out. The API route adds the HMAC.

import { renderGreeting } from "./greeting.ts";
import { renderPrompt } from "./prompt.ts";

export interface SessionRows {
  orgId: string;
  businessName: string;
  timezone: string;
  knowledge: string;
  playbooks: string[];
  bookingAllowed: boolean;
  transferAllowed: boolean;
  blocklist: string[];
  keywords: string[];
  voiceId: string;
  agentVersionId: string;
  draft: boolean;
}

export function buildSessionPayload(
  rows: SessionRows,
  opts: { channel: "phone" | "browser"; callerNumber: string; nowIso: string; weekdayHu: string; recordingOn?: boolean },
): {
  orgId: string;
  agentVersionId: string;
  draft: boolean;
  greetingHu: string;
  greetingEn: string;
  systemPrompt: string;
  promptTokens: number;
  keywords: string[];
  voiceId: string;
} {
  const { prompt, tokens } = renderPrompt({
    businessName: rows.businessName,
    knowledge: rows.knowledge,
    playbooks: rows.playbooks,
    bookingAllowed: rows.bookingAllowed,
    transferAllowed: rows.transferAllowed,
    blocklist: rows.blocklist,
    nowIso: opts.nowIso,
    weekdayHu: opts.weekdayHu,
    channel: opts.channel,
    callerNumber: opts.callerNumber,
  });
  return {
    orgId: rows.orgId,
    agentVersionId: rows.agentVersionId,
    draft: rows.draft,
    greetingHu: renderGreeting({ businessName: rows.businessName, language: "hu", recordingOn: opts.recordingOn }),
    greetingEn: renderGreeting({ businessName: rows.businessName, language: "en", recordingOn: opts.recordingOn }),
    systemPrompt: prompt,
    promptTokens: tokens,
    keywords: rows.keywords.slice(0, 50),
    voiceId: rows.voiceId,
  };
}
