import { revalidatePath } from "next/cache";
import { and, eq, inArray, ne } from "drizzle-orm";
import { z } from "zod";
import { idParam, json, readJson, route } from "@/lib/api";
import { HttpError, requireApiUser } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { screeningState } from "@/lib/screening";

type Ctx = { params: Promise<{ id: string }> };
const Body = z.object({
  action: z.enum(["approve", "decline", "withdraw"]),
  note: z.string().trim().max(500).optional(),
});

export const PATCH = route<Ctx>(async (req, { params }) => {
  const user = await requireApiUser();
  const id = idParam((await params).id);
  const { action, note } = Body.parse(await readJson(req));
  const db = await getDb();
  const [row] = await db
    .select({ application: schema.applications, pet: schema.pets })
    .from(schema.applications)
    .innerJoin(schema.pets, eq(schema.applications.petId, schema.pets.id))
    .where(eq(schema.applications.id, id))
    .limit(1);
  if (!row) throw new HttpError(404, "Application not found");
  const { application, pet } = row;
  const state = screeningState(application);
  if (["approved", "declined", "withdrawn"].includes(state.status)) {
    throw new HttpError(409, "This application has already been decided.");
  }

  if (action === "withdraw") {
    if (application.applicantId !== user.id) throw new HttpError(403, "Only the applicant can withdraw.");
  } else {
    if (pet.ownerId !== user.id) throw new HttpError(403, "Only the pet's owner can make a decision.");
    if (action === "approve" && !state.complete) {
      throw new HttpError(409, "Screening must finish before you can approve this family.");
    }
  }

  const status = action === "approve" ? "approved" : action === "decline" ? "declined" : "withdrawn";
  const [updated] = await db
    .update(schema.applications)
    .set({ status, decisionNote: note || null, decidedAt: new Date() })
    .where(eq(schema.applications.id, id))
    .returning();

  if (status === "approved") {
    await db.update(schema.pets).set({ status: "adopted" }).where(eq(schema.pets.id, pet.id));
    await db
      .update(schema.applications)
      .set({ status: "declined", decisionNote: `${pet.name} was matched with another family.`, decidedAt: new Date() })
      .where(
        and(
          eq(schema.applications.petId, pet.id),
          ne(schema.applications.id, id),
          inArray(schema.applications.status, ["submitted", "screening"]),
        ),
      );
    revalidatePath("/pets");
    revalidatePath(`/pets/${pet.id}`);
    if (pet.ownerId) revalidatePath(`/owners/${pet.ownerId}`);
    revalidatePath("/");
  }
  return json({ application: updated });
});
