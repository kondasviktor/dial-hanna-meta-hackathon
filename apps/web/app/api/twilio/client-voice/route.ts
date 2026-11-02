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
  // Softphone Meta demo is English; HU DID uses Telnyx.
  const xml = on ? dialHannaTwiml("en") : hannaPausedTwiml("en");
  return new NextResponse(xml, {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

export async function GET() {
  return POST();
}
