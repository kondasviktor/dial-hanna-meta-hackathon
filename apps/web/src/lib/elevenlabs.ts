/** ElevenLabs Flash TTS for Hanna — separate EN / HU library voices. */

export type TtsLang = "hu" | "en";

/** Vivianna — Hungarian standard, conversational (library). */
export const DEFAULT_VOICE_HU = "9QppwToemG29A6UTSbwz";
/** Sarah — soft English premade (always available). */
export const DEFAULT_VOICE_EN = "EXAVITQu4vr4xnSDxMaL";

export function detectTtsLang(text: string): TtsLang {
  return /[áéíóöőúüűÁÉÍÓÖŐÚÜŰ]/.test(text) ? "hu" : "en";
}

export function resolveVoiceId(lang: TtsLang): string {
  const shared = process.env.ELEVENLABS_VOICE_ID?.trim();
  if (lang === "hu") {
    return (
      process.env.ELEVENLABS_VOICE_ID_HU?.trim() ||
      shared ||
      DEFAULT_VOICE_HU
    );
  }
  return (
    process.env.ELEVENLABS_VOICE_ID_EN?.trim() ||
    shared ||
    DEFAULT_VOICE_EN
  );
}

export async function synthesizeSpeech(
  text: string,
  opts?: { lang?: TtsLang; voiceId?: string },
): Promise<ArrayBuffer> {
  const key = process.env.ELEVENLABS_API_KEY?.trim();
  if (!key) throw new Error("elevenlabs-unset");

  const lang = opts?.lang ?? detectTtsLang(text);
  const voiceId = opts?.voiceId?.trim() || resolveVoiceId(lang);

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
      // Forces Hungarian phonetics; without this a non-HU voice drifts badly.
      language_code: lang,
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
