import { appBaseUrl } from "@/lib/elevenlabs.ts";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function playUrl(text: string): string {
  const base = appBaseUrl();
  return `${base}/api/twilio/tts?text=${encodeURIComponent(text)}`;
}

/** Shared TwiML for inbound DID and browser softphone. */
export function dialHannaTwiml(): string {
  const voiceUrl = process.env.VOICE_SERVICE_URL?.replace(/\/$/, "");
  const streamBase = voiceUrl
    ?.replace(/^https:/i, "wss:")
    .replace(/^http:/i, "ws:");

  if (streamBase) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${streamBase}/twilio" />
  </Connect>
</Response>`;
  }

  const greeting =
    "Hi, this is Dial Hanna, the AI receptionist. How can I help you today?";
  const gather = `${appBaseUrl()}/api/twilio/gather`;
  const play = escapeXml(playUrl(greeting));

  // Softphone / DID demo without Fly: ElevenLabs greeting + speech gather → Spark.
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${play}</Play>
  <Gather input="speech" language="en-US" action="${escapeXml(gather)}" method="POST" speechTimeout="auto" timeout="6">
  </Gather>
  <Play>${escapeXml(playUrl("Sorry, I did not catch that. Goodbye for now."))}</Play>
</Response>`;
}

export function replyTwiml(spoken: string, continueGather = true): string {
  const gather = `${appBaseUrl()}/api/twilio/gather`;
  const play = escapeXml(playUrl(spoken));
  if (!continueGather) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${play}</Play>
</Response>`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${play}</Play>
  <Gather input="speech" language="en-US" action="${escapeXml(gather)}" method="POST" speechTimeout="auto" timeout="6">
  </Gather>
  <Play>${escapeXml(playUrl("Thanks for calling Dial Hanna. Goodbye."))}</Play>
</Response>`;
}
