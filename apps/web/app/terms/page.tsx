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
        A Dial Hanna jelenleg várólistás béta. A szolgáltatás „ahogy van” alapon
        elérhető; a fizetős csomagok és a saját számos próba később nyílik meg.
      </p>
      <p>
        Dial Hanna is a waitlist beta. The service is provided as-is; paid plans
        and the trial on your own number open later.
      </p>
      <p>
        Kapcsolat / contact:{" "}
        <a href="mailto:hello@dialhanna.com">hello@dialhanna.com</a>.
      </p>
      <p><a href="/">← Dial Hanna</a></p>
    </main>
  );
}
