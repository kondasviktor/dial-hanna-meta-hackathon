import { test } from "node:test";
import assert from "node:assert/strict";
import { isPlaceholderOrgName, orgNameToStore } from "../src/lib/org_name.ts";

// The owner names the org in Clerk ("Carlo's Bakery"); the dashboard must
// show that name, never the baked-in "Vállalkozás" placeholder.
test("clerk org name wins over placeholder and existing names", () => {
  assert.equal(orgNameToStore("Carlo's Bakery", "Vállalkozás"), "Carlo's Bakery");
  assert.equal(orgNameToStore("Carlo's Bakery", "Daubner Cukrászda"), "Carlo's Bakery");
  assert.equal(orgNameToStore("  Carlo's Bakery  ", null), "Carlo's Bakery");
  assert.equal(orgNameToStore(null, "Daubner Cukrászda"), "Daubner Cukrászda");
  assert.equal(orgNameToStore("", ""), "Vállalkozás");
  assert.equal(isPlaceholderOrgName("Vállalkozás"), true);
  assert.equal(isPlaceholderOrgName("Névtelen vállalkozás"), true);
  assert.equal(isPlaceholderOrgName("Carlo's Bakery"), false);
  assert.equal(isPlaceholderOrgName(null), true);
});
