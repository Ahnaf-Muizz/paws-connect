import { revalidatePath } from "next/cache";
import { json, readJson, route } from "@/lib/api";
import { requireApiUser } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { listPets, type PetFilters } from "@/lib/queries";
import { PetInput } from "@/lib/validators";
import { ageGroupFor, cityCoords, monthlyCostFor } from "@/lib/pets";

export const GET = route(async (req) => {
  const p = new URL(req.url).searchParams;
  const list = (k: string) => p.get(k)?.split(",").filter(Boolean) as never;
  const filters: PetFilters = {
    q: p.get("q") ?? undefined,
    species: list("species"),
    size: list("size"),
    age: list("age"),
    energy: list("energy"),
    kids: p.get("kids") === "1",
    dogs: p.get("dogs") === "1",
    cats: p.get("cats") === "1",
  };
  return json({ pets: await listPets(filters) });
});

export const POST = route(async (req) => {
  const user = await requireApiUser();
  const input = PetInput.parse(await readJson(req));
  const [lat, lng] = cityCoords(input.city);
  const db = await getDb();
  const [pet] = await db
    .insert(schema.pets)
    .values({
      ...input,
      rehomeReason: input.rehomeReason || null,
      ageGroup: ageGroupFor(input.species, input.ageYears),
      monthlyCost: monthlyCostFor(input.species, input.size),
      ownerId: user.id,
      lat,
      lng,
    })
    .returning();
  revalidatePath("/pets");
  revalidatePath("/");
  revalidatePath("/owners");
  revalidatePath(`/owners/${user.id}`);
  return json({ pet }, { status: 201 });
});
