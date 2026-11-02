import { NextResponse } from "next/server";
import { getGlobalHannaEnabled } from "@/lib/hanna_status.ts";

export const dynamic = "force-dynamic";

/**
 * Telnyx Call Control webhook (HU DID).
 * Wired for post-hackathon / HU demo; Meta video uses Twilio softphone.
 * Signature verification with TELNYX_PUBLIC_KEY can be tightened later.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false }, { status: 400 });

  const event = body.data?.event_type ?? body.event_type ?? "";
  const payload = body.data?.payload ?? body.payload ?? {};
  const callControlId = payload.call_control_id ?? payload.call_session_id;
  const voiceUrl = process.env.VOICE_SERVICE_URL?.replace(/\/$/, "");
  const apiKey = process.env.TELNYX_API_KEY;

  console.log("telnyx-webhook", event, callControlId);

  if (event === "call.initiated" && callControlId && apiKey) {
    try {
      const hannaOn = await getGlobalHannaEnabled();
      await fetch(`https://api.telnyx.com/v2/calls/${callControlId}/actions/answer`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      if (!hannaOn) {
        await fetch(`https://api.telnyx.com/v2/calls/${callControlId}/actions/speak`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payload:
              "Köszönjük a hívást. A Dial Hanna jelenleg szünetel. Kérjük, hívjon vissza később.",
            voice: "female",
            language: "hu-HU",
          }),
        });
        await fetch(`https://api.telnyx.com/v2/calls/${callControlId}/actions/hangup`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });
      } else if (voiceUrl) {
        await fetch(`https://api.telnyx.com/v2/calls/${callControlId}/actions/streaming_start`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stream_url: `${voiceUrl}/telnyx`,
            stream_track: "inbound_track",
          }),
        });
      } else {
        // Placeholder speak until voice service + ElevenLabs are live.
        await fetch(`https://api.telnyx.com/v2/calls/${callControlId}/actions/speak`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payload:
              "Hello, this is Dial Hanna. The voice service is not connected yet. Please try again later.",
            voice: "female",
            language: "en-US",
          }),
        });
      }
    } catch (e) {
      console.error("telnyx-answer", e);
    }
  }

  return NextResponse.json({ ok: true });
}
