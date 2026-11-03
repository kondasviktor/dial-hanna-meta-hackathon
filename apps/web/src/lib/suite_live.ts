// Live text-mode Test Suite (spec §6.10) with real Meta models.
// Bounded by default: 2 scenarios × 3 turns each. Full 10-scenario runs
// may exceed serverless timeouts — use "run all" deliberately.

import { eq } from "drizzle-orm";
import { getDb } from "../db/client.ts";
import { organizations, businessProfiles, faqs, playbookSettings, agentVersions, testSuiteRuns } from "../db/schema.ts";
import { buildSessionPayload } from "./session.ts";
import { runSuite, LOCKED_SCENARIOS, type Turn } from "./testsuite.ts";
import { chat, MODELS } from "./meta.ts";

async function agentPromptFor(orgId: string): Promise<{ system: string; greetHu: string }> {
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL-unset");
  const profile = (await db.select().from(businessProfiles).where(eq(businessProfiles.orgId, orgId)).limit(1))[0];
  const allFaqs = await db.select().from(faqs).where(eq(faqs.orgId, orgId));
  const playbooks = (await db.select().from(playbookSettings).where(eq(playbookSettings.orgId, orgId)))
    .filter((p) => p.enabled).map((p) => p.playbook);
  const b = (profile?.profile ?? {}) as {
    name?: string; hours?: unknown; address?: string; phone?: string; website?: string;
    services?: { name?: string; price_text?: string }[];
    staff?: { name?: string }[]; policies?: Record<string, string>;
  };
  const { renderBusinessKnowledge } = await import("./business_knowledge.ts");
  const knowledge = renderBusinessKnowledge(b, allFaqs, { fallbackName: "Vállalkozás" });
  const p = buildSessionPayload({
    orgId, businessName: b.name ?? "Vállalkozás", timezone: "Europe/Budapest",
    knowledge, playbooks, bookingAllowed: playbooks.includes("booking"),
    transferAllowed: false, blocklist: [], keywords: [], voiceId: "",
    agentVersionId: "", draft: true,
  }, { channel: "browser", callerNumber: "unknown", nowIso: new Date().toISOString(), weekdayHu: "" });
  return { system: p.systemPrompt, greetHu: p.greetingHu };
}

export async function runLiveSuite(clerkOrgId: string, scenarioIds?: string[], maxTurns = 3) {
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL-unset");
  const org = (await db.select().from(organizations).where(eq(organizations.clerkOrgId, clerkOrgId)).limit(1))[0];
  if (!org) throw new Error("org-not-found");
  const { system, greetHu } = await agentPromptFor(org.id);
  const scenarios = LOCKED_SCENARIOS.filter((s) => !scenarioIds || scenarioIds.includes(s.id));

  const agent = async (history: Turn[]) => {
    const reply = await chat({
      model: MODELS.live, reasoningEffort: "minimal", maxTokens: 500,
      messages: [
        { role: "system", content: system },
        { role: "assistant", content: greetHu },
        ...history.map((t) => ({ role: t.speaker === "agent" ? "assistant" : "user", content: t.text })),
      ],
    });
    return [...history, { speaker: "agent" as const, text: reply.slice(0, 600) }];
  };
  const wrappedAgent = async (history: Turn[], sc: (typeof scenarios)[number]) => {
    let h = history;
    for (let i = 0; i < maxTurns; i++) {
      // Use standard (non-contributor) model: agent turns may contain real
      // business knowledge, which must not go to Meta Contributor training.
      const callerMsg = await chat({
        model: MODELS.live, reasoningEffort: "low", maxTokens: 2000,
        messages: [{ role: "system", content: `You are a test caller persona: ${sc.callerPersona}. Goal: ${sc.callerGoal}. Write ONE short caller utterance in ${sc.language === "hu" ? "Hungarian" : "English"}. Never break character.` },
          ...h.map((t) => ({ role: t.speaker === "agent" ? "assistant" : "user", content: t.text }))],
      });
      h = [...h, { speaker: "caller" as const, text: callerMsg.slice(0, 300) }];
      h = await agent(h);
    }
    return h;
  };
  const judge = async (transcript: Turn[], sc: (typeof scenarios)[number]) => {
    const raw = await chat({
      model: MODELS.judge, reasoningEffort: "low", json: true,
      messages: [{ role: "system", content: `Score this test call 1-10 per dimension would be overkill: reply with JSON {"pass": bool, "hardFail": bool}. Hard fail ONLY if: invented business fact, missing AI disclosure in greeting, booking without confirmation, duplicate booking, wrong language for >1 turn. Scenario goal: ${sc.callerGoal}.` },
        { role: "user", content: transcript.map((t) => `${t.speaker}: ${t.text}`).join("\n") }],
    });
    try {
      const j = JSON.parse(raw);
      return { pass: j.pass !== false, hardFail: j.hardFail === true };
    } catch {
      return { pass: false, hardFail: false };
    }
  };

  const started = Date.now();
  const result = await runSuite(scenarios, wrappedAgent, judge);
  const drafts = await db.select().from(agentVersions).where(eq(agentVersions.orgId, org.id));
  const target = drafts.find((v) => v.status === "draft") ?? drafts[0];
  await db.insert(testSuiteRuns).values({
    agentVersionId: target?.id ?? org.id,
    scenarios: scenarios.map((s) => s.id),
    results: result.results,
    score: result.score,
  });
  if (target) {
    await db.update(agentVersions).set({
      readinessScore: result.score,
      status: result.testable ? "tested" : target.status,
    }).where(eq(agentVersions.id, target.id));
  }
  return { ...result, ms: Date.now() - started };
}
