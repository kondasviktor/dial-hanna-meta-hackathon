/** Same-origin multi-page crawl for knowledge import (not homepage-only). */

export const BROWSER_HEADERS: HeadersInit = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "hu-HU,hu;q=0.9,en;q=0.8",
};

const SKIP_EXT = /\.(pdf|jpe?g|png|gif|webp|svg|ico|css|js|mp4|mp3|zip|docx?|xlsx?)(\?|$)/i;
const SKIP_PATH =
  /\/(user|login|logout|cart|checkout|admin|wp-admin|node\/add|comment\/reply)(\/|$)/i;

/** Priority boost for contact / menu / price-ish paths. */
export function scoreCrawlUrl(href: string): number {
  const p = href.toLowerCase();
  let s = 0;
  if (/elerhet|kapcsolat|contact|nyitvatart|hours|about|rolunk/.test(p)) s += 50;
  if (/arlista|arak|price|menu|kinalat|termek|product|tort|cake|sutemen|parfe|szelet/.test(p))
    s += 40;
  if (/rendel|order|foglal|book|szolgaltat|service|parking|parkolo|fizet|payment/.test(p)) s += 30;
  if (/azonnal|disztort|tekercs|makaron|szaloncukor/.test(p)) s += 20;
  if (p.endsWith("/") || /\/(index|home|fooldal)/.test(p)) s += 5;
  // Prefer shorter product category URLs over deep query noise.
  s -= Math.min(20, (href.split("/").length - 3) * 2);
  return s;
}

export function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractSameOriginLinks(html: string, base: URL): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const re = /href\s*=\s*["']([^"'#]+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    let raw = m[1].trim();
    if (!raw || raw.startsWith("mailto:") || raw.startsWith("tel:") || raw.startsWith("javascript:"))
      continue;
    try {
      const abs = new URL(raw, base);
      if (abs.protocol !== "http:" && abs.protocol !== "https:") continue;
      if (abs.hostname.replace(/^www\./, "") !== base.hostname.replace(/^www\./, "")) continue;
      if (SKIP_EXT.test(abs.pathname) || SKIP_PATH.test(abs.pathname)) continue;
      abs.hash = "";
      // Drop tracking query noise but keep meaningful ?page=
      const clean = `${abs.origin}${abs.pathname}${abs.search}`;
      if (seen.has(clean)) continue;
      seen.add(clean);
      out.push(clean);
    } catch {
      /* ignore bad href */
    }
  }
  return out;
}

export interface CrawlResult {
  text: string;
  pages: string[];
}

/**
 * Fetch start URL + high-value same-origin pages (nav / menu / contact).
 * Caps pages and total text so Meta extract stays within budget.
 */
export async function crawlWebsite(
  startUrl: string,
  opts?: { maxPages?: number; maxChars?: number },
): Promise<CrawlResult> {
  const maxPages = opts?.maxPages ?? 12;
  const maxChars = opts?.maxChars ?? 55_000;
  const start = new URL(startUrl);
  if (!["http:", "https:"].includes(start.protocol)) throw new Error("bad-url");

  async function get(url: string): Promise<{ url: string; html: string } | null> {
    try {
      const r = await fetch(url, { headers: BROWSER_HEADERS, redirect: "follow" });
      if (!r.ok) return null;
      const ct = r.headers.get("content-type") ?? "";
      if (ct && !/html|text|xml/i.test(ct)) return null;
      return { url: r.url || url, html: await r.text() };
    } catch {
      return null;
    }
  }

  const home = await get(start.toString());
  if (!home) throw new Error("fetch-home-failed");

  const candidates = extractSameOriginLinks(home.html, new URL(home.url))
    .filter((u) => u !== home.url && u.replace(/\/$/, "") !== home.url.replace(/\/$/, ""))
    .sort((a, b) => scoreCrawlUrl(b) - scoreCrawlUrl(a));

  const chosen = candidates.slice(0, Math.max(0, maxPages - 1));
  const pages: { url: string; text: string }[] = [
    { url: home.url, text: htmlToText(home.html) },
  ];

  // Parallel batches of 4
  for (let i = 0; i < chosen.length; i += 4) {
    const batch = chosen.slice(i, i + 4);
    const results = await Promise.all(batch.map((u) => get(u)));
    for (const r of results) {
      if (!r) continue;
      const text = htmlToText(r.html);
      if (text.length < 80) continue;
      pages.push({ url: r.url, text });
    }
  }

  const chunks: string[] = [];
  let used = 0;
  const usedUrls: string[] = [];
  for (const p of pages) {
    const header = `\n\n=== PAGE: ${p.url} ===\n`;
    const room = maxChars - used - header.length;
    if (room < 200) break;
    const slice = p.text.slice(0, room);
    chunks.push(header + slice);
    used += header.length + slice.length;
    usedUrls.push(p.url);
  }

  return { text: chunks.join("").trim(), pages: usedUrls };
}
