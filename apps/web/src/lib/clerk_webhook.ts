// Clerk webhook handling — organization lifecycle → Neon tenant rows.
// Supported: organization.created / .updated / .deleted. User events are
// intentionally ignored: there is no per-user table, the tenant root is
// organizations(clerk_org_id).

import { eq, inArray } from "drizzle-orm";
import { getDb } from "../db/client.ts";
import {
  organizations, businessProfiles, knowledgeSources, faqs,
  playbookSettings, agentVersions, phoneNumbers, calls, callOutcomes,
  knowledgeGaps, bookings, contacts, integrations, testSuiteRuns,
  usageLedger,
} from "../db/schema.ts";

type Db = NonNullable<ReturnType<typeof getDb>>;

export const SUPPORTED_CLERK_EVENTS = [
  "organization.created",
  "organization.updated",
  "organization.deleted",
] as const;

export type SupportedClerkEvent = (typeof SUPPORTED_CLERK_EVENTS)[number];

export function isSupportedClerkEvent(t: string): t is SupportedClerkEvent {
  return (SUPPORTED_CLERK_EVENTS as readonly string[]).includes(t);
}

export interface ClerkOrgData {
  id: string;
  name: string;
}

export async function provisionOrganization(db: Db, org: ClerkOrgData): Promise<string> {
  const name = org.name?.trim() || "Névtelen vállalkozás";
  await db.insert(organizations)
    .values({ clerkOrgId: org.id, name, plan: "trial" })
    .onConflictDoNothing({ target: organizations.clerkOrgId });
  const row = (await db.select({ id: organizations.id })
    .from(organizations).where(eq(organizations.clerkOrgId, org.id)).limit(1))[0];
  if (!row) throw new Error("org-provision-failed");
  return row.id;
}

export async function renameOrganization(db: Db, org: ClerkOrgData): Promise<void> {
  const name = org.name?.trim() || "Névtelen vállalkozás";
  await db.update(organizations).set({ name }).where(eq(organizations.clerkOrgId, org.id));
}

export async function deleteOrganizationData(db: Db, clerkOrgId: string): Promise<void> {
  const row = (await db.select({ id: organizations.id })
    .from(organizations).where(eq(organizations.clerkOrgId, clerkOrgId)).limit(1))[0];
  if (!row) return;
  const orgId = row.id;
  const callRows = await db.select({ id: calls.id }).from(calls).where(eq(calls.orgId, orgId));
  const callIds = callRows.map((c) => c.id);
  if (callIds.length > 0) {
    await db.delete(callOutcomes).where(inArray(callOutcomes.callId, callIds));
    await db.delete(bookings).where(inArray(bookings.callId, callIds));
    await db.delete(usageLedger).where(inArray(usageLedger.callId, callIds));
    await db.delete(calls).where(inArray(calls.id, callIds));
  }
  const verRows = await db.select({ id: agentVersions.id }).from(agentVersions).where(eq(agentVersions.orgId, orgId));
  const verIds = verRows.map((v) => v.id);
  if (verIds.length > 0) {
    await db.delete(testSuiteRuns).where(inArray(testSuiteRuns.agentVersionId, verIds));
    await db.delete(agentVersions).where(inArray(agentVersions.id, verIds));
  }
  await db.delete(businessProfiles).where(eq(businessProfiles.orgId, orgId));
  await db.delete(knowledgeSources).where(eq(knowledgeSources.orgId, orgId));
  await db.delete(faqs).where(eq(faqs.orgId, orgId));
  await db.delete(playbookSettings).where(eq(playbookSettings.orgId, orgId));
  await db.delete(phoneNumbers).where(eq(phoneNumbers.orgId, orgId));
  await db.delete(knowledgeGaps).where(eq(knowledgeGaps.orgId, orgId));
  await db.delete(contacts).where(eq(contacts.orgId, orgId));
  await db.delete(integrations).where(eq(integrations.orgId, orgId));
  await db.delete(organizations).where(eq(organizations.id, orgId));
}
