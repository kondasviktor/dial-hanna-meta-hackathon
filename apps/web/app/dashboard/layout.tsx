import { redirect } from "next/navigation";
import DashNav from "./nav";
import { getDashboard } from "@/db/queries.ts";
import { requireAdmin, resolveOrgId } from "@/lib/org.ts";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  if (!admin.ok) redirect("/waitlist");

  const org = await resolveOrgId();
  let openGaps: number | null = null;
  let orgLabel = org.name ?? "Vállalkozás";
  let planLabel = org.plan ?? "admin";
  let liveLabel: string | null = null;
  try {
    if (org.clerkOrgId) {
      const d = await getDashboard(org.clerkOrgId);
      if (d) {
        openGaps = d.gaps.filter((g) => g.status === "open").length;
        orgLabel = d.org.name;
        planLabel = d.org.plan;
        liveLabel = d.live?.id ? `Élő · ${d.live.id.slice(0, 8)}` : null;
      }
    }
  } catch {
    openGaps = null;
  }
  return (
    <div className="dash-shell">
      <DashNav
        openGaps={openGaps}
        orgName={orgLabel}
        orgMeta={planLabel}
        liveLabel={liveLabel}
      />
      <div className="dash-main">{children}</div>
    </div>
  );
}
