# Demo script (~3 minutes)

Record from the **closed** admin deployment. Do not open the site publicly
until submission flip is approved.

## Beats

1. **Problem (0:00)** — Busy salon owner misses a call.
2. **Wonder import (0:20)** — Admin pastes a controlled website URL. Wonder
   drafts services and FAQs. Approve a few. (No voice note.)
3. **Phone call (0:55)** — Call the Twilio DID in English (Wi‑Fi softphone). Hanna discloses she
   is an AI, books or takes a message. Subtitles in the video.
4. **Gap loop (1:40)** — Ask about parking. Hanna logs a gap. Answer in one
   line on `/dashboard/gaps`, publish. Second short call uses the new FAQ.
5. **Dashboard (2:20)** — Show Intent → Outcome → Next action.
6. **Architecture (2:40)** — Meta Transcribe + Spark + Wonder; ElevenLabs TTS;
   waitlist for the public; Hungarian STT is the production path.

## Limits to say on camera

- English callers for the hackathon; Hungarian speech recognition is not on
  Meta’s verified list yet.
- No public “call from the website.”
- Waitlist until paid plans open (Stripe after the hackathon).
