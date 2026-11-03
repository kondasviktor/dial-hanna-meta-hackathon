import type { Metadata } from "next";
import { siteUrl } from "@/lib/site.ts";
import TermsContent from "@/legal/terms.tsx";

export const metadata: Metadata = {
  title: "Terms / ÁSZF",
  alternates: {
    canonical: `${siteUrl()}/en/terms`,
    languages: { hu: `${siteUrl()}/terms`, en: `${siteUrl()}/en/terms` },
  },
};

export default TermsContent;
