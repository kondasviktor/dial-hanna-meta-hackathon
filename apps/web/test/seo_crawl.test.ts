import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

test("robots and sitemap route modules exist", () => {
  assert.equal(existsSync(new URL("../app/robots.ts", import.meta.url)), true);
  assert.equal(existsSync(new URL("../app/sitemap.ts", import.meta.url)), true);
});

test("llms.txt is published for AI crawlers", () => {
  const p = new URL("../public/llms.txt", import.meta.url);
  assert.equal(existsSync(p), true);
  const txt = readFileSync(p, "utf8");
  assert.match(txt, /Dial Hanna/);
  assert.match(txt, /https:\/\/dialhanna\.com/);
  assert.match(txt, /Waitlist|várólista/i);
});

test("root layout exports viewport and geo-friendly metadata hooks", () => {
  const src = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
  assert.match(src, /export const viewport/);
  assert.match(src, /geo\.region/);
  assert.match(src, /metadataBase/);
  assert.match(src, /alternates/);
});
