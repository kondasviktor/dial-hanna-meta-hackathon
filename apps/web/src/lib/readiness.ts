// Test Suite readiness score (Master Spec §6.10).
// score = weighted pass rate × 100; any hard-fail caps the score at 50.
// Status `tested` requires score ≥ 80; publish allowed from `tested` only
// (owner override with warning).

export interface ScenarioResult {
  scenarioId: string;
  pass: boolean;
  hardFail: boolean;
  locked: boolean; // locked scenarios weigh 2×, generated 1×
}

export const TESTED_THRESHOLD = 80;
export const HARD_FAIL_CAP = 50;

export function readinessScore(results: ScenarioResult[]): {
  score: number;
  passed: number;
  total: number;
  hardFails: string[];
  testable: boolean;
} {
  if (results.length === 0) {
    return { score: 0, passed: 0, total: 0, hardFails: [], testable: false };
  }
  let wPass = 0;
  let wTotal = 0;
  let nPass = 0;
  const hardFails: string[] = [];
  for (const r of results) {
    const w = r.locked ? 2 : 1;
    wTotal += w;
    if (r.pass) {
      wPass += w;
      nPass += 1;
    }
    if (r.hardFail) hardFails.push(r.scenarioId);
  }
  let score = Math.round((wPass / wTotal) * 100);
  if (hardFails.length > 0) score = Math.min(score, HARD_FAIL_CAP);
  return { score, passed: nPass, total: results.length, hardFails, testable: score >= TESTED_THRESHOLD };
}
