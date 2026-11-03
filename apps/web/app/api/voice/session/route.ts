import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client.ts";
import {
  organizations, businessProfiles, faqs, playbookSettings,
  agentVersions, phoneNumbers, calls,
} from "@/db/schema.ts";
import { renderBusinessKnowledge } from "@/lib/business_knowledge.ts";
import { buildSessionPayload } from "@/lib/session.ts";
import { verifyVoiceRequest } from "@/lib/voice_auth.ts";

export const dynamic = "force-dynamic";

const WEEKDAYS_HU = ["hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat", "vasárnap"];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const pathWithQuery = `/api/voice/session?${url.searchParams.toString()}`;
  const v = verifyVoiceRequest(req, "GET", pathWithQuery, "");
  if (!v.ok) return NextResponse.json({ ok: false, error: v.reason }, { status: 401 });

  const to = url.searchParams.get("to") ?? "";
  const from = url.searchParams.get("from") ?? "unknown";
  const db = getDb();
  if (!db) return NextResponse.json({ ok: false, error: "db-unavailable" }, { status: 503 });

  let org = null as typeof organizations.$inferSelect | null;
  if (to) {
    const phone = (await db.select().from(phoneNumbers).where(eq(phoneNumbers.e164, to)).limit(1))[0];
    if (phone) {
      org = (await db.select().from(organizations).where(eq(organizations.id, phone.orgId)).limit(1))[0] ?? null;
    }
  }
  if (!org) {
    // Fallback: first org with a live agent (admin hackathon single-tenant).
    const live = (await db.select().from(agentVersions).where(eq(agentVersions.status, "live")).limit(1))[0];
    if (live) org = (await db.select().from(organizations).where(eq(organizations.id, live.orgId)).limit(1))[0] ?? null;
  }
  if (!org) {
    org = (await db.select().from(organizations).limit(1))[0] ?? null;
  }
  if (!org) return NextResponse.json({ ok: false, error: "no-org" }, { status: 404 });

  const profile = (await db.select().from(businessProfiles).where(eq(businessProfiles.orgId, org.id)).limit(1))[0];
  const allFaqs = await db.select().from(faqs).where(eq(faqs.orgId, org.id));
  const playbooks = (await db.select().from(playbookSettings).where(eq(playbookSettings.orgId, org.id)))
    .filter((p) => p.enabled).map((p) => p.playbook);
  const versions = await db.select().from(agentVersions).where(eq(agentVersions.orgId, org.id));
  const live = versions.find((v) => v.status === "live") ?? versions[0];
  const cfg = (live?.config ?? {}) as { keywords?: string[]; voiceId?: string };
  const knowledge = renderBusinessKnowledge(
    (profile?.profile ?? null) as Parameters<typeof renderBusinessKnowledge>[0],
    allFaqs,
    { fallbackName: org.name },
  );

  const keywords = [
    ...(cfg.keywords ?? []),
    b.name ?? org.name,
    ...(b.services ?? []).map((s) => s.name ?? ""),
  ].filter(Boolean).slice(0, 40);

  const now = new Date();
  const payload = buildSessionPayload({
    orgId: org.id,
    businessName: b.name ?? org.name,
    timezone: org.timezone,
    knowledge,
    playbooks: playbooks.length ? playbooks : ["hours", "take_message", "knowledge_gap"],
    bookingAllowed: playbooks.includes("booking") || true,
    transferAllowed: false,
    blocklist: [],
    keywords,
    voiceId:
      cfg.voiceId ||
      process.env.ELEVENLABS_VOICE_ID_HU ||
      process.env.ELEVENLABS_VOICE_ID ||
      "",
    agentVersionId: live?.id ?? "",
    draft: live?.status !== "live",
  }, {
    channel: "phone",
    callerNumber: from,
    nowIso: now.toISOString(),
    weekdayHu: WEEKDAYS_HU[now.getDay() === 0 ? 6 : now.getDay() - 1],
  });

  const call = await db.insert(calls).values({
    orgId: org.id,
    agentVersionId: live?.id ?? null,
    channel: "phone",
    fromE164: from,
    toE164: to || null,
    language: "en",
  }).returning({ id: calls.id });

  return NextResponse.json({
    ok: true,
    callId: call[0]?.id,
    ...payload,
    greeting: payload.greetingEn, // hackathon demo: English callers
    models: {
      live: process.env.MODEL_LIVE ?? "muse-spark-1.3",
      stt: process.env.MODEL_STT ?? "muse-voice-transcribe-1.0",
    },
  });
}
