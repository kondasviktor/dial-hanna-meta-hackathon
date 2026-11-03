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

function isFacebookHost(hostname: string): boolean {
  const h = hostname.replace(/^www\./, "").toLowerCase();
  return h === "facebook.com" || h === "fb.com" || h === "m.facebook.com" || h.endsWith(".facebook.com");
}

/** Pull a real business website out of Graph JSON or scraped FB HTML. */
export function extractLinkedWebsite(facebookDump: string): string | null {
  const candidates: string[] = [];

  // Graph JSON: "website": "https://vakvarju.com"
  const graphWebsite = facebookDump.match(/"website"\s*:\s*"([^"]+)"/i);
  if (graphWebsite?.[1]) {
    candidates.push(graphWebsite[1].replace(/\\u002F/g, "/").trim());
  }

  // Plain http(s) URLs
  const urlRe = /https?:\/\/[^\s"'<>\\]+/gi;
  let m: RegExpExecArray | null;
  while ((m = urlRe.exec(facebookDump)) !== null) {
    candidates.push(m[0]);
  }

  // Percent-encoded URLs inside FB redirect wrappers
  const encRe = /https?%3A%2F%2F[a-z0-9.%_-]+/gi;
  while ((m = encRe.exec(facebookDump)) !== null) {
    try {
      candidates.push(decodeURIComponent(m[0]));
    } catch {
      /* skip */
    }
  }

  const seen = new Set<string>();
  for (const raw of candidates) {
    const normalized = normalizeExternalUrl(raw);
    if (!normalized) continue;
    try {
      const host = new URL(normalized).hostname.replace(/^www\./, "").toLowerCase();
      if (seen.has(host)) continue;
      seen.add(host);
      if (
        host.includes("facebook.") ||
        host.includes("fbcdn.") ||
        host.includes("instagram.") ||
        host.includes("meta.com") ||
        host.includes("whatsapp.") ||
        host.includes("google.")
      ) {
        continue;
      }
      return normalized;
    } catch {
      /* skip */
    }
  }
  return null;
}

function normalizeExternalUrl(raw: string): string | null {
  let s = raw.trim().replace(/[),.;]+$/g, "");
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  try {
    const u = new URL(s);
    if (isFacebookHost(u.hostname)) return null;
    if (!u.hostname.includes(".")) return null;
    return u.toString();
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

  // Fallback: public HTML (often thin / login-walled).
  const r = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "hu-HU,hu;q=0.9,en;q=0.8",
    },
    redirect: "follow",
  });
  if (!r.ok) throw new Error(`facebook-fetch-${r.status}`);
  const html = await r.text();
  return `Facebook Page URL: ${url}\n\nPAGE HTML (may be login-walled):\n${html.slice(0, 20_000)}`;
}
