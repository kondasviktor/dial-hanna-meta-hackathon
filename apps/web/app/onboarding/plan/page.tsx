import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/org.ts";

export const dynamic = "force-dynamic";

/** Plan pick / trial start removed for the hackathon — public funnel is waitlist. */
export default async function PlanPage() {
  const admin = await requireAdmin();
  if (!admin.ok) redirect("/waitlist");
  redirect("/onboarding");
}
