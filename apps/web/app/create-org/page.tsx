import { CreateOrganization } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/org.ts";

export const dynamic = "force-dynamic";

export default async function CreateOrgPage() {
  const admin = await requireAdmin();
  if (!admin.ok) redirect("/waitlist");
  return (
    <div className="stub-wrap">
      <h1 className="dash-title">Hozd létre a vállalkozásod</h1>
      <p className="muted">
        Admin beüzemelés a hackathonhoz. A nyilvános regisztráció várólistás.
      </p>
      <Suspense>
        <CreateOrganization afterCreateOrganizationUrl="/onboarding" />
      </Suspense>
    </div>
  );
}
