# Owner accounts checklist (hackathon)

Do these once. Keys stay in `.env` / Vercel env — never commit them.

- [ ] **ADMIN_EMAILS** — your Clerk login email (comma-separated if needed)
- [ ] **Clerk webhook** — endpoint `/api/webhooks/clerk`, signing secret → `CLERK_SIGNING_SECRET`; sign in once on closed Vercel
- [ ] **Twilio** — US Voice DID + softphone → `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `TWILIO_API_KEY_SID`, `TWILIO_API_KEY_SECRET`, `TWILIO_TWIML_APP_SID`; DID webhook `/api/twilio/voice`; TwiML App → `/api/twilio/client-voice`
- [ ] **ElevenLabs** — free API key + one female voice → `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` (do not enable STT/Agents)
- [ ] **Google Calendar** — OAuth app in testing mode, test Gmail as test user → `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- [ ] **Neon** — run `apps/web/drizzle/0002_waitlist.sql`
- [ ] **TOOLS_HMAC_SECRET** — long random string for voice ↔ web signing
- [ ] Keep Vercel **deployment protection** on until you flip for submission

Submission flip (only when you say so): public `dial-hanna-meta-hackathon` repo,
open Vercel URL, record `docs/demo.md`. `dial-hanna` stays private.
