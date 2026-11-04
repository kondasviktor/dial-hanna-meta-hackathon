/** Dashboard UI language via `?lang=en` (HU default). Same path, same page. */

export type DashLang = "hu" | "en";

export function dashLangFromSearch(
  searchParams: Record<string, string | string[] | undefined> | URLSearchParams | undefined,
): DashLang {
  if (!searchParams) return "hu";
  const raw =
    typeof (searchParams as URLSearchParams).get === "function"
      ? (searchParams as URLSearchParams).get("lang")
      : (searchParams as Record<string, string | string[] | undefined>).lang;
  const v = Array.isArray(raw) ? raw[0] : raw;
  return String(v ?? "").toLowerCase() === "en" ? "en" : "hu";
}

/**
 * Where Clerk's org switcher should land after create/select: stay in the
 * app shell, keep the dashboard language (?lang=en if set, or the /en
 * marketing prefix). Never fall back to the HU landing page.
 */
export function orgChangeTarget(pathname: string, search: string): string {
  const inShell = ["/dashboard", "/onboarding", "/create-org"].some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const en =
    new URLSearchParams(search.replace(/^\?/, "")).get("lang")?.toLowerCase() === "en" ||
    pathname === "/en" ||
    pathname.startsWith("/en/");
  const base = inShell ? pathname : "/dashboard";
  return en ? `${base}?lang=en` : base;
}

/** Keep other query params; set or clear `lang`. */
export function withDashLang(pathname: string, target: DashLang, currentSearch?: string): string {
  const path = (pathname.split("?")[0] || "/").split("#")[0];
  const q = new URLSearchParams(currentSearch?.replace(/^\?/, "") ?? "");
  if (target === "en") q.set("lang", "en");
  else q.delete("lang");
  const qs = q.toString();
  return qs ? `${path}?${qs}` : path;
}
