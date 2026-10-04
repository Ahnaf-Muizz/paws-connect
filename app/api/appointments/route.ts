import { and, eq } from "drizzle-orm";
import { json, readJson, route } from "@/lib/api";
import { HttpError, requireApiUser } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { listAppointmentsForUser } from "@/lib/queries";
import { AppointmentInput } from "@/lib/validators";

export const GET = route(async () => {
  const user = await requireApiUser();
  return json({ appointments: await listAppointmentsForUser(user.id) });
});

export const POST = route(async (req) => {
  const user = await requireApiUser();
  const { petId, kind, scheduledAt, notes } = AppointmentInput.parse(await readJson(req));
  const when = new Date(scheduledAt);
  if (when.getTime() < Date.now() - 60_000) throw new HttpError(400, "Pick a future time.");
  const db = await getDb();
  const [pet] = await db.select().from(schema.pets).where(eq(schema.pets.id, petId)).limit(1);
  if (!pet) throw new HttpError(404, "Pet not found");
  if (pet.ownerId === user.id) throw new HttpError(400, "You can't book a visit with your own listing.");
  if (pet.status !== "available") throw new HttpError(409, `${pet.name} is not available for visits.`);

  const [existing] = await db
    .select({ id: schema.appointments.id })
    .from(schema.appointments)
    .where(
      and(
        eq(schema.appointments.petId, petId),
        eq(schema.appointments.requesterId, user.id),
        eq(schema.appointments.status, "requested"),
      ),
    )
    .limit(1);
  if (existing) throw new HttpError(409, `You already have a pending visit with ${pet.name}.`);

  const [appointment] = await db
    .insert(schema.appointments)
    .values({
      petId,
      requesterId: user.id,
      kind,
      scheduledAt: when,
      notes: notes || null,
      status: "confirmed",
    })
    .returning();
  return json({ appointment }, { status: 201 });
});
