import Link from "next/link";
import { redirect } from "next/navigation";
import { getDashboard } from "@/db/queries.ts";
import { DEFAULT_CONDITIONS, forwardingCodes } from "@/lib/mmi.ts";
import { requireAdmin, resolveOrgId } from "@/lib/org.ts";
import { dashLangFromSearch } from "@/lib/dash_lang.ts";
import Softphone from "../phone/softphone";

export const dynamic = "force-dynamic";

export default async function CallsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdmin();
  if (!admin.ok) redirect("/waitlist");
  const org = await resolveOrgId();
  if (!org.clerkOrgId) redirect("/create-org");
  const d = await getDashboard(org.clerkOrgId);
  const recent = d?.recent ?? [];

  const sp = searchParams ? await searchParams : {};
  const lang = dashLangFromSearch(sp);
  const en = lang === "en";
  const langQ = en ? "?lang=en" : "";

  const did = process.env.TWILIO_PHONE_NUMBER ?? "";
  const codes = did
    ? DEFAULT_CONDITIONS.map((c) => ({
        condition: c,
        ...forwardingCodes(c, did.replace(/^\+/, ""), "other"),
      }))
    : [];

  return (
    <div>
      <h1 className="dash-title">{en ? "Phone" : "Telefon"}</h1>
      <p className="muted">
        {en
          ? "Forwarding, browser softphone, and recent calls in one place."
          : "Átirányítás, próbahívás böngészőből, és a legutóbbi hívások egy helyen."}
      </p>

      <Softphone did={did} lang={lang} />

      <div className="dash-card">
        <h2>{en ? "Hanna number" : "Hanna szám"}</h2>
        {did ? (
          <p className="mono" style={{ fontSize: 20 }}>{did}</p>
        ) : (
          <p className="muted">
            {en
              ? "Number not set yet. Email hello@dialhanna.com"
              : "A szám még nincs beállítva. Írj nekünk: hello@dialhanna.com"}
          </p>
        )}
      </div>

      {codes.length > 0 && (
        <div className="dash-card">
          <h2>{en ? "Forwarding codes (example)" : "Átirányítási kódok (példa)"}</h2>
          <p className="muted small">
            {en
              ? "Forward unanswered / busy calls to Hanna’s number. Confirm with your carrier."
              : "Nem fogadott / foglalt hívásokat irányítsd a Hanna számra. Szolgáltatónként ellenőrizd."}
          </p>
          <ul>
            {codes.map((c) => (
              <li key={c.condition} style={{ marginBottom: 8 }}>
                <strong>{c.condition}</strong>
                <br />
                <code className="mono">{c.activate}</code>
                <br />
                <span className="muted small">{en ? "off" : "ki"}: {c.deactivate}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="dash-card">
        <h2>{en ? "Recent calls" : "Legutóbbi hívások"}</h2>
        {recent.length === 0 && (
          <p className="muted">{en ? "No calls yet." : "Még nincs hívás."}</p>
        )}
        {recent.map((c) => (
          <Link key={c.id} href={`/dashboard/calls/${c.id}${langQ}`} className="call-row">
            <span className="call-time">{(c.startedAt ?? "").slice(0, 16).replace("T", " ")}</span>
            <span>
              <strong>{c.intent ?? "?"} → {c.outcome ?? "?"}</strong>
              <br />
              <span className="call-meta">
                {c.from ?? (en ? "unknown" : "ismeretlen")} · {c.language} · {c.channel}
                {c.nextActionHu ? ` · ${c.nextActionHu}` : ""}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
