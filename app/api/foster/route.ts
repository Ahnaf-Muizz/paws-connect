import { and, eq } from "drizzle-orm";
import { json, readJson, route } from "@/lib/api";
import { HttpError, requireApiUser } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { FosterInput } from "@/lib/validators";

export const POST = route(async (req) => {
  const user = await requireApiUser();
  const input = FosterInput.parse(await readJson(req));
  const db = await getDb();
  const [shelter] = await db
    .select({ name: schema.shelters.name, acceptsFosters: schema.shelters.acceptsFosters })
    .from(schema.shelters)
    .where(eq(schema.shelters.id, input.shelterId))
    .limit(1);
  if (!shelter) throw new HttpError(404, "Shelter not found.");
  if (!shelter.acceptsFosters) throw new HttpError(400, `${shelter.name} isn't recruiting fosters right now.`);
  const [dupe] = await db
    .select({ id: schema.fosterApplications.id })
    .from(schema.fosterApplications)
    .where(and(eq(schema.fosterApplications.userId, user.id), eq(schema.fosterApplications.shelterId, input.shelterId)))
    .limit(1);
  if (dupe) throw new HttpError(409, `You've already signed up to foster with ${shelter.name}.`);
  const [application] = await db
    .insert(schema.fosterApplications)
    .values({ ...input, notes: input.notes || null, userId: user.id })
    .returning();
  return json({ application, shelter: shelter.name }, { status: 201 });
});
