// Availability computation (Master Spec §6.7 get_availability).
// working hours + service duration + buffers − busy intervals → up to 5 slots.
// All inputs/outputs ISO Europe/Budapest wall-clock; pure function, the Google
// busy list plugs in at the API boundary.

export interface DayHours {
  weekday: number; // 1=Mon..7=Sun (ISO)
  open: string; // "09:00"
  close: string; // "18:00"
}

export interface Busy {
  start: string; // ISO
  end: string; // ISO
}

function toMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// weekday: Date.getDay() (0=Sun) → ISO (7=Sun)
export function isoWeekday(d: Date): number {
  return d.getDay() === 0 ? 7 : d.getDay();
}

export function computeAvailability(opts: {
  serviceDurationMin: number;
  bufferMin: number;
  hours: DayHours[];
  busy: Busy[];
  fromIso: string;
  toIso: string;
  stepMin?: number;
  maxSlots?: number;
}): string[] {
  const step = opts.stepMin ?? 15;
  const max = opts.maxSlots ?? 5;
  const from = new Date(opts.fromIso).getTime();
  const to = new Date(opts.toIso).getTime();
  const busyMs = opts.busy.map((b) => ({ s: new Date(b.start).getTime(), e: new Date(b.end).getTime() }));
  const slots: string[] = [];
  // Walk day by day from `from` (caller passes Europe/Budapest wall-clock ISOs
  // without offset; Date parses them as local — the runtime TZ is set to
  // Europe/Budapest on the server).
  const cursor = new Date(opts.fromIso);
  while (cursor.getTime() <= to && slots.length < max) {
    const day = opts.hours.find((h) => h.weekday === isoWeekday(cursor));
    if (day) {
      const y = cursor.getFullYear();
      const mo = pad(cursor.getMonth() + 1);
      const d = pad(cursor.getDate());
      for (let t = toMin(day.open); t + opts.serviceDurationMin <= toMin(day.close); t += step) {
        const start = new Date(`${y}-${mo}-${d}T${pad(Math.floor(t / 60))}:${pad(t % 60)}:00`).getTime();
        const end = start + (opts.serviceDurationMin + opts.bufferMin) * 60_000;
        if (start < from) continue;
        const clash = busyMs.some((b) => start < b.e && b.s < end);
        if (!clash) {
          // Europe/Budapest wall-clock ISO (no offset suffix); the server TZ
          // is Europe/Budapest, so local components ARE Budapest time.
          const sd = new Date(start);
          slots.push(
            `${sd.getFullYear()}-${pad(sd.getMonth() + 1)}-${pad(sd.getDate())}T${pad(sd.getHours())}:${pad(sd.getMinutes())}`,
          );
          if (slots.length >= max) break;
        }
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return slots;
}
