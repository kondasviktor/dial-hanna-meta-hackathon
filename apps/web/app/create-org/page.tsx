import { CreateOrganization } from "@clerk/nextjs";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function CreateOrgPage() {
  return (
    <div className="stub-wrap">
      <h1 className="dash-title">Hozd létre a vállalkozásod</h1>
      <p className="muted">
        Minden előfizetés — egyéni vállalkozóké és magánszemélyeké is — egy
        szervezethez tartozik. Egyedül is létrehozhatod, egy fővel.
      </p>
      <Suspense>
        <CreateOrganization afterCreateOrganizationUrl="/onboarding/plan" />
      </Suspense>
    </div>
  );
}
