import { detectTtsLang, synthesizeSpeech, type TtsLang } from "@/lib/elevenlabs.ts";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/** Twilio <Play> target — returns mp3 for Hanna's ElevenLabs voice (EN or HU). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const text = url.searchParams.get("text")?.trim();
  if (!text) {
    return new Response("text required", { status: 400 });
  }
  const langParam = url.searchParams.get("lang")?.toLowerCase();
  const lang: TtsLang =
    langParam === "hu" || langParam === "en" ? langParam : detectTtsLang(text);

  try {
    const audio = await synthesizeSpeech(text, { lang });
    // Short canned lines (fillers / retries) can be edge-cached; long replies stay fresh.
    const cacheable = text.length <= 48;
    return new Response(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": cacheable
          ? "public, max-age=604800, stale-while-revalidate=86400"
          : "no-store",
      },
    });
  } catch (e) {
    console.error("twilio-tts", e);
    return new Response(String(e), { status: 502 });
  }
}
