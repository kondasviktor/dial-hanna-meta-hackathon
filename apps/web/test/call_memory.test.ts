import assert from "node:assert/strict";
import { test } from "node:test";

test("call turn shape stays chat-compatible", () => {
  const turns = [
    { role: "user" as const, content: "Chocolate cake, 16 slices" },
    { role: "assistant" as const, content: "What name should I put on the order?" },
    { role: "user" as const, content: "Viktor, phone 123456, Sunday 3pm" },
  ];
  const messages = [
    { role: "system", content: "sys" },
    ...turns.map((t) => ({ role: t.role, content: t.content })),
  ];
  assert.equal(messages.length, 4);
  assert.equal(messages[3]?.content.includes("Sunday"), true);
  assert.equal(messages.filter((m) => m.role === "user").length, 2);
});
