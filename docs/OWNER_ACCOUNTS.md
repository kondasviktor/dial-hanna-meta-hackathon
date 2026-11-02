# Owner accounts checklist (hackathon)

Do these once. Keys stay in `.env` / Vercel env — never commit them.

- [ ] **ADMIN_EMAILS** — your Clerk login email (comma-separated if needed)
- [ ] **Clerk webhook** — endpoint `/api/webhooks/clerk`, signing secret → `CLERK_SIGNING_SECRET`; sign in once on closed Vercel
- [ ] **Primary URL** — `APP_URL` / `NEXT_PUBLIC_APP_URL` = `https://dialhanna.com`
- [ ] **Twilio** — US Voice DID + softphone → `TWILIO_*`; webhooks on `https://dialhanna.com/api/twilio/*` (Meta EN demo)
- [ ] **Telnyx** — HU DID `***REMOVED***` → `TELNYX_*`; webhook `https://dialhanna.com/api/telnyx/webhook`
- [ ] **ElevenLabs** — API key + **separate** HU/EN library voices → `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID_HU`, `ELEVENLABS_VOICE_ID_EN` (Flash TTS only; no STT/Agents). Do not reuse one designed voice for both languages.
- [ ] **Facebook Page import (optional)** — Meta App dev token → `FACEBOOK_PAGE_ACCESS_TOKEN` for Graph Page fields
- [ ] **Go-live plan** — see `docs/GO_LIVE_PRICING.md` (no dedicated DID on free trial)
- [ ] **Google Calendar** — OAuth app in testing mode, test Gmail as test user → `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- [ ] **Neon** — run `apps/web/drizzle/0002_waitlist.sql`
- [ ] **TOOLS_HMAC_SECRET** — long random string for voice ↔ web signing
- [ ] Keep Vercel **deployment protection** on until you flip for submission

Submission flip (only when you say so): public `dial-hanna-meta-hackathon` repo,
open Vercel URL, record `docs/demo.md`. `dial-hanna` stays private.
