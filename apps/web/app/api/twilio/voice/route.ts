import { NextResponse } from "next/server";
import { dialHannaTwiml } from "@/lib/twilio_twiml.ts";

export const dynamic = "force-dynamic";

/** Twilio "A call comes in" webhook for the purchased DID. */
export async function POST() {
  return new NextResponse(dialHannaTwiml(), {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

export async function GET() {
  return POST();
}
