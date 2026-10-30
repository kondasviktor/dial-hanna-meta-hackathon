import type { Metadata } from "next";
import { siteUrl } from "@/lib/site.ts";

export const metadata: Metadata = {
  title: "Adatvédelem / Privacy",
  alternates: { canonical: `${siteUrl()}/privacy` },
};

export default function PrivacyPage() {
  return (
    <main className="stub-wrap" style={{ maxWidth: 720, margin: "48px auto", padding: 24, lineHeight: 1.6 }}>
      <h1>Adatvédelem / Privacy</h1>
      <p>
        Dial Hanna a hívások fogadásához szükséges adatokat kezeli: telefonszám,
        hívás metaadatai, és a strukturált összefoglaló (szándék, eredmény, következő lépés).
        Teljes hangfelvételt alapból nem tárolunk.
      </p>
      <p>
        Dial Hanna processes the data needed to answer calls: phone number, call
        metadata, and the structured summary (intent, outcome, next step). Full
        call recordings are off by default.
      </p>
      <p>
        Adatfeldolgozók / subprocessors: Meta Model API, ElevenLabs (TTS), Twilio,
        Vercel, Neon, Clerk. Kapcsolat / contact:{" "}
        <a href="mailto:hello@dialhanna.com">hello@dialhanna.com</a>.
      </p>
      <p><a href="/">← Dial Hanna</a></p>
    </main>
  );
}
