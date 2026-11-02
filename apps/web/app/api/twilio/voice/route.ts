import { NextResponse } from "next/server";
import { dialHannaTwiml, hannaPausedTwiml } from "@/lib/twilio_twiml.ts";
import { getGlobalHannaEnabled } from "@/lib/hanna_status.ts";

export const dynamic = "force-dynamic";

/** Twilio "A call comes in" webhook for the purchased DID (US demo → English). */
export async function POST() {
  const on = await getGlobalHannaEnabled();
  const xml = on ? dialHannaTwiml("en") : hannaPausedTwiml("en");
  return new NextResponse(xml, {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

export async function GET() {
  return POST();
}
