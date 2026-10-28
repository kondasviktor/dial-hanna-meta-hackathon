import { test } from "node:test";
import assert from "node:assert/strict";
import { hungarianArticle, renderGreeting } from "../src/lib/greeting.ts";

test("a/az article", () => {
  assert.equal(hungarianArticle("Teszt Szalon"), "a"); // consonant
  assert.equal(hungarianArticle("Anna Szalon"), "az"); // vowel
  assert.equal(hungarianArticle("Éva Fodrászat"), "az");
});

test("HU greeting has AI disclosure first", () => {
  const g = renderGreeting({ businessName: "Teszt Szalon", language: "hu" });
  assert.match(g, /mesterséges intelligencia/);
  assert.match(g, /Hanna/);
  assert.doesNotMatch(g, /rögzítjük/);
});

test("HU greeting with recording adds disclosure", () => {
  const g = renderGreeting({ businessName: "Anna Szalon", language: "hu", recordingOn: true });
  assert.match(g, /az Anna Szalon vonalán/);
  assert.match(g, /rögzítjük/);
});

test("EN greeting", () => {
  const g = renderGreeting({ businessName: "Test Salon", language: "en", recordingOn: true });
  assert.match(g, /AI assistant/);
  assert.match(g, /recorded/);
});
