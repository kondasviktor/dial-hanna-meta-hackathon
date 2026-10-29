import Link from "next/link";
import { redirect } from "next/navigation";
import { getDashboard } from "@/db/queries.ts";
import { requireAdmin, resolveOrgId } from "@/lib/org.ts";

export default async function CallsPage() {
  const admin = await requireAdmin();
  if (!admin.ok) redirect("/waitlist");
  const org = await resolveOrgId();
  if (!org.clerkOrgId) redirect("/create-org");
  const d = await getDashboard(org.clerkOrgId);
  const recent = d?.recent ?? [];
  return (
    <div>
      <h1 className="dash-title">Hívások</h1>
      {recent.length === 0 && <p className="muted">Még nincs hívás.</p>}
      {recent.map((c) => (
        <Link key={c.id} href={`/dashboard/calls/${c.id}`} className="call-row">
          <span className="call-time">{(c.startedAt ?? "").slice(0, 16).replace("T", " ")}</span>
          <span>
            <strong>{c.intent ?? "?"} → {c.outcome ?? "?"}</strong>
            <br />
            <span className="call-meta">
              {c.from ?? "ismeretlen"} · {c.language} · {c.channel}
              {c.nextActionHu ? ` · ${c.nextActionHu}` : ""}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}

export const dynamic = "force-dynamic";
