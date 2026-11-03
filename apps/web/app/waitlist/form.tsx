"use client";

import { useState } from "react";

export default function WaitlistForm({
  locale,
  plan,
  submitLabel,
  successLabel,
  placeholder,
}: {
  locale: "hu" | "en";
  plan?: string;
  submitLabel: string;
  successLabel: string;
  placeholder: string;
  /** Kept for callers; consent copy is locale-hardcoded below. */
  consentLabel?: string;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const r = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale, plan }),
      });
      setState(r.ok ? "ok" : "err");
    } catch {
      setState("err");
    }
  }

  if (state === "ok") {
    return <p className="waitlist-ok">{successLabel}</p>;
  }

  const privacyHref = locale === "en" ? "/en/privacy" : "/privacy";
  const consentBody =
    locale === "hu"
      ? "Csak a Dial Hanna indulásáról írunk. Törléshez írj a hello@dialhanna.com címre. "
      : "We'll only email you about the Dial Hanna launch. To be removed, email hello@dialhanna.com. ";
  const privacyWord = locale === "hu" ? "Adatvédelem →" : "Privacy →";

  return (
    <form className="waitlist-form" onSubmit={onSubmit}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      <button className="btn btn-primary" type="submit" disabled={state === "loading"}>
        {submitLabel}
      </button>
      <p className="muted small" style={{ marginTop: 12 }}>
        {consentBody}
        <a href={privacyHref}>{privacyWord}</a>
      </p>
      {state === "err" && (
        <p className="muted small">
          {locale === "hu" ? "Nem sikerült. Próbáld újra." : "Something went wrong. Try again."}
        </p>
      )}
    </form>
  );
}
