import { desc, eq } from "drizzle-orm";
import { json, route } from "@/lib/api";
import { requireApiUser } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";

export const GET = route(async (req) => {
  const user = await requireApiUser();
  const db = await getDb();
  if (new URL(req.url).searchParams.get("ids")) {
    const rows = await db.select({ petId: schema.favorites.petId }).from(schema.favorites).where(eq(schema.favorites.userId, user.id));
    return json({ ids: rows.map((r) => r.petId) });
  }
  const pets = await db
    .select({ pet: schema.pets })
    .from(schema.favorites)
    .innerJoin(schema.pets, eq(schema.favorites.petId, schema.pets.id))
    .where(eq(schema.favorites.userId, user.id))
    .orderBy(desc(schema.favorites.createdAt));
  return json({ pets: pets.map((p) => p.pet) });
});
