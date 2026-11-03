import { getCallDetail } from "@/db/queries.ts";

export default async function CallDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await getCallDetail(id);
  if (!d) {
    return <div style={{ padding: 32, fontFamily: "system-ui" }}><p>Hívás nem található.</p></div>;
  }
  const na = (d.outcome?.nextAction ?? {}) as { type?: string; summary_hu?: string; summary_en?: string };
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 96px", fontFamily: "system-ui, sans-serif", lineHeight: 1.6 }}>
      <p><a href="/dashboard">← Irányítópult</a></p>
      <h1>Hívás részletei</h1>
      <p style={{ color: "#555", fontSize: 14 }}>
        {d.call.startedAt?.toISOString().slice(0, 16).replace("T", " ")} · {d.call.channel} · {d.call.fromE164 ?? "ismeretlen"} · {d.call.language} · {d.call.durationS} mp
      </p>
      <h2 style={{ fontSize: 20 }}>Eredmény</h2>
      <p>
        <strong>{d.outcome?.intent ?? "?"} → {d.outcome?.outcome ?? "?"}</strong>
        {na.summary_hu ? ` · Teendő: ${na.summary_hu}` : ""}
      </p>
      <p className="muted small">MI-generált összefoglaló, hibákat tartalmazhat.</p>
      {d.bookings.length > 0 && (
        <>
          <h2 style={{ fontSize: 20 }}>Foglalások</h2>
          {d.bookings.map((b) => (
            <p key={b.id}>{b.serviceId} · {b.slotStart?.toISOString().slice(0, 16).replace("T", " ")} · {b.callerName} · {b.status}</p>
          ))}
        </>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";
