# Records of processing (GDPR Art. 30)

Internal only — not a public page. Last updated: 2026-11-03 (hackathon / waitlist beta).

The under-250-employees exemption does not apply: call processing for customers is not occasional.

Operator contact: hello@dialhanna.com · dialhanna.com

Full legal identity (name, seat, registration number, tax number) will be filled in before paid launch — see [before-go-live.md](./before-go-live.md).

---

## A. Controller record (Art. 30(1))

### A1. Waitlist

| Field | Value |
|---|---|
| Purpose | Launch notice emails |
| Data subjects | People who join the waitlist |
| Categories | Email, locale, plan interest, signup timestamp |
| Recipients | Neon (storage); operator |
| Transfers | Neon in EU (eu-central-1) |
| Retention | Until removal request, or 12 months after launch |
| Security | TLS; DB encryption at rest; access limited to operator |

### A2. Accounts

| Field | Value |
|---|---|
| Purpose | Authenticate and run the Dial Hanna service for businesses |
| Data subjects | Account holders / staff of customer businesses |
| Categories | Clerk identity (email, org membership), business profile, FAQs, phone number config |
| Recipients | Clerk, Neon, Vercel; subprocessors listed in public Privacy |
| Transfers | Clerk (US, DPF/SCC); Neon/Vercel EU |
| Retention | Account term + 30 days after close |
| Security | TLS; Clerk session cookies; DB encryption at rest; admin email allowlist |

### A3. Server logs

| Field | Value |
|---|---|
| Purpose | Security and debugging |
| Data subjects | Visitors and API clients (indirect) |
| Categories | IP, path, timestamps, error messages (no call audio; no stored transcripts) |
| Recipients | Vercel |
| Transfers | Vercel Frankfurt (EU) |
| Retention | About 30 days |
| Security | Platform defaults; access limited to operator |

### A4. Invoicing (not live)

| Field | Value |
|---|---|
| Purpose | Hungarian accounting (when payments start) |
| Status | **Not live** — no Stripe / Számlázz yet |
| Retention when live | Typically 8 years under Hungarian accounting law |

---

## B. Processor record (Art. 30(2))

Dial Hanna acts as processor for each customer business (controller) that uses call answering.

| Field | Value |
|---|---|
| Controllers | Customer businesses (hackathon: operator demo accounts only) |
| Categories of processing | Answer forwarded calls; extract and store structured summary + next action; draft Q&A from customer website/Page; optional booking fields |
| Categories of data | Caller number, name if spoken, summary, next step, call metadata, booking details. **No stored audio. No stored transcript.** |
| Transfers | Meta, ElevenLabs, Twilio/Telnyx (US, DPF/SCC); Neon/Vercel (EU) |
| Security | Same as public DPA §4 |

Maintain a private list of customer org IDs / business names outside this repo when paying customers exist.

---

## C. Vendor DPA checklist

Accept or sign each subprocessor’s DPA and keep the PDF outside the git repo (secrets / contracts folder). Do not commit PDFs.

| Vendor | Purpose | DPA accepted | Date | Notes |
|---|---|---|---|---|
| Vercel | Hosting | ☐ | | EU region fra1 |
| Neon | Database | ☐ | | eu-central-1 |
| Clerk | Auth | ☐ | | |
| Twilio | Demo telephony | ☐ | | US DID for hackathon |
| Telnyx | HU numbers | ☐ | | |
| ElevenLabs | TTS | ☐ | | Confirm Art. 50(2) synthetic-audio marking before go-live |
| Meta | LLM / STT / Wonder | ☐ | | Standard models only for customer content |
| Resend | Email | ☐ | | Add when summary email ships |
| Stripe | Payments | ☐ | | Go-live |
| Számlázz.hu | Invoicing | ☐ | | Go-live |
| Google | Calendar OAuth | ☐ | | Pro plan |

---

## D. Breach log template

Copy a row for each incident. Keep filled rows outside public docs if they contain personal data.

| Date (UTC) | What happened | Whose data | Controllers / subjects affected | Who was told | When told | Mitigation |
|---|---|---|---|---|---|---|
| | | | | | | |
