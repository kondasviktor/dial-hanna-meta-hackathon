import { redirect } from "next/navigation";

/** Old URL — content lives under Privacy §11. */
export default function DpaRedirectEn() {
  redirect("/en/privacy#data-processing");
}
