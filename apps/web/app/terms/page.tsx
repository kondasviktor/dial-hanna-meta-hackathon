import type { Metadata } from "next";
import { siteUrl } from "@/lib/site.ts";
import TermsContent from "@/legal/terms.tsx";

export const metadata: Metadata = {
  title: "ÁSZF / Terms",
  alternates: {
    canonical: `${siteUrl()}/terms`,
    languages: { hu: `${siteUrl()}/terms`, en: `${siteUrl()}/en/terms` },
  },
};

export default TermsContent;
