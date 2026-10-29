import { SITE, siteUrl } from "@/lib/site.ts";

export function JsonLd({ lang }: { lang: "hu" | "en" }) {
  const base = siteUrl();
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${base}/#org`,
        name: SITE.name,
        url: base,
        email: SITE.email,
        areaServed: {
          "@type": "Country",
          name: "Hungary",
        },
        contactPoint: {
          "@type": "ContactPoint",
          email: SITE.email,
          contactType: "customer support",
          availableLanguage: ["Hungarian", "English"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: base,
        name: SITE.name,
        inLanguage: lang === "hu" ? "hu-HU" : "en-US",
        publisher: { "@id": `${base}/#org` },
        potentialAction: {
          "@type": "RegisterAction",
          name: lang === "hu" ? "Várólista" : "Join waitlist",
          target: `${base}/waitlist${lang === "en" ? "?lang=en" : ""}`,
        },
      },
      {
        "@type": "SoftwareApplication",
        name: SITE.name,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "HUF",
          lowPrice: "19900",
          highPrice: "59900",
          offerCount: 3,
        },
        description:
          lang === "hu"
            ? "MI-alapú híváslefedés: tartsd meg a számodat, Hanna felveszi, amikor te nem tudod."
            : "AI call coverage: keep your number; Hanna answers when you can't.",
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
