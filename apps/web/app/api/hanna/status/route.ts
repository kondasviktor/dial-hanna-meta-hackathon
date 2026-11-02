import { NextResponse } from "next/server";
import { resolveOrgId } from "@/lib/org.ts";
import { getHannaEnabled, setHannaEnabled } from "@/lib/hanna_status.ts";

export const dynamic = "force-dynamic";

export async function GET() {
  const { orgUuid } = await resolveOrgId();
  const enabled = await getHannaEnabled(orgUuid);
  return NextResponse.json({ enabled });
}

export async function POST(req: Request) {
  const { orgUuid } = await resolveOrgId();
  if (!orgUuid) {
    return NextResponse.json({ ok: false, error: "no_org" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as { enabled?: boolean } | null;
  if (typeof body?.enabled !== "boolean") {
    return NextResponse.json({ ok: false, error: "bad_body" }, { status: 400 });
  }
  await setHannaEnabled(orgUuid, body.enabled);
  return NextResponse.json({ ok: true, enabled: body.enabled });
}
