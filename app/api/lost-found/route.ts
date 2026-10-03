import { revalidatePath } from "next/cache";
import { json, readJson, route } from "@/lib/api";
import { HttpError, requireApiUser } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { LostFoundInput } from "@/lib/validators";

export const POST = route(async (req) => {
  const user = await requireApiUser();
  const input = LostFoundInput.parse(await readJson(req));
  const lastSeenAt = new Date(input.lastSeenAt);
  if (lastSeenAt.getTime() > Date.now() + 5 * 60_000) throw new HttpError(400, "lastSeenAt: Date can't be in the future.");
  const db = await getDb();
  const [report] = await db
    .insert(schema.lostFound)
    .values({ ...input, petName: input.petName || null, photoUrl: input.photoUrl || null, lastSeenAt, reporterId: user.id })
    .returning();
  revalidatePath("/lost-found");
  return json({ report }, { status: 201 });
});
