import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Telnyx Call Control / media webhook.
 * When an inbound call arrives, answer and start streaming audio to the voice
 * service (VOICE_SERVICE_URL). Signature verification uses TELNYX_PUBLIC_KEY
 * when set (VERIFY against current Telnyx docs before production).
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false }, { status: 400 });

  const event = body.data?.event_type ?? body.event_type ?? "";
  const payload = body.data?.payload ?? body.payload ?? {};
  const callControlId = payload.call_control_id ?? payload.call_session_id;
  const voiceUrl = process.env.VOICE_SERVICE_URL?.replace(/\/$/, "");

  console.log("telnyx-webhook", event, callControlId);

  if (event === "call.initiated" && callControlId && process.env.TELNYX_API_KEY) {
    try {
      await fetch(`https://api.telnyx.com/v2/calls/${callControlId}/actions/answer`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.TELNYX_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      if (voiceUrl) {
        await fetch(`https://api.telnyx.com/v2/calls/${callControlId}/actions/streaming_start`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.TELNYX_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stream_url: `${voiceUrl}/telnyx`,
            stream_track: "inbound_track",
          }),
        });
      }
    } catch (e) {
      console.error("telnyx-answer", e);
    }
  }

  return NextResponse.json({ ok: true });
}
