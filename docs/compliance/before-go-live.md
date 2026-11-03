# Before paid launch — compliance checklist

Fill these so you do not need a full re-audit. Hackathon pages deliberately omit personal impressum.

## Legal identity (Ektv. impressum)

- [ ] Publish legal name, seat address, registration number, tax number, email
- [ ] Publish hosting provider name and address (Vercel)
- [ ] Same block on Privacy, Terms, and a dedicated Impressum if you add one
- [ ] Remove the “published before paid launch” sentence once filled in

## Payments and invoicing

- [ ] Add Stripe and Számlázz.hu to the public subprocessor table
- [ ] Turn on 8-year invoice retention in Privacy
- [ ] If still true: “Alanyi adómentes, az árak ÁFA-t nem tartalmaznak.” in Terms
- [ ] Accept/sign Stripe and Számlázz DPAs (see [ropa.md](./ropa.md) checklist)

## Summary email (Resend)

- [ ] Add Resend to subprocessors
- [ ] Send only to the account owner email
- [ ] Footer: “AI-generated summary, may contain errors.” / HU equivalent
- [ ] One-click unsubscribe only if the flow actually exists

## Google Calendar (Pro)

- [ ] Google API Limited Use disclosure in Privacy (required for OAuth verification)
- [ ] Google as subprocessor
- [ ] Sign Google DPA / Cloud terms as applicable

## Retention

- [ ] Optional per-business summary retention (30/90/180 days) only after a deletion job exists
- [ ] Update the public DPA if you add that setting

## Call recording (default: stay off)

- [ ] Do **not** enable recording without: caller disclosure at call start, separate retention, DPIA
- [ ] Prefer permanent “no audio stored” unless customers demand recording

## AI Act Art. 50

- [ ] Confirm ElevenLabs covers machine-readable marking of synthetic audio (Art. 50(2))
- [ ] Mention that coverage in the Privacy AI section
- [ ] Keep first-utterance AI disclosure (already in greeting + prompt)

## DPIA

- [ ] One-page DPIA-lite in `docs/compliance/` — ongoing AI processing of third-party callers is borderline

## Lawyer

- [ ] One-hour review by a Hungarian data-protection lawyer before first payment

## Meta models

- [ ] Keep customer content on Meta **standard** models only (not Contributor)
- [ ] Contributor remains synthetic test fixtures / gate scripts only
