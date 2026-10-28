// Booking store with idempotency (Master Spec §6.7).
// Unique idempotency_key = call_id + slot_start + service_id + seq.
// Double-submit with the same key returns the original booking (no duplicate).
// In-memory here; Drizzle unique index enforces it in Postgres (§8).

import { bookingIdempotencyKey } from "./security.ts";

export interface Booking {
  id: string;
  orgId: string;
  callId: string;
  idempotencyKey: string;
  serviceId: string;
  slotStart: string;
  slotEnd: string;
  callerName: string;
  callerPhone: string;
  status: "confirmed" | "cancelled";
}

export interface BookArgs {
  callId: string;
  serviceId: string;
  slotStart: string;
  slotEnd: string;
  callerName: string;
  callerPhone: string;
  seq?: number;
}

export class BookingStore {
  private byKey = new Map<string, Booking>();
  private seq = 0;

  book(orgId: string, a: BookArgs): { booking: Booking; duplicate: boolean } {
    if (!a.callerName?.trim() || !a.callerPhone?.trim()) {
      throw new Error("confirm-name-phone-before-booking"); // spec §7.1 read-back rule
    }
    const key = bookingIdempotencyKey(a.callId, a.slotStart, a.serviceId, a.seq ?? 1);
    const existing = this.byKey.get(`${orgId}:${key}`);
    if (existing) return { booking: existing, duplicate: true };
    // Same slot + service double-booking guard (any caller, any seq).
    for (const b of this.byKey.values()) {
      if (b.orgId === orgId && b.serviceId === a.serviceId &&
          b.slotStart === a.slotStart && b.status === "confirmed") {
        throw new Error("slot-taken");
      }
    }
    this.seq += 1;
    const booking: Booking = {
      id: `bk_${this.seq}`,
      orgId,
      callId: a.callId,
      idempotencyKey: key,
      serviceId: a.serviceId,
      slotStart: a.slotStart,
      slotEnd: a.slotEnd,
      callerName: a.callerName,
      callerPhone: a.callerPhone,
      status: "confirmed",
    };
    this.byKey.set(`${orgId}:${key}`, booking);
    return { booking, duplicate: false };
  }

  cancel(orgId: string, callerPhone: string, slotStart?: string): Booking[] {
    const hit = [...this.byKey.values()].filter(
      (b) => b.orgId === orgId && b.callerPhone === callerPhone &&
        b.status === "confirmed" && (!slotStart || b.slotStart === slotStart),
    );
    for (const b of hit) b.status = "cancelled";
    return hit;
  }

  reschedule(orgId: string, bookingId: string, newStart: string, newEnd: string): Booking {
    const b = [...this.byKey.values()].find((x) => x.orgId === orgId && x.id === bookingId);
    if (!b || b.status !== "confirmed") throw new Error("booking-not-found");
    for (const o of this.byKey.values()) {
      if (o !== b && o.orgId === orgId && o.serviceId === b.serviceId &&
          o.slotStart === newStart && o.status === "confirmed") {
        throw new Error("slot-taken");
      }
    }
    b.slotStart = newStart;
    b.slotEnd = newEnd;
    return b;
  }
}
