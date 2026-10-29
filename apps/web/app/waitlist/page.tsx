import type { Metadata } from "next";
import WaitlistForm from "./form";
import { landing } from "@/i18n/landing.ts";
import { siteUrl } from "@/lib/site.ts";

export const metadata: Metadata = {
  title: "Várólista / Waitlist",
  description:
    "Join the Dial Hanna waitlist. Public trial opens with paid plans — keep your number when we launch.",
  alternates: { canonical: `${siteUrl()}/waitlist` },
  robots: { index: true, follow: true },
};

export default function WaitlistPage({
  searchParams,
}: {
  searchParams?: { plan?: string; lang?: string };
}) {
  const en = searchParams?.lang === "en";
  const d = en ? landing.en : landing.hu;
  const plan = searchParams?.plan;
  return (
    <div className="stub-wrap" style={{ maxWidth: 480, margin: "48px auto", padding: 24 }}>
      <h1 className="dash-title">{d.waitlistTitle}</h1>
      <p className="muted">{d.waitlistBody}</p>
      <WaitlistForm
        locale={en ? "en" : "hu"}
        plan={plan}
        submitLabel={d.waitlistSubmit}
        successLabel={d.waitlistSuccess}
        placeholder={d.waitlistPlaceholder}
      />
      <p className="muted small" style={{ marginTop: 24 }}>
        <a href={en ? "/en" : "/"}>{en ? "← Back" : "← Vissza"}</a>
      </p>
    </div>
  );
}
