import { redirect } from "next/navigation";

/** Old URL — content lives under Privacy §11. */
export default function DpaRedirect() {
  redirect("/privacy#adatfeldolgozas");
}
