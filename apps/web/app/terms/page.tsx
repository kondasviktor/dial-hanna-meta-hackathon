import type { Metadata } from "next";
import { siteUrl } from "@/lib/site.ts";

export const metadata: Metadata = {
  title: "ÁSZF / Terms",
  alternates: { canonical: `${siteUrl()}/terms` },
};

export default function TermsPage() {
  return (
    <main className="stub-wrap" style={{ maxWidth: 720, margin: "48px auto", padding: 24, lineHeight: 1.6 }}>
      <h1>ÁSZF / Terms</h1>
      <p>
        A Dial Hanna jelenleg várólistás béta a Meta Global AI Developer Hackathon
        idején. Nyilvános előfizetés és próbaidőszak a fizetős csomagok
        megnyitásáig nem érhető el. Az átirányított hívásszakasz díját a saját
        mobilszolgáltatód számlázza.
      </p>
      <p>
        Dial Hanna is a waitlist beta during the Meta Global AI Developer Hackathon.
        Public subscriptions and the 14-day trial open when paid plans launch.
        Your carrier bills the forwarded call leg.
      </p>
      <p>
        Hanna minden hívás első mondatában MI-asszisztensként mutatkozik be.
        Hanna introduces herself as an AI assistant in the first sentence of every call.
      </p>
      <p>
        Kapcsolat / contact:{" "}
        <a href="mailto:hello@dialhanna.com">hello@dialhanna.com</a>.
      </p>
      <p><a href="/">← Dial Hanna</a></p>
    </main>
  );
}
