/**
 * Apify crawl for Dial Hanna knowledge import.
 * Prefer Cheerio (fast/cheap); fall back to Web Scraper (Puppeteer) when
 * HTML-only crawl fails (JS-heavy sites, proxy quirks). Local crawl is last.
 */

import { ApifyClient } from "apify-client";

export interface ApifyCrawlResult {
  text: string;
  pages: string[];
  source: "apify";
  engine: "cheerio" | "web-scraper";
}

function originGlob(startUrl: string): string {
  const u = new URL(startUrl);
  const host = u.hostname.replace(/^www\./, "");
  return `http{s}://{www.,}${host}/**`;
}

const CHEERIO_PAGE_FUNCTION = `async function pageFunction(context) {
  const { $, request, log } = context;
  $('script, style, noscript, svg').remove();
  const text = $('body').text().replace(/\\s+/g, ' ').trim();
  log.info('scraped', { url: request.url, chars: text.length });
  return { url: request.url, text };
}`;

const WEB_PAGE_FUNCTION = `async function pageFunction(context) {
  const { request, log, jQuery: $ } = context;
  $('script, style, noscript, svg').remove();
  const text = $('body').text().replace(/\\s+/g, ' ').trim();
  log.info('scraped', { url: request.url, chars: text.length });
  return { url: request.url, text };
}`;

function sharedLimits(maxPages: number) {
  return {
    keepUrlFragments: false,
    respectRobotsTxtFile: true,
    linkSelector: "a[href]",
    excludes: [
      { glob: "/**/*.{png,jpg,jpeg,gif,webp,svg,pdf,zip,css,js}" },
      { glob: "/**/*{cart,kosar,login,logout,user,admin}*" },
    ],
    proxyConfiguration: { useApifyProxy: true },
    maxPagesPerCrawl: maxPages,
    maxResultsPerCrawl: maxPages,
    maxCrawlingDepth: 3,
    maxRequestRetries: 2,
  };
}

async function datasetToResult(
  client: ApifyClient,
  datasetId: string,
  maxPages: number,
  engine: ApifyCrawlResult["engine"],
): Promise<ApifyCrawlResult> {
  const { items } = await client.dataset(datasetId).listItems({ limit: maxPages });
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
  return { text: chunks.join("").trim(), pages, source: "apify", engine };
}

/**
 * Crawl with apify/cheerio-scraper (HTML-only, fast).
 * Returns null when APIFY_TOKEN is unset so callers can fall back locally.
 */
export async function crawlWithApifyCheerio(
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
    ...sharedLimits(maxPages),
    globs: [{ glob: originGlob(startUrl) }],
    pageFunction: CHEERIO_PAGE_FUNCTION,
    maxConcurrency: 5,
  };

  const run = await client.actor("apify/cheerio-scraper").call(input, {
    waitSecs,
    memory: 1024,
  });

  if (!run?.defaultDatasetId) throw new Error("apify-no-dataset");
  return datasetToResult(client, run.defaultDatasetId, maxPages, "cheerio");
}

/**
 * Crawl with apify/web-scraper (Puppeteer). Heavier; use when Cheerio fails.
 */
export async function crawlWithApifyWebScraper(
  startUrl: string,
  opts?: { maxPages?: number; waitSecs?: number },
): Promise<ApifyCrawlResult | null> {
  const token = process.env.APIFY_TOKEN?.trim();
  if (!token) return null;

  const maxPages = opts?.maxPages ?? 12;
  const waitSecs = opts?.waitSecs ?? 120;
  const client = new ApifyClient({ token });
  const start = new URL(startUrl);

  const input = {
    runMode: "PRODUCTION",
    startUrls: [{ url: start.toString() }],
    ...sharedLimits(maxPages),
    globs: [{ glob: originGlob(startUrl) }],
    injectJQuery: true,
    pageFunction: WEB_PAGE_FUNCTION,
    maxConcurrency: 3,
    downloadMedia: false,
    pageLoadTimeoutSecs: 45,
    waitUntil: ["domcontentloaded"],
  };

  const run = await client.actor("apify/web-scraper").call(input, {
    waitSecs,
    memory: 2048,
  });

  if (!run?.defaultDatasetId) throw new Error("apify-no-dataset");
  return datasetToResult(client, run.defaultDatasetId, maxPages, "web-scraper");
}

/**
 * Cheerio first, then apify/web-scraper if empty/failed. Returns null if no token.
 * Does not use website-content-crawler (WCC) — that needs a higher Apify plan.
 */
export async function crawlWithApify(
  startUrl: string,
  opts?: { maxPages?: number },
): Promise<ApifyCrawlResult | null> {
  if (!process.env.APIFY_TOKEN?.trim()) return null;

  try {
    const cheerio = await crawlWithApifyCheerio(startUrl, opts);
    if (cheerio?.pages.length) return cheerio;
  } catch (e) {
    console.error("apify-cheerio-failed", e);
  }

  try {
    const browser = await crawlWithApifyWebScraper(startUrl, {
      maxPages: Math.min(opts?.maxPages ?? 12, 12),
    });
    if (browser?.pages.length) return browser;
  } catch (e) {
    console.error("apify-web-scraper-failed", e);
  }

  return null;
}
