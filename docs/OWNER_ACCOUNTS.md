# Owner accounts checklist (hackathon)

Do these once. Keys stay in `.env` / Vercel env — never commit them.

- [ ] **ADMIN_EMAILS** — your Clerk login email (comma-separated if needed)
- [ ] **Clerk webhook** — endpoint `/api/webhooks/clerk`, signing secret → `CLERK_SIGNING_SECRET`; sign in once on closed Vercel
- [ ] **Twilio** — US Voice DID + softphone → `TWILIO_*` + TwiML App → `/api/twilio/client-voice` (Meta EN demo)
- [ ] **Telnyx** — HU DID `***REMOVED***` → `TELNYX_API_KEY`, `TELNYX_PUBLIC_KEY`, `TELNYX_CONNECTION_ID`, `TELNYX_PHONE_NUMBER`; webhook `/api/telnyx/webhook`
- [ ] **ElevenLabs** — API key + female voice → `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` (Flash TTS only; no STT/Agents)
- [ ] **Facebook Page import (optional)** — Meta App dev token → `FACEBOOK_PAGE_ACCESS_TOKEN` for Graph Page fields
- [ ] **Go-live plan** — see `docs/GO_LIVE_PRICING.md` (no dedicated DID on free trial)
- [ ] **Google Calendar** — OAuth app in testing mode, test Gmail as test user → `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- [ ] **Neon** — run `apps/web/drizzle/0002_waitlist.sql`
- [ ] **TOOLS_HMAC_SECRET** — long random string for voice ↔ web signing
- [ ] Keep Vercel **deployment protection** on until you flip for submission

Submission flip (only when you say so): public `dial-hanna-meta-hackathon` repo,
open Vercel URL, record `docs/demo.md`. `dial-hanna` stays private.
