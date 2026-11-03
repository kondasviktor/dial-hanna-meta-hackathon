import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site.ts";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/en",
          "/waitlist",
          "/privacy",
          "/terms",
          "/en/privacy",
          "/en/terms",
          "/llms.txt",
        ],
        disallow: [
          "/dashboard",
          "/onboarding",
          "/create-org",
          "/sign-in",
          "/sign-up",
          "/api/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base.replace(/^https?:\/\//, ""),
  };
}
