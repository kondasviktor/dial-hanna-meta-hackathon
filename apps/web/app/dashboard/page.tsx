import { getDashboard } from "@/db/queries.ts";

const BOX: React.CSSProperties = { borderTop: "1px solid #ddd", padding: "16px 0" };

// Demo org until real Clerk organizations are wired to tenants.
const DEMO_ORG = "demo_demo-salon-01";

export default async function Dashboard() {
  const d = await getDashboard(DEMO_ORG);
  if (!d) {
    return (
      <div style={{ maxWidth: 760, margin: "0 auto", padding: 32, fontFamily: "system-ui" }}>
        <h1>Irányítópult</h1>
        <p>Nincs adat. Futtasd a seedet: <code>node scripts/seed.mjs</code>.</p>
      </div>
    );
  }
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 96px", fontFamily: "system-ui, sans-serif", color: "#1a1a1a", lineHeight: 1.6 }}>
      <p style={{ fontSize: 14, color: "#555" }}>{d.org.name} · {d.org.plan}</p>
      <h1 style={{ margin: "0 0 8px" }}>Irányítópult</h1>
      <p>
        Mai hívások: <strong>{d.todaysCalls}</strong> · Nyitott teendők: <strong>{d.openActions.length}</strong> ·{" "}
        Nyitott tudásrések: <strong>{d.gaps.length}</strong> · Élő verzió:{" "}
        <strong>{d.live ? `${d.live.status}${d.live.readinessScore != null ? ` (${d.live.readinessScore})` : ""}` : "—"}</strong>
      </p>

      <h2 style={{ fontSize: 20, margin: "32px 0 8px" }}>Nyitott teendők</h2>
      {d.openActions.length === 0 && <p style={{ color: "#555" }}>Nincs nyitott teendő.</p>}
      {d.openActions.map((a) => (
        <div key={a.id} style={BOX}><strong>{a.summary}</strong></div>
      ))}

      <h2 style={{ fontSize: 20, margin: "32px 0 8px" }}>Legutóbbi hívások</h2>
      {d.recent.map((c) => (
        <div key={c.id} style={BOX}>
          <a href={`/dashboard/calls/${c.id}`}>
            <strong>{c.intent ?? "?"} → {c.outcome ?? "?"}</strong>
          </a>
          <div style={{ fontSize: 14, color: "#555" }}>
            {c.startedAt?.slice(0, 16).replace("T", " ")} · {c.channel} · {c.from ?? "ismeretlen"} · {c.language}
            {c.nextActionHu ? ` · Teendő: ${c.nextActionHu}` : ""}
          </div>
        </div>
      ))}

      <h2 style={{ fontSize: 20, margin: "32px 0 8px" }}>Tudásrések</h2>
      {d.gaps.length === 0 && <p style={{ color: "#555" }}>Nincs nyitott tudásrés.</p>}
      {d.gaps.map((g) => (
        <div key={g.id} style={BOX}>
          <a href="/dashboard/gaps"><strong>{g.question}</strong></a>
          <div style={{ fontSize: 14, color: "#555" }}>{g.status}{g.context ? ` · ${g.context}` : ""}</div>
        </div>
      ))}
    </div>
  );
}

export const dynamic = "force-dynamic";
