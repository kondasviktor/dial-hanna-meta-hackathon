/** Canonical public origin for SEO / sitemap / llms.txt. */
export function siteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "https://dialhanna.com";
  return raw.replace(/\/$/, "");
}

export const SITE = {
  name: "Dial Hanna",
  email: "hello@dialhanna.com",
  localeDefault: "hu_HU",
  localeEn: "en_US",
  geo: {
    region: "HU",
    placename: "Budapest",
    position: "47.4979;19.0402",
  },
} as const;
