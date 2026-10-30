import { NextResponse } from "next/server";
import twilio from "twilio";
import { requireAdmin } from "@/lib/org.ts";

export const dynamic = "force-dynamic";

/** Short-lived Voice Access Token for the admin softphone. */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const apiKey = process.env.TWILIO_API_KEY_SID;
  const apiSecret = process.env.TWILIO_API_KEY_SECRET;
  const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;

  if (!accountSid || !apiKey || !apiSecret || !twimlAppSid) {
    return NextResponse.json(
      { error: "twilio-softphone-env-missing" },
      { status: 500 },
    );
  }

  const identity = `admin_${(admin.email ?? "owner").replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 100)}`;
  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  const token = new AccessToken(accountSid, apiKey, apiSecret, {
    identity,
    ttl: 3600,
  });
  token.addGrant(
    new VoiceGrant({
      outgoingApplicationSid: twimlAppSid,
      incomingAllow: false,
    }),
  );

  return NextResponse.json({
    token: token.toJwt(),
    identity,
    to: process.env.TWILIO_PHONE_NUMBER ?? "",
  });
}
