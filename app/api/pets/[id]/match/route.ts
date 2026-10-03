import { and, eq } from "drizzle-orm";
import { idParam, json, route } from "@/lib/api";
import { HttpError, getCurrentUser } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { scoreForUser } from "@/lib/queries";
import { screeningState } from "@/lib/screening";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route<Ctx>(async (_req, { params }) => {
  const id = idParam((await params).id);
  const user = await getCurrentUser();
  if (!user) return json({ user: false });
  const db = await getDb();
  const [pet] = await db.select().from(schema.pets).where(eq(schema.pets.id, id)).limit(1);
  if (!pet) throw new HttpError(404, "Pet not found");
  const [application] = await db
    .select()
    .from(schema.applications)
    .where(and(eq(schema.applications.petId, id), eq(schema.applications.applicantId, user.id)))
    .limit(1);
  return json({
    user: true,
    isOwner: pet.ownerId === user.id,
    match: await scoreForUser(user.id, pet),
    application: application ? { id: application.id, ...screeningState(application) } : null,
  });
});
