import { test } from "node:test";
import assert from "node:assert/strict";
import { extractLinkedWebsite, facebookPageSlug } from "../src/lib/import_source.ts";

test("facebookPageSlug reads VakVarju", () => {
  assert.equal(facebookPageSlug("https://www.facebook.com/VakVarju/"), "VakVarju");
});

test("extractLinkedWebsite from Graph JSON", () => {
  const dump = `Facebook Page URL: https://www.facebook.com/VakVarju/\n\nGraph JSON:\n${JSON.stringify({
    name: "VakVarju",
    website: "https://vakvarju.com",
    category: "Restaurant",
  })}`;
  assert.equal(extractLinkedWebsite(dump), "https://vakvarju.com/");
});

test("extractLinkedWebsite ignores facebook hosts", () => {
  const dump = `PAGE HTML https://www.facebook.com/VakVarju/ https://instagram.com/x https://vakvarju.com/menu`;
  assert.equal(extractLinkedWebsite(dump), "https://vakvarju.com/menu");
});
