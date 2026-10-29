// Tenant resolution (Master Spec §6.5).
// Phone: called number (to) → phone_numbers.e164 → org → live agent version.
//   Unknown number → generic close + alert (never a wrong-tenant greeting).
// User-placed browser calls were removed by owner decision (29 Oct 2026):
// no token resolution, no demo-tenant rate limits.

export interface NumberBinding {
  e164: string;
  orgId: string;
  liveVersionId: string;
}

export type Resolution =
  | { kind: "tenant"; orgId: string; agentVersionId: string; draft: boolean }
  | { kind: "unknown_number" };

export function resolveByNumber(to: string, bindings: NumberBinding[]): Resolution {
  const digits = to.replace(/\D/g, "");
  const hit = bindings.find((b) => b.e164.replace(/\D/g, "") === digits);
  if (!hit) return { kind: "unknown_number" };
  return { kind: "tenant", orgId: hit.orgId, agentVersionId: hit.liveVersionId, draft: false };
}
