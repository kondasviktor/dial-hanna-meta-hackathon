import Link from "next/link";
import { getDashboard } from "@/db/queries.ts";

// Demo org until real Clerk organizations are wired to tenants.
const DEMO_ORG = "demo_demo-salon-01";

type Dashboard = NonNullable<Awaited<ReturnType<typeof getDashboard>>>;

// Fictional demo content (mirrors the Claude product-UI proposal) shown when
// no database is wired up. Clearly labelled as demo in the UI.
const DEMO: Dashboard = {
  org: { id: "demo", name: "Szalon Viola", plan: "Pro" },
  todaysCalls: 4,
  openActions: [
    { id: "a1", summary: "Hívd vissza ma 17:00 előtt: Kovács Anna (sürgős hibabejelentés)." },
    { id: "a2", summary: "Erősítsd meg a péntek 14:30-as foglalást SMS-ben." },
    { id: "a3", summary: "Nézd át az új tudásrést: parkolás a szalon közelében." },
  ],
  recent: [
    {
      id: "c1", startedAt: "2026-10-28T10:12:00", channel: "telnyx",
      from: "+36 30 555 0101", language: "hu",
      intent: "Időpontfoglalás", outcome: "Hajvágás, csütörtök 15:30",
      nextActionHu: null, ownerStatus: "done",
    },
    {
      id: "c2", startedAt: "2026-10-28T09:03:00", channel: "telnyx",
      from: "+36 20 555 0102", language: "hu",
      intent: "Árkérdés és parkolás", outcome: "Megválaszolva, 1 kérdésre nem volt válasz",
      nextActionHu: "Válaszolj egyszer a parkolásról.", ownerStatus: "open",
    },
    {
      id: "c3", startedAt: "2026-10-27T16:44:00", channel: "browser",
      from: null, language: "en",
      intent: "Appointment booking", outcome: "Trim, Saturday 10:00",
      nextActionHu: null, ownerStatus: "done",
    },
  ],
  gaps: [
    { id: "g1", question: "Van parkoló a közelben?", context: "4 hívó kérdezte a héten", status: "open" },
  ],
  live: { id: "v7", status: "live", readinessScore: 92 },
};

function withinDays(iso: string | null, days: number): boolean {
  if (!iso) return false;
  return Date.now() - new Date(iso).getTime() < days * 86_400_000;
}

export default async function Dashboard() {
  const real = await getDashboard(DEMO_ORG);
  const demo = !real;
  const d = real ?? DEMO;

  const weekCalls = d.recent.filter((c) => withinDays(c.startedAt, 7));
  const bookings = weekCalls.filter((c) => /foglal|book/i.test(`${c.intent ?? ""} ${c.outcome ?? ""}`));
  const score = d.live?.readinessScore ?? null;
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
        {d.org.name} · {d.org.plan} ·{" "}
        <Link href="/demo">Teszthívás a böngészőből</Link>
      </p>

      {demo && (
        <p className="demo-banner">
          Demó adatok, kitalált vállalkozással és kitalált hívókkal. Éles
          adathoz állítsd be a <code>DATABASE_URL</code>-t és futtasd a seedet.
        </p>
      )}

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
          <span className="kpi-num">{score ?? "—"}</span>
          <span className="kpi-label">
            Felkészültség{d.live ? ` · ${d.live.id} élő` : ""}
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
              <Link key={c.id} href={demo ? "/dashboard" : `/dashboard/calls/${c.id}`} className="call-row">
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

          {demo && (
            <div className="dash-card">
              <h2>Perckeret</h2>
              <p className="mono">
                188 <span className="muted">/ 250 AI-perc</span>
              </p>
              <div className="minutes-bar" aria-hidden>
                <div className="minutes-fill" style={{ width: "75%" }} />
              </div>
              <div className="minutes-marks">
                <span>75%</span>
                <span>90%</span>
                <span>100%</span>
              </div>
              <p className="muted small">
                A 75%-os küszöbnél e-mailben jeleztünk. A keret végén:
                automatikus feltöltés, 100 perc / 9 900 Ft + ÁFA.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
