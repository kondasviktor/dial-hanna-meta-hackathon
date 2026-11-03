import test from "node:test";
import assert from "node:assert/strict";
import {
  extractSameOriginLinks,
  htmlToText,
  scoreCrawlUrl,
} from "../src/lib/crawl_site.ts";

test("scoreCrawlUrl boosts contact and menu paths", () => {
  assert.ok(scoreCrawlUrl("http://x.hu/elerhetosegek") > scoreCrawlUrl("http://x.hu/random"));
  assert.ok(scoreCrawlUrl("http://x.hu/azonnal-elviheto-tortak") > scoreCrawlUrl("http://x.hu/foo"));
});

test("extractSameOriginLinks keeps same host and drops assets", () => {
  const html = `
    <a href="/elerhetosegek">c</a>
    <a href="http://daubnercukraszda.hu/szeletes-sutemenyek">p</a>
    <a href="https://other.com/x">out</a>
    <a href="/logo.png">img</a>
    <a href="mailto:a@b.c">m</a>
  `;
  const links = extractSameOriginLinks(html, new URL("http://daubnercukraszda.hu/"));
  assert.ok(links.some((l) => l.includes("/elerhetosegek")));
  assert.ok(links.some((l) => l.includes("/szeletes-sutemenyek")));
  assert.equal(links.some((l) => l.includes("other.com")), false);
  assert.equal(links.some((l) => l.endsWith(".png")), false);
});

test("htmlToText strips tags and scripts", () => {
  const t = htmlToText("<html><script>x()</script><p>Szelet 950 Ft/db</p></html>");
  assert.match(t, /Szelet 950 Ft\/db/);
  assert.equal(t.includes("x()"), false);
});
