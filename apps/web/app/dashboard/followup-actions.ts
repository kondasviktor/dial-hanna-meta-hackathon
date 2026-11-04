"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db/client.ts";
import { callOutcomes, calls } from "@/db/schema.ts";
import { isFollowupStatus } from "@/lib/outcomes.ts";
import { requireAdmin, resolveOrgId } from "@/lib/org.ts";

/** Owner tri-states a follow-up: done (handled) / dismissed (no action) / open. */
export async function setFollowupStatus(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin.ok) throw new Error("forbidden");
  const orgRes = await resolveOrgId();
  if (!orgRes.orgUuid) throw new Error("org-required");
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL-unset");
  const callId = String(formData.get("callId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!callId || !isFollowupStatus(status)) throw new Error("bad-status");
  // Only the owning org's rows may change state.
  const call = (
    await db.select({ id: calls.id }).from(calls).where(and(eq(calls.id, callId), eq(calls.orgId, orgRes.orgUuid))).limit(1)
  )[0];
  if (!call) throw new Error("call-not-found");
  await db.update(callOutcomes).set({ ownerStatus: status }).where(eq(callOutcomes.callId, callId));
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/calls/${callId}`);
}
