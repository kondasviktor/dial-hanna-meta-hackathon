import { redirect } from "next/navigation";

/** Knowledge import + gaps live under /dashboard/kb now. */
export default function OnboardingRedirect() {
  redirect("/dashboard/kb");
}
