import DashNav from "./nav";
import { getDashboard } from "@/db/queries.ts";

// Demo org until real Clerk organizations are wired to tenants.
const DEMO_ORG = "demo_demo-salon-01";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let openGaps: number | null = null;
  try {
    const d = await getDashboard(DEMO_ORG);
    if (d) openGaps = d.gaps.filter((g) => g.status === "open").length;
  } catch {
    openGaps = null;
  }
  return (
    <div className="dash-shell">
      <DashNav openGaps={openGaps} />
      <div className="dash-main">{children}</div>
    </div>
  );
}
