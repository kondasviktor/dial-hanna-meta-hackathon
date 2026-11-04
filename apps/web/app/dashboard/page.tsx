import Link from "next/link";
import { redirect } from "next/navigation";
import { getDashboard } from "@/db/queries.ts";
import { dashLangFromSearch } from "@/lib/dash_lang.ts";
import { requireAdmin, resolveOrgId } from "@/lib/org.ts";
import FollowupButtons from "./followup-buttons";
import { setFollowupStatus } from "./followup-actions";

function withinDays(iso: string | null, days: number): boolean {
  if (!iso) return false;
  return Date.now() - new Date(iso).getTime() < days * 86_400_000;
}

export const dynamic = "force-dynamic";

export default async function Dashboard({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdmin();
  if (!admin.ok) redirect("/waitlist");
  const org = await resolveOrgId();
  if (!org.clerkOrgId) redirect("/create-org");

  const sp = searchParams ? await searchParams : {};
  const lang = dashLangFromSearch(sp);
  const en = lang === "en";
  const langQ = en ? "?lang=en" : "";

  const d = await getDashboard(org.clerkOrgId);
  if (!d) {
    return (
      <div>
        <h1 className="dash-title">{en ? "Overview" : "Áttekintés"}</h1>
        <p className="muted">
          {en
            ? "No business connected yet. Import the website or add a few Q&As — the first forwarded call will appear here."
            : "Még nincs bekötött vállalkozás. Importáld a weboldalt vagy írj be néhány kérdést és választ — az első átirányított hívás itt jelenik meg."}
        </p>
        <p>
          <Link href={`/dashboard/kb${langQ}`} className="btn btn-primary btn-sm">
            {en ? "Set up knowledge" : "Tudás beállítása"}
          </Link>
        </p>
      </div>
    );
  }

  const weekCalls = d.recent.filter((c) => withinDays(c.startedAt, 7));
  const bookings = weekCalls.filter((c) => /foglal|book/i.test(`${c.intent ?? ""} ${c.outcome ?? ""}`));
  const today = new Date().toLocaleDateString(en ? "en-US" : "hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div>
      <p className="dash-date">{today}</p>
      <h1 className="dash-title">{en ? "Overview" : "Áttekintés"}</h1>
      <p className="muted small">
        {d.org.name} · {d.org.plan}
      </p>

      <div className="kpis">
        <div className="kpi">
          <span className="kpi-num">{weekCalls.length}</span>
          <span className="kpi-label">{en ? "Answered calls · 7 days" : "Fogadott hívás · 7 nap"}</span>
        </div>
        <div className="kpi">
          <span className="kpi-num">{bookings.length}</span>
          <span className="kpi-label">{en ? "Booked appointments · 7 days" : "Lefoglalt időpont · 7 nap"}</span>
        </div>
        <div className="kpi">
          <span className="kpi-num">{d.openActions.length}</span>
          <span className="kpi-label">{en ? "Open follow-ups" : "Nyitott teendő"}</span>
        </div>
        <div className="kpi dark">
          <span className="kpi-num">{d.recent.length}</span>
          <span className="kpi-label">
            {en ? "Total calls" : "Hívások összesen"}{d.live ? (en ? " · live version" : " · élő verzió") : ""}
          </span>
        </div>
      </div>

      <div className="dash-cols">
        <div>
          <div className="dash-card">
            <h2>{en ? "Follow-ups after calls" : "Teendők hívások után"}</h2>
            {d.openActions.length === 0 && (
              <p className="muted">{en ? "No open follow-ups." : "Nincs nyitott teendő."}</p>
            )}
            {d.openActions.map((a) => (
              <div key={a.id} className="todo">
                <div>{en ? (a.summaryEn ?? a.summaryHu) : a.summaryHu}</div>
                <FollowupButtons callId={a.id} status={a.status} lang={lang} action={setFollowupStatus} />
              </div>
            ))}
          </div>

          <div className="dash-card dash-card-fill">
            <h2>{en ? "Today and recent calls" : "Mai és legutóbbi hívások"}</h2>
            {d.recent.length === 0 && (
              <p className="muted">{en ? "No calls yet." : "Még nincs hívás."}</p>
            )}
            {d.recent.map((c) => {
              const action = en ? (c.nextActionEn ?? c.nextActionHu) : c.nextActionHu;
              return (
                <Link key={c.id} href={`/dashboard/calls/${c.id}${langQ}`} className="call-row">
                  <span className="call-time">
                    {(c.startedAt ?? "").slice(0, 16).replace("T", " ")}
                  </span>
                  <span>
                    <strong>
                      {c.intent ?? "?"} → {c.outcome ?? "?"}
                    </strong>
                    <br />
                    <span className="call-meta">
                      {c.from ?? (en ? "unknown" : "ismeretlen")} · {c.language} · {c.channel}
                      {action ? ` · ${en ? "" : "Teendő: "}${action}` : ""}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <div className="dash-card gap-callout dash-card-fill">
            <h2>{en ? "Answer to add" : "Pótolandó válasz"}</h2>
            {d.gaps.length === 0 && (
              <p className="muted">{en ? "No open questions." : "Nincs nyitott kérdés."}</p>
            )}
            {d.gaps.slice(0, 1).map((g) => (
              <div key={g.id}>
                <p>
                  <strong>„{g.question}”</strong>
                </p>
                <p className="muted small">
                  {en
                    ? "Answer it once — Hanna will know it next time."
                    : "Írd meg egyszer — Hanna legközelebb már tudja."}
                </p>
                <p>
                  <Link href={`/dashboard/kb${langQ}`} className="btn btn-primary btn-sm">
                    {en ? "Give an answer" : "Válasz megadása"}
                  </Link>
                </p>
              </div>
            ))}
          </div>

          <div className="dash-card dash-card-fill">
            <h2>{en ? "Knowledge" : "Tudás"}</h2>
            <p className="muted small">
              {en
                ? "Website import, unanswered questions, approved knowledge."
                : "Weboldal beillesztése, hiányzó válaszok, jóváhagyott tudás."}
            </p>
            <p>
              <Link href={`/dashboard/kb${langQ}`} className="btn btn-outline btn-sm">
                {en ? "Open knowledge" : "Tudás megnyitása"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
