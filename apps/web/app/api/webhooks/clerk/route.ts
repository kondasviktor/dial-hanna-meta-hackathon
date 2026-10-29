import { Webhook } from "svix";
import { getDb } from "@/db/client.ts";
import {
  isSupportedClerkEvent,
  provisionOrganization,
  renameOrganization,
  deleteOrganizationData,
} from "@/lib/clerk_webhook.ts";

export const dynamic = "force-dynamic";

interface ClerkPayload {
  type: string;
  data: { id?: string; name?: string };
}

export async function POST(req: Request) {
  const secret = process.env.CLERK_SIGNING_SECRET ?? process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) return Response.json({ ok: false, reason: "webhook-secret-unset" }, { status: 500 });
  const db = getDb();
  if (!db) return Response.json({ ok: false, reason: "DATABASE_URL-unset" }, { status: 500 });

  const raw = await req.text();
  try {
    // svix v2 verify() returns undefined on success and throws on failure.
    new Webhook(secret).verify(raw, {
      "svix-id": req.headers.get("svix-id") ?? "",
      "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
      "svix-signature": req.headers.get("svix-signature") ?? "",
    });
  } catch {
    return Response.json({ ok: false, reason: "bad-signature" }, { status: 400 });
  }
  let evt: ClerkPayload;
  try {
    evt = JSON.parse(raw) as ClerkPayload;
  } catch {
    return Response.json({ ok: false, reason: "bad-payload" }, { status: 400 });
  }

  if (!isSupportedClerkEvent(evt.type)) return Response.json({ ok: true, ignored: evt.type });
  const orgId = evt.data?.id;
  if (!orgId) return Response.json({ ok: false, reason: "missing-org-id" }, { status: 400 });

  if (evt.type === "organization.created") {
    await provisionOrganization(db, { id: orgId, name: evt.data?.name ?? "" });
  } else if (evt.type === "organization.updated") {
    await renameOrganization(db, { id: orgId, name: evt.data?.name ?? "" });
  } else {
    await deleteOrganizationData(db, orgId);
  }
  return Response.json({ ok: true, handled: evt.type });
}
