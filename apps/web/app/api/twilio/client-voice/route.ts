import { NextResponse } from "next/server";
import { dialHannaTwiml } from "@/lib/twilio_twiml.ts";

export const dynamic = "force-dynamic";

/**
 * TwiML App Voice URL for the browser softphone.
 * Same answer path as the DID so Wi‑Fi demos exercise Hanna.
 */
export async function POST() {
  return new NextResponse(dialHannaTwiml(), {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

export async function GET() {
  return POST();
}
