import { withDashLang, type DashLang } from "./dash_lang.ts";

function isAppShell(path: string): boolean {
  return (
    path.startsWith("/dashboard") ||
    path.startsWith("/onboarding") ||
    path.startsWith("/create-org")
  );
}

/**
 * Map the current path to the other locale without dumping users on the homepage.
 * Dashboard stays on the same route; language is `?lang=en` (HU = no param).
 * Pass `search` (e.g. `lang=en&x=1` or `?lang=en`) and optional `hash` (`#section`).
 */
export function localeHref(
  pathname: string,
  target: "hu" | "en",
  search?: string,
  hash?: string,
): string {
  const path = pathname.split("?")[0] || "/";
  const h = hash && hash.startsWith("#") ? hash : hash ? `#${hash}` : "";

  if (isAppShell(path)) {
    return withDashLang(path, target as DashLang, search) + h;
  }

  if (target === "en") {
    if (path === "/") return "/en" + h;
    if (path === "/privacy") return "/en/privacy" + h;
    if (path === "/terms") return "/en/terms" + h;
    if (path === "/dpa") return "/en/dpa" + h;
    if (path === "/waitlist") return "/waitlist?lang=en" + h;
    if (path.startsWith("/en")) return path + h;
    return "/en" + h;
  }

  // target hu
  if (path === "/en") return "/" + h;
  if (path === "/en/privacy") return "/privacy" + h;
  if (path === "/en/terms") return "/terms" + h;
  if (path === "/en/dpa") return "/dpa" + h;
  if (path === "/waitlist") return "/waitlist" + h;
  if (path.startsWith("/en/")) return (path.replace(/^\/en/, "") || "/") + h;
  return path + h;
}
