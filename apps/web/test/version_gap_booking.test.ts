import { test } from "node:test";
import assert from "node:assert/strict";
import { publish, rollback, canPublish } from "../src/lib/versions.ts";
import { buildFaqDraft, inboxByFrequency } from "../src/lib/gaps.ts";
import { computeAvailability } from "../src/lib/availability.ts";
import { BookingStore } from "../src/lib/bookings.ts";

test("publish swaps live atomically", () => {
  const vs = [
    { id: "v1", orgId: "o", status: "live" as const },
    { id: "v2", orgId: "o", status: "tested" as const, readinessScore: 92 },
  ];
  const r = publish(vs, "o", "v2");
  assert.equal(r.publishedId, "v2");
  assert.equal(r.versions.find((v) => v.id === "v2")!.status, "live");
  assert.equal(r.versions.find((v) => v.id === "v1")!.status, "archived");
});

test("draft needs owner override", () => {
  const vs = [{ id: "v1", orgId: "o", status: "draft" as const }];
  assert.equal(canPublish(vs[0]).ok, false);
  const r = publish(vs, "o", "v1", true);
  assert.match(r.warning!, /untested/);
});

test("rollback restores previous live", () => {
  const vs = [
    { id: "v1", orgId: "o", status: "archived" as const },
    { id: "v2", orgId: "o", status: "live" as const, rollbackFrom: "v1" },
  ];
  const r = rollback(vs, "o");
  assert.equal(r.publishedId, "v1");
  assert.throws(() => rollback([{ id: "x", orgId: "o", status: "live" as const }], "o"), /nothing-to-rollback/);
});

test("orgs are isolated", () => {
  const vs = [
    { id: "v1", orgId: "a", status: "live" as const },
    { id: "v2", orgId: "b", status: "tested" as const },
  ];
  const r = publish(vs, "b", "v2");
  assert.equal(r.versions.find((v) => v.id === "v1")!.status, "live");
});

test("FAQ draft requires an answer; inbox sorts by frequency", () => {
  assert.throws(() => buildFaqDraft("Hol parkoljak?", "  "), /empty-gap-answer/);
  const d = buildFaqDraft("Hol parkoljak", "A Blaha parkolóházban.");
  assert.equal(d.qHu, "Hol parkoljak?");
  assert.match(d.qEn, /TRANSLATION-NEEDED/);
  const gaps = [
    { id: "g1", orgId: "o", callId: "c", question: "q", context: "", timesAsked: 1, status: "open" as const },
    { id: "g2", orgId: "o", callId: "c", question: "q", context: "", timesAsked: 5, status: "open" as const },
    { id: "g3", orgId: "o", callId: "c", question: "q", context: "", timesAsked: 9, status: "approved" as const },
  ];
  assert.deepEqual(inboxByFrequency(gaps).map((g) => g.id), ["g2", "g1"]);
});

test("availability skips busy and closed days, caps at 5", () => {
  const slots = computeAvailability({
    serviceDurationMin: 45,
    bufferMin: 15,
    hours: [{ weekday: 3, open: "09:00", close: "12:00" }],
    busy: [{ start: "2026-10-28T09:00:00", end: "2026-10-28T10:00:00" }],
    fromIso: "2026-10-28T08:00:00",
    toIso: "2026-10-29T18:00:00",
  });
  assert.ok(slots.length > 0 && slots.length <= 5);
  assert.ok(slots.every((s) => !s.startsWith("2026-10-28T09")));
});

test("booking: idempotent retry, no double-book, cancel, reschedule", () => {
  const store = new BookingStore();
  const args = {
    callId: "c1", serviceId: "noi_hajvagas",
    slotStart: "2026-10-30T15:00", slotEnd: "2026-10-30T15:45",
    callerName: "Kovács Anna", callerPhone: "+36301234567",
  };
  const first = store.book("o", args);
  assert.equal(first.duplicate, false);
  const retry = store.book("o", args);
  assert.equal(retry.duplicate, true);
  assert.equal(retry.booking.id, first.booking.id);
  assert.throws(() => store.book("o", { ...args, callId: "c2", seq: 2 }), /slot-taken/);
  assert.throws(() => store.book("o", { ...args, callerName: " " }), /confirm-name-phone/);
  const moved = store.reschedule("o", first.booking.id, "2026-10-30T16:00", "2026-10-30T16:45");
  assert.equal(moved.slotStart, "2026-10-30T16:00");
  const cancelled = store.cancel("o", "+36301234567");
  assert.equal(cancelled.length, 1);
  assert.equal(cancelled[0].status, "cancelled");
});
