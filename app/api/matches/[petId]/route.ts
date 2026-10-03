import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { idParam, json, readJson, route } from "@/lib/api";
import { requireApiUser } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";

type Ctx = { params: Promise<{ petId: string }> };
const Body = z.object({ reaction: z.enum(["like", "pass"]) });

export const POST = route<Ctx>(async (req, { params }) => {
  const user = await requireApiUser();
  const petId = idParam((await params).petId);
  const { reaction } = Body.parse(await readJson(req));
  const db = await getDb();
  await db
    .insert(schema.petReactions)
    .values({ userId: user.id, petId, reaction })
    .onConflictDoUpdate({ target: [schema.petReactions.userId, schema.petReactions.petId], set: { reaction } });
  if (reaction === "like") {
    await db.insert(schema.favorites).values({ userId: user.id, petId }).onConflictDoNothing();
  }
  return json({ ok: true });
});

export const DELETE = route<Ctx>(async (_req, { params }) => {
  const user = await requireApiUser();
  const petId = idParam((await params).petId);
  const db = await getDb();
  await db
    .delete(schema.petReactions)
    .where(and(eq(schema.petReactions.userId, user.id), eq(schema.petReactions.petId, petId)));
  return json({ ok: true });
});
