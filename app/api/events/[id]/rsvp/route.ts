import { and, count, eq } from "drizzle-orm";
import { idParam, json, route } from "@/lib/api";
import { HttpError, requireApiUser } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

async function going(eventId: number) {
  const db = await getDb();
  const [row] = await db.select({ n: count() }).from(schema.eventRsvps).where(eq(schema.eventRsvps.eventId, eventId));
  return row?.n ?? 0;
}

export const POST = route<Ctx>(async (_req, ctx) => {
  const user = await requireApiUser();
  const eventId = idParam((await ctx.params).id);
  const db = await getDb();
  const [event] = await db.select({ endsAt: schema.events.endsAt }).from(schema.events).where(eq(schema.events.id, eventId)).limit(1);
  if (!event) throw new HttpError(404, "Event not found.");
  if (event.endsAt.getTime() < Date.now()) throw new HttpError(400, "This event has already ended.");
  await db.insert(schema.eventRsvps).values({ userId: user.id, eventId }).onConflictDoNothing();
  return json({ attending: true, going: await going(eventId) });
});

export const DELETE = route<Ctx>(async (_req, ctx) => {
  const user = await requireApiUser();
  const eventId = idParam((await ctx.params).id);
  const db = await getDb();
  await db.delete(schema.eventRsvps).where(and(eq(schema.eventRsvps.userId, user.id), eq(schema.eventRsvps.eventId, eventId)));
  return json({ attending: false, going: await going(eventId) });
});
