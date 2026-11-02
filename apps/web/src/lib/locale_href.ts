/** Map the current path to the other locale without dumping users on the homepage. */
export function localeHref(pathname: string, target: "hu" | "en"): string {
  const path = pathname.split("?")[0] || "/";

  if (target === "en") {
    if (path === "/") return "/en";
    if (path === "/privacy") return "/en/privacy";
    if (path === "/terms") return "/en/terms";
    if (path === "/waitlist") return "/waitlist?lang=en";
    if (path.startsWith("/en")) return path;
    // Dashboard / onboarding are HU-only for the hackathon — stay put.
    if (path.startsWith("/dashboard") || path.startsWith("/onboarding") || path.startsWith("/create-org")) {
      return path;
    }
    return "/en";
  }

  // target hu
  if (path === "/en") return "/";
  if (path === "/en/privacy") return "/privacy";
  if (path === "/en/terms") return "/terms";
  if (path === "/waitlist") return "/waitlist";
  if (path.startsWith("/en/")) return path.replace(/^\/en/, "") || "/";
  return path;
}
