# Owner accounts checklist (hackathon)

Do these once. Keys stay in `.env` / Vercel env — never commit them.

- [ ] **ADMIN_EMAILS** — your Clerk login email (comma-separated if needed)
- [ ] **Clerk webhook** — endpoint `/api/webhooks/clerk`, signing secret → `CLERK_SIGNING_SECRET`; sign in once on closed Vercel
- [ ] **Telnyx** — account + one cheap non-HU DID (~$1/mo) → `TELNYX_API_KEY`, `TELNYX_CONNECTION_ID`, `TELNYX_PUBLIC_KEY`, `TELNYX_PHONE_NUMBER`
- [ ] **ElevenLabs** — free API key + one female voice → `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` (do not enable STT/Agents)
- [ ] **Google Calendar** — OAuth app in testing mode, test Gmail as test user → `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- [ ] **Neon** — run `apps/web/drizzle/0002_waitlist.sql`
- [ ] **TOOLS_HMAC_SECRET** — long random string for voice ↔ web signing
- [ ] Keep Vercel **deployment protection** on until you flip for submission

Submission flip (only when you say so): public `dial-hanna-meta-hackathon` repo,
open Vercel URL, record `docs/demo.md`. `dial-hanna` stays private.
