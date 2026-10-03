import { and, eq } from "drizzle-orm";
import { json, readJson, route } from "@/lib/api";
import { HttpError, requireApiUser } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { listMyApplications, listReceivedApplications, scoreForUser } from "@/lib/queries";
import { ApplicationInput } from "@/lib/validators";

export const GET = route(async (req) => {
  const user = await requireApiUser();
  const scope = new URL(req.url).searchParams.get("scope");
  return json({
    applications: scope === "received" ? await listReceivedApplications(user.id) : await listMyApplications(user.id),
  });
});

export const POST = route(async (req) => {
  const user = await requireApiUser();
  const { petId, message } = ApplicationInput.parse(await readJson(req));
  const db = await getDb();
  const [pet] = await db.select().from(schema.pets).where(eq(schema.pets.id, petId)).limit(1);
  if (!pet) throw new HttpError(404, "Pet not found");
  if (pet.ownerId === user.id) throw new HttpError(400, "You can't apply to adopt your own pet.");
  if (pet.status !== "available") throw new HttpError(409, `${pet.name} is no longer accepting applications.`);

  const [existing] = await db
    .select({ id: schema.applications.id })
    .from(schema.applications)
    .where(and(eq(schema.applications.petId, petId), eq(schema.applications.applicantId, user.id)));
  if (existing) throw new HttpError(409, `You've already applied for ${pet.name}.`);

  const match = await scoreForUser(user.id, pet);
  const [application] = await db
    .insert(schema.applications)
    .values({ petId, applicantId: user.id, message, matchScore: match?.score ?? null })
    .returning();
  return json({ application }, { status: 201 });
});
