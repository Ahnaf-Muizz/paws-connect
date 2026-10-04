import type { AppointmentKind } from "./db/schema";

export const APPOINTMENT_KINDS = ["meet-greet", "video", "home-visit"] as const;

export const APPOINTMENT_KIND_META: Record<AppointmentKind, { label: string; detail: string }> = {
  "meet-greet": { label: "Meet & greet", detail: "Meet in person at a park, the shelter, or the owner's home." },
  video: { label: "Video visit", detail: "A short video call to meet the pet before you travel." },
  "home-visit": { label: "Home visit", detail: "The owner or shelter visits your home after screening." },
};

const SLOT_HOURS = [10, 13, 16];

export function upcomingSlots(count = 12, from = new Date()): Date[] {
  const slots: Date[] = [];
  const start = new Date(from);
  start.setMinutes(0, 0, 0);
  for (let day = 1; day <= 14 && slots.length < count; day++) {
    for (const hour of SLOT_HOURS) {
      const d = new Date(start);
      d.setDate(start.getDate() + day);
      d.setHours(hour, 0, 0, 0);
      const weekday = d.getDay();
      if (weekday === 0) continue;
      if (d > from) slots.push(d);
      if (slots.length >= count) break;
    }
  }
  return slots;
}
