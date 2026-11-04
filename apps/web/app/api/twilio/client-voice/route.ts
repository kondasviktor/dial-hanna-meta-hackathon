import { NextResponse } from "next/server";
import { dialHannaTwiml, hannaPausedTwiml } from "@/lib/twilio_twiml.ts";
import { getGlobalHannaEnabled } from "@/lib/hanna_status.ts";
import { resolveCallOrg } from "@/lib/org.ts";

export const dynamic = "force-dynamic";

/**
 * TwiML App Voice URL for the browser softphone.
 * Same answer path as the DID so Wi‑Fi demos exercise Hanna.
 */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const orgParam = String(form?.get("OrgId") ?? form?.get("orgId") ?? "").trim();
  const to = String(form?.get("To") ?? form?.get("Called") ?? "").trim();
  const langRaw = String(form?.get("Lang") ?? form?.get("lang") ?? "en").toLowerCase();
  const lang = langRaw === "hu" ? "hu" : "en";
  const org = await resolveCallOrg({ orgId: orgParam || null, toE164: to || null });

  const on = await getGlobalHannaEnabled();
  // Softphone language follows dashboard ?lang= (EN Meta / HU demo). Telnyx DID is separate.
  const xml = on
    ? dialHannaTwiml(lang, { orgId: org?.id ?? (orgParam || null) })
    : hannaPausedTwiml(lang);
  return new NextResponse(xml, {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

export async function GET(req: Request) {
  return POST(req);
}
