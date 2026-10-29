import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublic = createRouteMatcher([
  "/",
  "/en",
  "/api/health",
  "/api/db-ping",
  "/api/webhooks/clerk",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

const needsOrg = createRouteMatcher(["/dashboard(.*)", "/onboarding(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublic(req)) await auth.protect();
  const { pathname } = req.nextUrl;
  // Org required for everyone (owner decision, 29 Oct 2026): signed-in
  // users without an active organization are sent to create one first.
  if (needsOrg(req) && pathname !== "/create-org") {
    const { orgId } = await auth();
    if (!orgId) {
      const url = req.nextUrl.clone();
      url.pathname = "/create-org";
      return NextResponse.redirect(url);
    }
  }
  const res = NextResponse.next();
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    res.headers.set("x-page-lang", "en");
  }
  return res;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
