// Dashboard server queries (Neon via getDb). Thin selects; shaping stays pure
// so it is unit-testable without a database.

import { eq, desc } from "drizzle-orm";
import { getDb } from "./client.ts";
import {
  organizations, calls, callOutcomes, knowledgeGaps, agentVersions, bookings,
} from "./schema.ts";

export interface DashboardCall {
  id: string;
  startedAt: string | null;
  channel: string;
  from: string | null;
  language: string | null;
  intent: string | null;
  outcome: string | null;
  nextActionHu: string | null;
  ownerStatus: string | null;
}

export async function getDashboard(clerkOrgId: string) {
  const db = getDb();
  if (!db) return null;
  const org = (await db.select().from(organizations).where(eq(organizations.clerkOrgId, clerkOrgId)).limit(1))[0];
  if (!org) return null;
  const recentCalls = await db.select().from(calls).where(eq(calls.orgId, org.id)).orderBy(desc(calls.startedAt)).limit(20);
  const outcomes = await db.select().from(callOutcomes);
  const byCall = new Map(outcomes.map((o) => [o.callId, o]));
  const shaped: DashboardCall[] = recentCalls.map((c) => {
    const o = byCall.get(c.id);
    const na = (o?.nextAction ?? {}) as { summary_hu?: string };
    return {
      id: c.id, startedAt: c.startedAt?.toISOString() ?? null, channel: c.channel,
      from: c.fromE164, language: c.language, intent: o?.intent ?? null,
      outcome: o?.outcome ?? null, nextActionHu: na.summary_hu ?? null,
      ownerStatus: o?.ownerStatus ?? null,
    };
  });
  const gaps = await db.select().from(knowledgeGaps).where(eq(knowledgeGaps.orgId, org.id)).orderBy(desc(knowledgeGaps.id)).limit(20);
  const versions = await db.select().from(agentVersions).where(eq(agentVersions.orgId, org.id));
  const live = versions.find((v) => v.status === "live") ?? versions[0] ?? null;
  const today = new Date().toISOString().slice(0, 10);
  const todaysCalls = shaped.filter((c) => (c.startedAt ?? "").slice(0, 10) === today);
  const openActions = shaped.filter((c) => c.ownerStatus === "open" && c.nextActionHu);
  const openGaps = gaps.filter((g) => g.status === "open" || g.status === "answered");
  return {
    org: { id: org.id, name: org.name, plan: org.plan },
    todaysCalls: todaysCalls.length,
    openActions: openActions.map((c) => ({ id: c.id, summary: c.nextActionHu! })),
    recent: shaped.slice(0, 10),
    gaps: openGaps.map((g) => ({ id: g.id, question: g.question, context: g.context, status: g.status })),
    live: live ? { id: live.id, status: live.status, readinessScore: live.readinessScore } : null,
  };
}

export async function getCallDetail(callId: string) {
  const db = getDb();
  if (!db) return null;
  const c = (await db.select().from(calls).where(eq(calls.id, callId)).limit(1))[0];
  if (!c) return null;
  const o = (await db.select().from(callOutcomes).where(eq(callOutcomes.callId, callId)).limit(1))[0];
  const b = await db.select().from(bookings).where(eq(bookings.callId, callId));
  return { call: c, outcome: o ?? null, bookings: b };
}
