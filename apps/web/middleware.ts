import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublic = createRouteMatcher([
  "/",
  "/en",
  "/waitlist(.*)",
  "/privacy",
  "/terms",
  "/en/privacy",
  "/en/terms",
  "/api/health",
  "/api/db-ping",
  "/api/waitlist",
  "/api/webhooks/clerk",
  "/api/voice(.*)",
  "/api/twilio(.*)",
  "/sign-in(.*)",
]);

const needsAdmin = createRouteMatcher([
  "/dashboard(.*)",
  "/onboarding(.*)",
  "/create-org(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Public signup is closed — send visitors to the waitlist.
  if (pathname.startsWith("/sign-up")) {
    const url = req.nextUrl.clone();
    url.pathname = "/waitlist";
    return NextResponse.redirect(url);
  }

  if (!isPublic(req)) await auth.protect();

  if (needsAdmin(req)) {
    const session = await auth();
    if (!session.userId) {
      const url = req.nextUrl.clone();
      url.pathname = "/sign-in";
      return NextResponse.redirect(url);
    }
    // Org required for dashboard / onboarding (admin still creates an org).
    if (
      (pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding")) &&
      pathname !== "/create-org"
    ) {
      if (!session.orgId) {
        const url = req.nextUrl.clone();
        url.pathname = "/create-org";
        return NextResponse.redirect(url);
      }
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
