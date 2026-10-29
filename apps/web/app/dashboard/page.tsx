import Link from "next/link";
import { getDashboard } from "@/db/queries.ts";

// Demo org until real Clerk organizations are wired to tenants.
const DEMO_ORG = "demo_demo-salon-01";

function withinDays(iso: string | null, days: number): boolean {
  if (!iso) return false;
  return Date.now() - new Date(iso).getTime() < days * 86_400_000;
}

export default async function Dashboard() {
  const d = await getDashboard(DEMO_ORG);
  if (!d) {
    return (
      <div>
        <h1 className="dash-title">Áttekintés</h1>
        <p className="muted">
          Még nincs bekötött vállalkozás. Hozd létre a szervezetet, válassz
          csomagot, és az első átirányított hívás itt jelenik meg.
        </p>
        <p>
          <Link href="/onboarding" className="btn btn-primary btn-sm">
            Beüzemelés indítása
          </Link>
        </p>
      </div>
    );
  }

  const weekCalls = d.recent.filter((c) => withinDays(c.startedAt, 7));
  const bookings = weekCalls.filter((c) => /foglal|book/i.test(`${c.intent ?? ""} ${c.outcome ?? ""}`));
  const today = new Date().toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div>
      <p className="dash-date">{today}</p>
      <h1 className="dash-title">Áttekintés</h1>
      <p className="muted small">
        {d.org.name} · {d.org.plan}
      </p>

      <div className="kpis">
        <div className="kpi">
          <span className="kpi-num">{weekCalls.length}</span>
          <span className="kpi-label">Fogadott hívás · 7 nap</span>
        </div>
        <div className="kpi">
          <span className="kpi-num">{bookings.length}</span>
          <span className="kpi-label">Lefoglalt időpont · 7 nap</span>
        </div>
        <div className="kpi">
          <span className="kpi-num">{d.openActions.length}</span>
          <span className="kpi-label">Nyitott teendő</span>
        </div>
        <div className="kpi dark">
          <span className="kpi-num">0 <span style={{ fontSize: 16 }}>/ 40</span></span>
          <span className="kpi-label">
            AI-perc · próba{d.live ? ` · ${d.live.id} élő` : ""}
          </span>
        </div>
      </div>

      <div className="dash-cols">
        <div>
          <div className="dash-card">
            <h2>Teendők hívások után</h2>
            {d.openActions.length === 0 && (
              <p className="muted">Nincs nyitott teendő.</p>
            )}
            {d.openActions.map((a) => (
              <div key={a.id} className="todo">
                {a.summary}
              </div>
            ))}
          </div>

          <div className="dash-card">
            <h2>Mai és legutóbbi hívások</h2>
            {d.recent.length === 0 && (
              <p className="muted">Még nincs hívás.</p>
            )}
            {d.recent.map((c) => (
              <Link key={c.id} href={`/dashboard/calls/${c.id}`} className="call-row">
                <span className="call-time">
                  {(c.startedAt ?? "").slice(0, 16).replace("T", " ")}
                </span>
                <span>
                  <strong>
                    {c.intent ?? "?"} → {c.outcome ?? "?"}
                  </strong>
                  <br />
                  <span className="call-meta">
                    {c.from ?? "ismeretlen"} · {c.language} · {c.channel}
                    {c.nextActionHu ? ` · Teendő: ${c.nextActionHu}` : ""}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="dash-card gap-callout">
            <h2>Új tudásrés</h2>
            {d.gaps.length === 0 && (
              <p className="muted">Nincs nyitott tudásrés.</p>
            )}
            {d.gaps.slice(0, 1).map((g) => (
              <div key={g.id}>
                <p>
                  <strong>„{g.question}”</strong>
                </p>
                <p className="muted small">
                  {g.context ?? g.status}. Válaszolj egyszer, és Hanna tudja.
                </p>
                <p>
                  <Link href="/dashboard/gaps" className="btn btn-primary btn-sm">
                    Válasz megadása
                  </Link>
                </p>
              </div>
            ))}
          </div>

          <div className="dash-card">
            <h2>Perckeret</h2>
            <p className="mono">
              0 <span className="muted">/ 40 AI-perc</span>
            </p>
            <div className="minutes-bar" aria-hidden>
              <div className="minutes-fill" style={{ width: "0%" }} />
            </div>
            <div className="minutes-marks">
              <span>75%</span>
              <span>90%</span>
              <span>100%</span>
            </div>
            <p className="muted small">
              75, 90 és 100%-nál jelzünk. A keret végén te döntesz:
              automatikus feltöltés, kisebb túlhasználat vagy leállás.
              Extra 100 perc: 9 900 Ft.{" "}
              <Link href="/dashboard/usage">Használat és csomag</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
