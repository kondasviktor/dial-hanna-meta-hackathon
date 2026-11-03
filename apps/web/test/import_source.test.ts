import { test } from "node:test";
import assert from "node:assert/strict";
import { detectImportKind } from "../src/lib/import_source.ts";

test("website URLs are accepted", () => {
  assert.equal(detectImportKind("https://vakvarju.com/"), "website");
  assert.equal(detectImportKind("https://daubnercukraszda.hu"), "website");
});

test("Facebook URLs are rejected", () => {
  assert.throws(() => detectImportKind("https://www.facebook.com/VakVarju/"), /facebook-not-supported/);
  assert.throws(() => detectImportKind("https://fb.com/example"), /facebook-not-supported/);
});
