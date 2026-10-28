// Tenant resolution (Master Spec §6.5).
// Phone: called number (to) → phone_numbers.e164 → org → live agent version.
//   Unknown number → generic close + alert (never a wrong-tenant greeting).
// Browser: short-lived token carrying org_id + agent_version_id (draft testable).
// Public judge demo: fixed demo tenant, rate-limited.

export interface NumberBinding {
  e164: string;
  orgId: string;
  liveVersionId: string;
}

export interface BrowserToken {
  orgId: string;
  agentVersionId: string;
  expiresAt: number; // epoch seconds
}

export type Resolution =
  | { kind: "tenant"; orgId: string; agentVersionId: string; draft: boolean }
  | { kind: "unknown_number" }
  | { kind: "expired_token" };

export function resolveByNumber(to: string, bindings: NumberBinding[]): Resolution {
  const digits = to.replace(/\D/g, "");
  const hit = bindings.find((b) => b.e164.replace(/\D/g, "") === digits);
  if (!hit) return { kind: "unknown_number" };
  return { kind: "tenant", orgId: hit.orgId, agentVersionId: hit.liveVersionId, draft: false };
}

export function resolveByToken(token: BrowserToken, nowS: number): Resolution {
  if (token.expiresAt <= nowS) return { kind: "expired_token" };
  return { kind: "tenant", orgId: token.orgId, agentVersionId: token.agentVersionId, draft: true };
}

// Demo-tenant guard: max calls per IP per day, max minutes per call.
export function demoAllowed(
  callsToday: number,
  durationMin: number,
  maxCallsPerDay = 10,
  maxMinPerCall = 5,
): boolean {
  return callsToday < maxCallsPerDay && durationMin <= maxMinPerCall;
}
