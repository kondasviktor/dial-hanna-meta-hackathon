# Go-live pricing & numbers (post-hackathon)

Hackathon stays **waitlist-only** (no Stripe). This plan kicks in after Meta.

## Recommendation (breaks the catch-22)

**Do not give a dedicated HU DID on a free trial.**

| Stage | What they get | Your cost |
|---|---|---|
| Marketing / waitlist | Shared demo line (Telnyx HU + Twilio US softphone). Call “Hanna as a salon.” | ~$3–6 / mo total |
| Product trial (optional) | Softphone / in-dashboard test call against **their** FAQs. No new DID. | Meta + ElevenLabs minutes only |
| Paid go-live | Telnyx API buys/assigns a dedicated `+36` number; they forward unanswered calls to it | $3 setup once + $3 / mo per live shop |

Why this wins:

- Failed trials **never** burn $3 setup × N numbers.
- Shops still “try Hanna” on their own knowledge before paying.
- Real forwarding (the product moment) starts when money is in — correct incentive.

### If you still want a live-forward trial later

Use **card-required + 7 days + 40‑min hard cap**, and provision the DID only after onboarding is complete (not at signup). Recycle numbers from non-converters after a 2‑week “service inactive” cooldown. Keep **2 spares**, never release casually. Don’t start with 5 idle numbers.

Card-required converts better than no-card; 3‑day trials are too short for a salon to hear real missed-call value.

**Skip trial entirely** only if you sell with a strong live demo + money-back first month. SMBs usually need a taste on their own FAQ; softphone trial covers that without DID cost.

## Meta hackathon (now)

- Public: waitlist on `dialhanna.com` / Vercel.
- Admin demo: website → Muse Wonder → draft Q&As → approve → Wi‑Fi softphone (Twilio EN for Meta judges). Telnyx HU is ready for HU inbound after flip.
- No Stripe, no per-customer numbers.

## After Nov 4

1. Stripe Essential (card) + softphone trial or paid go-live with DID.
2. Hard minute cutover at 40 → “leave a message.”
3. Number pool: assign / recycle via Telnyx API.
4. Website URL import stays the knowledge path (no Facebook Page connect).
5. ElevenLabs usage + Meta API billing on paid path.
