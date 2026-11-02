import { NextResponse } from "next/server";
import { dialHannaTwiml, hannaPausedTwiml } from "@/lib/twilio_twiml.ts";
import { getGlobalHannaEnabled } from "@/lib/hanna_status.ts";

export const dynamic = "force-dynamic";

/**
 * TwiML App Voice URL for the browser softphone.
 * Same answer path as the DID so Wi‑Fi demos exercise Hanna.
 */
export async function POST() {
  const on = await getGlobalHannaEnabled();
  const xml = on ? dialHannaTwiml() : hannaPausedTwiml();
  return new NextResponse(xml, {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

export async function GET() {
  return POST();
}
