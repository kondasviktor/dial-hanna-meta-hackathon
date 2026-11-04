import { dashLangFromSearch } from "@/lib/dash_lang.ts";
import { getCallDetail } from "@/db/queries.ts";

export default async function CallDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = searchParams ? await searchParams : {};
  const en = dashLangFromSearch(sp) === "en";
  const d = await getCallDetail(id);
  if (!d) {
    return <div style={{ padding: 32, fontFamily: "system-ui" }}><p>{en ? "Call not found." : "Hívás nem található."}</p></div>;
  }
  const na = (d.outcome?.nextAction ?? {}) as { type?: string; summary_hu?: string; summary_en?: string };
  const action = en ? (na.summary_en ?? na.summary_hu) : na.summary_hu;
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 96px", fontFamily: "system-ui, sans-serif", lineHeight: 1.6 }}>
      <p><a href={en ? "/dashboard?lang=en" : "/dashboard"}>{en ? "← Dashboard" : "← Irányítópult"}</a></p>
      <h1>{en ? "Call details" : "Hívás részletei"}</h1>
      <p style={{ color: "#555", fontSize: 14 }}>
        {d.call.startedAt?.toISOString().slice(0, 16).replace("T", " ")} · {d.call.channel} · {d.call.fromE164 ?? (en ? "unknown" : "ismeretlen")} · {d.call.language} · {d.call.durationS} {en ? "s" : "mp"}
      </p>
      <h2 style={{ fontSize: 20 }}>{en ? "Outcome" : "Eredmény"}</h2>
      <p>
        <strong>{d.outcome?.intent ?? "?"} → {d.outcome?.outcome ?? "?"}</strong>
        {action ? ` · ${en ? "Next step: " : "Teendő: "}${action}` : ""}
      </p>
      <p className="muted small">{en ? "AI-generated summary, may contain errors." : "MI-generált összefoglaló, hibákat tartalmazhat."}</p>
      {d.bookings.length > 0 && (
        <>
          <h2 style={{ fontSize: 20 }}>{en ? "Bookings" : "Foglalások"}</h2>
          {d.bookings.map((b) => (
            <p key={b.id}>{b.serviceId} · {b.slotStart?.toISOString().slice(0, 16).replace("T", " ")} · {b.callerName} · {b.status}</p>
          ))}
        </>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";
