import { and, eq } from "drizzle-orm";
import { idParam, json, route } from "@/lib/api";
import { HttpError, requireApiUser } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";

type Ctx = { params: Promise<{ petId: string }> };

export const POST = route<Ctx>(async (_req, { params }) => {
  const user = await requireApiUser();
  const petId = idParam((await params).petId);
  const db = await getDb();
  const [pet] = await db.select({ id: schema.pets.id }).from(schema.pets).where(eq(schema.pets.id, petId));
  if (!pet) throw new HttpError(404, "Pet not found");
  await db.insert(schema.favorites).values({ userId: user.id, petId }).onConflictDoNothing();
  return json({ favorite: true });
});

export const DELETE = route<Ctx>(async (_req, { params }) => {
  const user = await requireApiUser();
  const petId = idParam((await params).petId);
  const db = await getDb();
  await db.delete(schema.favorites).where(and(eq(schema.favorites.userId, user.id), eq(schema.favorites.petId, petId)));
  return json({ favorite: false });
});
