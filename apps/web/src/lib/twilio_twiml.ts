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

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">Hi, this is Dial Hanna. The voice service is not connected yet.</Say>
</Response>`;
}
