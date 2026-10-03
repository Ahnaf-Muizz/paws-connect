import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { json, readJson, route } from "@/lib/api";
import { requireApiUser } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { CITIES, cityCoords } from "@/lib/pets";
import { getProfile } from "@/lib/queries";
import { ProfileInput } from "@/lib/validators";

const Body = ProfileInput.extend({ city: z.enum(CITIES as [string, ...string[]]).optional() });

export const GET = route(async () => {
  const user = await requireApiUser();
  return json({ profile: await getProfile(user.id) });
});

export const PUT = route(async (req) => {
  const user = await requireApiUser();
  const { city, ...input } = Body.parse(await readJson(req));
  const db = await getDb();
  const home = city ?? user.city;
  if (city && city !== user.city) await db.update(schema.users).set({ city }).where(eq(schema.users.id, user.id));
  const [lat, lng] = cityCoords(home);
  const values = { ...input, lat, lng, notes: input.notes ?? null, updatedAt: new Date() };
  const [profile] = await db
    .insert(schema.adopterProfiles)
    .values({ userId: user.id, ...values })
    .onConflictDoUpdate({ target: schema.adopterProfiles.userId, set: values })
    .returning();
  revalidatePath("/matches");
  return json({ profile });
});
