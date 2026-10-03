import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { idParam, json, readJson, route } from "@/lib/api";
import { HttpError, requireApiUser } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { ageGroupFor, cityCoords, monthlyCostFor } from "@/lib/pets";
import { getPet } from "@/lib/queries";
import { PetInput } from "@/lib/validators";

type Ctx = { params: Promise<{ id: string }> };

function revalidatePets(id: number, ownerId: number) {
  revalidatePath("/");
  revalidatePath("/pets");
  revalidatePath(`/pets/${id}`);
  revalidatePath(`/owners/${ownerId}`);
}

export const GET = route<Ctx>(async (_req, { params }) => {
  const pet = await getPet(idParam((await params).id));
  if (!pet) throw new HttpError(404, "Pet not found");
  return json(pet);
});

async function ownPet(id: number, userId: number) {
  const db = await getDb();
  const [pet] = await db.select().from(schema.pets).where(eq(schema.pets.id, id)).limit(1);
  if (!pet) throw new HttpError(404, "Pet not found");
  if (pet.ownerId !== userId) throw new HttpError(403, "You can only edit pets you posted.");
  return { db, pet };
}

export const PATCH = route<Ctx>(async (req, { params }) => {
  const user = await requireApiUser();
  const id = idParam((await params).id);
  const { db } = await ownPet(id, user.id);
  const body = (await readJson(req)) as Record<string, unknown>;

  if (typeof body.status === "string" && Object.keys(body).length === 1) {
    if (!["available", "pending", "adopted"].includes(body.status)) throw new HttpError(400, "Invalid status");
    const [pet] = await db
      .update(schema.pets)
      .set({ status: body.status as schema.PetStatus })
      .where(eq(schema.pets.id, id))
      .returning();
    revalidatePets(id, user.id);
    return json({ pet });
  }

  const input = PetInput.parse(body);
  const [lat, lng] = cityCoords(input.city);
  const [pet] = await db
    .update(schema.pets)
    .set({
      ...input,
      rehomeReason: input.rehomeReason || null,
      ageGroup: ageGroupFor(input.species, input.ageYears),
      monthlyCost: monthlyCostFor(input.species, input.size),
      lat,
      lng,
    })
    .where(eq(schema.pets.id, id))
    .returning();
  revalidatePets(id, user.id);
  return json({ pet });
});

export const DELETE = route<Ctx>(async (_req, { params }) => {
  const user = await requireApiUser();
  const id = idParam((await params).id);
  const { db } = await ownPet(id, user.id);
  await db.delete(schema.pets).where(eq(schema.pets.id, id));
  revalidatePets(id, user.id);
  return json({ ok: true });
});
