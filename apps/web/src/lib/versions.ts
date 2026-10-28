// Agent versioning (Master Spec §6.11).
// draft → tested → live → archived. One live per org. Publish = atomic swap.
// Rollback = re-publish previous archived version. Calls record version id.

export type VersionStatus = "draft" | "tested" | "live" | "archived";

export interface AgentVersion {
  id: string;
  orgId: string;
  status: VersionStatus;
  readinessScore?: number;
  rollbackFrom?: string;
}

// Publish allowed from `tested` only (owner override with warning).
export function canPublish(v: AgentVersion, ownerOverride = false): { ok: boolean; reason?: string } {
  if (v.status === "live") return { ok: false, reason: "already-live" };
  if (v.status === "tested") return { ok: true };
  if (v.status === "draft" && ownerOverride) return { ok: true, reason: "override-untested" };
  return { ok: false, reason: `status-${v.status}-not-publishable` };
}

export function publish(
  versions: AgentVersion[],
  orgId: string,
  versionId: string,
  ownerOverride = false,
): { versions: AgentVersion[]; publishedId: string; warning?: string } {
  const target = versions.find((v) => v.id === versionId && v.orgId === orgId);
  if (!target) throw new Error("version-not-found");
  const check = canPublish(target, ownerOverride);
  if (!check.ok) throw new Error(check.reason);
  const prevLive = versions.find((v) => v.orgId === orgId && v.status === "live");
  const next = versions.map((v) => {
    if (v.orgId !== orgId) return v;
    if (v.id === versionId) {
      return { ...v, status: "live" as const, publishedAt: undefined, rollbackFrom: prevLive?.id };
    }
    if (v.status === "live") return { ...v, status: "archived" as const };
    return v;
  });
  return {
    versions: next,
    publishedId: versionId,
    warning: check.reason === "override-untested" ? "publishing untested version" : undefined,
  };
}

export function rollback(versions: AgentVersion[], orgId: string): { versions: AgentVersion[]; publishedId: string } {
  const live = versions.find((v) => v.orgId === orgId && v.status === "live");
  if (!live?.rollbackFrom) throw new Error("nothing-to-rollback");
  const prev = versions.find((v) => v.id === live.rollbackFrom);
  if (!prev) throw new Error("rollback-target-missing");
  const next = versions.map((v) => {
    if (v.orgId !== orgId) return v;
    if (v.id === prev.id) return { ...v, status: "live" as const, rollbackFrom: live.id };
    if (v.id === live.id) return { ...v, status: "archived" as const };
    return v;
  });
  return { versions: next, publishedId: prev.id };
}
