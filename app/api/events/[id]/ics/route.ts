import { eq } from "drizzle-orm";
import { idParam, route } from "@/lib/api";
import { HttpError } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");

export const GET = route<Ctx>(async (_req, ctx) => {
  const id = idParam((await ctx.params).id);
  const db = await getDb();
  const [event] = await db.select().from(schema.events).where(eq(schema.events.id, id)).limit(1);
  if (!event) throw new HttpError(404, "Event not found.");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PAWS Connect//Events//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:event-${event.id}@pawsconnect`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(event.startsAt)}`,
    `DTEND:${stamp(event.endsAt)}`,
    `SUMMARY:${esc(event.title)}`,
    `DESCRIPTION:${esc(event.description)}`,
    `LOCATION:${esc(`${event.location}, ${event.address}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const slug = event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug || "event"}.ics"`,
    },
  });
});
