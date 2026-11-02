import { synthesizeSpeech } from "@/lib/elevenlabs.ts";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/** Twilio <Play> target — returns mp3 for Dial Hanna's ElevenLabs voice. */
export async function GET(req: Request) {
  const text = new URL(req.url).searchParams.get("text")?.trim();
  if (!text) {
    return new Response("text required", { status: 400 });
  }
  try {
    const audio = await synthesizeSpeech(text);
    return new Response(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("twilio-tts", e);
    return new Response(String(e), { status: 502 });
  }
}
