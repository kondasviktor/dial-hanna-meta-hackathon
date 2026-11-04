import { CreateOrganization } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { dashLangFromSearch } from "@/lib/dash_lang.ts";
import { requireAdmin } from "@/lib/org.ts";

export const dynamic = "force-dynamic";

export default async function CreateOrgPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdmin();
  if (!admin.ok) redirect("/waitlist");
  const sp = searchParams ? await searchParams : {};
  const en = dashLangFromSearch(sp) === "en";
  return (
    <div className="stub-wrap">
      <h1 className="dash-title">{en ? "Create your business" : "Hozd létre a vállalkozásod"}</h1>
      <p className="muted">
        {en
          ? "Admin setup for the hackathon. Public sign-up is waitlist-only."
          : "Admin beüzemelés a hackathonhoz. A nyilvános regisztráció várólistás."}
      </p>
      <Suspense>
        <CreateOrganization afterCreateOrganizationUrl={en ? "/dashboard/kb?lang=en" : "/dashboard/kb"} />
      </Suspense>
    </div>
  );
}
