import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Twilio "A call comes in" webhook.
 * Returns TwiML: if VOICE_SERVICE_URL is set, bidirectionally stream audio
 * to the voice service; otherwise play a short placeholder so the DID works.
 */
export async function POST() {
  const voiceUrl = process.env.VOICE_SERVICE_URL?.replace(/\/$/, "");
  // Twilio Media Streams require wss://
  const streamBase = voiceUrl
    ?.replace(/^https:/i, "wss:")
    .replace(/^http:/i, "ws:");

  const twiml = streamBase
    ? `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${streamBase}/twilio" />
  </Connect>
</Response>`
    : `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">Hi, this is Dial Hanna. The voice service is not connected yet.</Say>
</Response>`;

  return new NextResponse(twiml, {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

export async function GET() {
  return POST();
}
