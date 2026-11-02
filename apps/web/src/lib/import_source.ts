/** Normalize website or Facebook Page URLs into text Wonder can extract from. */

export type ImportKind = "website" | "facebook";

export function detectImportKind(raw: string): ImportKind {
  try {
    const u = new URL(raw.trim());
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "facebook.com" || host === "fb.com" || host === "m.facebook.com") {
      return "facebook";
    }
  } catch {
    /* fall through */
  }
  return "website";
}

/** facebook.com/FooBar → FooBar; ignores query noise. */
export function facebookPageSlug(url: string): string | null {
  try {
    const u = new URL(url.trim());
    const parts = u.pathname.split("/").filter(Boolean);
    if (!parts.length) return null;
    const skip = new Set(["pages", "profile.php", "people", "public"]);
    const slug = parts.find((p) => !skip.has(p.toLowerCase()));
    return slug ? decodeURIComponent(slug) : null;
  } catch {
    return null;
  }
}

/**
 * Fetch public page fields via Graph API when FACEBOOK_PAGE_ACCESS_TOKEN is set
 * (Meta App in development mode + your test Page is enough for the hackathon video).
 */
export async function fetchFacebookPageText(url: string): Promise<string> {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN?.trim();
  const slug = facebookPageSlug(url);
  if (!slug) throw new Error("facebook-slug-missing");

  if (token) {
    const fields = [
      "name",
      "about",
      "description",
      "website",
      "phone",
      "emails",
      "single_line_address",
      "location",
      "hours",
      "category",
      "link",
    ].join(",");
    const endpoint = new URL(`https://graph.facebook.com/v21.0/${encodeURIComponent(slug)}`);
    endpoint.searchParams.set("fields", fields);
    endpoint.searchParams.set("access_token", token);
    const r = await fetch(endpoint.toString());
    const body = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = (body as { error?: { message?: string } }).error?.message ?? `graph-${r.status}`;
      throw new Error(`facebook-graph:${msg}`);
    }
    return `Facebook Page URL: ${url}\n\nGraph JSON:\n${JSON.stringify(body, null, 2)}`;
  }

  // Fallback: public HTML (often thin). Wonder still sees the URL in the prompt.
  const r = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; DialHannaBot/0.1; +https://dialhanna.com)",
      Accept: "text/html",
    },
    redirect: "follow",
  });
  if (!r.ok) throw new Error(`facebook-fetch-${r.status}`);
  const html = await r.text();
  return `Facebook Page URL: ${url}\n\nPAGE HTML (may be login-walled):\n${html.slice(0, 20_000)}`;
}
