/**
 * Apify crawl for Dial Hanna knowledge import.
 * Creator plan blocks some Store actors (e.g. website-content-crawler →
 * public-actor-disabled). Use the included universal Cheerio Scraper instead.
 */

import { ApifyClient } from "apify-client";

export interface ApifyCrawlResult {
  text: string;
  pages: string[];
  source: "apify";
}

function originGlob(startUrl: string): string {
  const u = new URL(startUrl);
  const host = u.hostname.replace(/^www\./, "");
  return `http{s}://{www.,}${host}/**`;
}

const PAGE_FUNCTION = `async function pageFunction(context) {
  const { $, request, log } = context;
  $('script, style, noscript, svg').remove();
  const text = $('body').text().replace(/\\s+/g, ' ').trim();
  log.info('scraped', { url: request.url, chars: text.length });
  return { url: request.url, text };
}`;

/**
 * Crawl with apify/cheerio-scraper.
 * Returns null when APIFY_TOKEN is unset so callers can fall back locally.
 */
export async function crawlWithApifyWcc(
  startUrl: string,
  opts?: { maxPages?: number; waitSecs?: number },
): Promise<ApifyCrawlResult | null> {
  const token = process.env.APIFY_TOKEN?.trim();
  if (!token) return null;

  const maxPages = opts?.maxPages ?? 15;
  const waitSecs = opts?.waitSecs ?? 55;
  const client = new ApifyClient({ token });
  const start = new URL(startUrl);

  const input = {
    startUrls: [{ url: start.toString() }],
    keepUrlFragments: false,
    respectRobotsTxtFile: true,
    linkSelector: "a[href]",
    globs: [{ glob: originGlob(startUrl) }],
    excludes: [
      { glob: "/**/*.{png,jpg,jpeg,gif,webp,svg,pdf,zip,css,js}" },
      { glob: "/**/*{cart,kosar,login,logout,user,admin}*" },
    ],
    pageFunction: PAGE_FUNCTION,
    proxyConfiguration: { useApifyProxy: true },
    maxPagesPerCrawl: maxPages,
    maxResultsPerCrawl: maxPages,
    maxCrawlingDepth: 3,
    maxConcurrency: 5,
    maxRequestRetries: 2,
  };

  const run = await client.actor("apify/cheerio-scraper").call(input, {
    waitSecs,
    memory: 1024,
  });

  if (!run?.defaultDatasetId) throw new Error("apify-no-dataset");

  const { items } = await client.dataset(run.defaultDatasetId).listItems({ limit: maxPages });
  const pages: string[] = [];
  const chunks: string[] = [];
  let used = 0;
  const maxChars = 55_000;

  for (const item of items as Record<string, unknown>[]) {
    const url = String(item.url ?? "").trim();
    const body = String(item.text ?? "").trim();
    if (!url || body.length < 40) continue;
    const header = `\n\n=== PAGE: ${url} ===\n`;
    const room = maxChars - used - header.length;
    if (room < 200) break;
    const slice = body.slice(0, room);
    chunks.push(header + slice);
    used += header.length + slice.length;
    pages.push(url);
  }

  if (!pages.length) throw new Error("apify-empty-crawl");
  return { text: chunks.join("").trim(), pages, source: "apify" };
}
