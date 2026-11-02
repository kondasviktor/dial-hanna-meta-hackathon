/** ElevenLabs Flash TTS helpers for Dial Hanna. */

export async function synthesizeSpeech(text: string): Promise<ArrayBuffer> {
  const key = process.env.ELEVENLABS_API_KEY?.trim();
  const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim();
  if (!key || !voiceId) throw new Error("elevenlabs-unset");

  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": key,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: text.slice(0, 2500),
      model_id: "eleven_flash_v2_5",
    }),
  });
  if (!r.ok) {
    throw new Error(`elevenlabs-http-${r.status}:${(await r.text()).slice(0, 200)}`);
  }
  return await r.arrayBuffer();
}

export function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "https://dialhanna.com"
  ).replace(/\/$/, "");
}
