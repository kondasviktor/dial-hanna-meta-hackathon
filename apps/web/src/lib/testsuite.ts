// Test Suite runner (Master Spec §6.10).
// Text-mode: simulated caller ↔ draft agent config, max 10 turns each.
// Judge scores each run (§7.6); readiness = weighted pass rate (readiness.ts).
// LLM clients are injected: contributor/Spark in production, mocks in tests.
// Audio loop check (numbers/names via TTS→STT) is a separate gate script.

import { readinessScore, type ScenarioResult } from "./readiness.ts";

export interface TestScenario {
  id: string;
  category: string;
  language: "hu" | "en";
  callerPersona: string;
  callerGoal: string;
  locked: boolean;
  maxTurns?: number;
}

export interface Turn {
  speaker: "caller" | "agent";
  text: string;
}

export type AgentFn = (history: Turn[], scenario: TestScenario) => Promise<Turn[]>;
export type JudgeFn = (transcript: Turn[], scenario: TestScenario) => Promise<{
  pass: boolean;
  hardFail: boolean;
}>;

export const MAX_TURNS_EACH = 10;

export async function runSuite(
  scenarios: TestScenario[],
  agent: AgentFn,
  judge: JudgeFn,
): Promise<{
  results: ScenarioResult[];
  transcripts: Record<string, Turn[]>;
  score: number;
  testable: boolean;
}> {
  const results: ScenarioResult[] = [];
  const transcripts: Record<string, Turn[]> = {};
  for (const s of scenarios) {
    const transcript = await agent([], s);
    // Cap: max 10 turns each side.
    const capped = transcript.filter((t) => t.speaker === "caller" || t.speaker === "agent").slice(0, MAX_TURNS_EACH * 2);
    transcripts[s.id] = capped;
    const j = await judge(capped, s);
    results.push({ scenarioId: s.id, pass: j.pass, hardFail: j.hardFail, locked: s.locked });
  }
  const { score, testable } = readinessScore(results);
  return { results, transcripts, score, testable };
}

// The 10 locked scenarios (§6.10). Generated tenant-specific variants (10)
// come from Wonder at run time.
export const LOCKED_SCENARIOS: TestScenario[] = [
  { id: "hours", category: "faq", language: "hu", callerPersona: "elfoglalt anyuka", callerGoal: "nyitvatartás megtudása", locked: true },
  { id: "price", category: "faq", language: "hu", callerPersona: "árérzékeny diák", callerGoal: "árkérdés", locked: true },
  { id: "book", category: "booking", language: "hu", callerPersona: "dolgozó férfi", callerGoal: "péntek délutáni időpont", locked: true },
  { id: "cancel_reschedule", category: "booking", language: "hu", callerPersona: "idős néni", callerGoal: "lemondás/áttétel", locked: true },
  { id: "unknown_question", category: "gap", language: "hu", callerPersona: "kíváncsi vevő", callerGoal: "ismeretlen kérdés (parkolás)", locked: true },
  { id: "transfer", category: "transfer", language: "hu", callerPersona: "türelmetlen vállalkozó", callerGoal: "tulajdonossal beszélne", locked: true },
  { id: "angry", category: "complaint", language: "hu", callerPersona: "dühös ügyfél", callerGoal: "panasz, várakozás", locked: true },
  { id: "english_caller", category: "language", language: "en", callerPersona: "tourist", callerGoal: "booking in English", locked: true },
  { id: "wrong_number", category: "close", language: "hu", callerPersona: "téves hívó", callerGoal: "gyógyszertárat keres", locked: true },
  { id: "phone_number", category: "entity", language: "hu", callerPersona: "visszahívást kérő", callerGoal: "telefonszám bediktálása", locked: true },
];
