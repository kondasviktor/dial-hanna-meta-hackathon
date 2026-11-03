import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site.ts";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();
  const pages: { path: string; changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"]; priority: number }[] = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/en", changeFrequency: "weekly", priority: 0.95 },
    { path: "/waitlist", changeFrequency: "monthly", priority: 0.8 },
    { path: "/waitlist?lang=en", changeFrequency: "monthly", priority: 0.75 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/en/privacy", changeFrequency: "yearly", priority: 0.25 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
    { path: "/en/terms", changeFrequency: "yearly", priority: 0.25 },
  ];
  return pages.map((p) => ({
    url: `${base}${p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
    alternates:
      p.path === "/" || p.path === "/en"
        ? {
            languages: {
              hu: `${base}/`,
              en: `${base}/en`,
              "x-default": `${base}/`,
            },
          }
        : undefined,
  }));
}
