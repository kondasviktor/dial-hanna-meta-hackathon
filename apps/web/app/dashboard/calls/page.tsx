import Link from "next/link";
import { getDashboard } from "@/db/queries.ts";

const DEMO_ORG = "demo_demo-salon-01";

export const dynamic = "force-dynamic";

export default async function CallsIndex() {
  let recent: { id: string; startedAt: string | null; intent: string | null; outcome: string | null }[] = [];
  try {
    const d = await getDashboard(DEMO_ORG);
    if (d) recent = d.recent;
  } catch {
    recent = [];
  }
  return (
    <div className="stub-wrap">
      <h1 className="dash-title">Hívások</h1>
      {recent.length === 0 && (
        <p className="muted">Még nincs hívás. Az első átirányított hívás itt jelenik meg.</p>
      )}
      {recent.map((c) => (
        <Link key={c.id} href={`/dashboard/calls/${c.id}`} className="call-row">
          <span className="call-time">
            {(c.startedAt ?? "").slice(0, 16).replace("T", " ")}
          </span>
          <span>
            <strong>
              {c.intent ?? "?"} → {c.outcome ?? "?"}
            </strong>
          </span>
        </Link>
      ))}
      <p style={{ marginTop: 24 }}>
        <Link href="/dashboard">← Áttekintés</Link>
      </p>
    </div>
  );
}
