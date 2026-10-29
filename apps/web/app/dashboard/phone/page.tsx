import { redirect } from "next/navigation";
import { DEFAULT_CONDITIONS, forwardingCodes } from "@/lib/mmi.ts";
import { requireAdmin } from "@/lib/org.ts";

export const dynamic = "force-dynamic";

export default async function PhonePage() {
  const admin = await requireAdmin();
  if (!admin.ok) redirect("/waitlist");

  const did = process.env.TELNYX_PHONE_NUMBER ?? "";
  const codes = did
    ? DEFAULT_CONDITIONS.map((c) => ({
        condition: c,
        ...forwardingCodes(c, did.replace(/^\+/, ""), "other"),
      }))
    : [];

  return (
    <div>
      <h1 className="dash-title">Telefon</h1>
      <p className="muted">
        Hackathon: egy olcsó Telnyx szám (nem magyar KYC). A nyilvános
        böngészős hívás nincs. Te hívod a DID-et a demóhoz.
      </p>
      <div className="dash-card">
        <h2>Dial Hanna szám</h2>
        {did ? (
          <p className="mono" style={{ fontSize: 20 }}>{did}</p>
        ) : (
          <p className="muted">
            Állítsd be a <code>TELNYX_PHONE_NUMBER</code> változót a .env-ben.
          </p>
        )}
      </div>
      {codes.length > 0 && (
        <div className="dash-card">
          <h2>Átirányítási kódok (példa)</h2>
          <p className="muted small">
            Szolgáltatónként ellenőrizd. A demóhoz elég közvetlenül a Telnyx
            számot hívni.
          </p>
          <ul>
            {codes.map((c) => (
              <li key={c.condition} style={{ marginBottom: 8 }}>
                <strong>{c.condition}</strong>
                <br />
                <code className="mono">{c.activate}</code>
                <br />
                <span className="muted small">ki: {c.deactivate}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
