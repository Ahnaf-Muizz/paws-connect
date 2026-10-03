import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { json, readJson, route } from "@/lib/api";
import { HttpError, requireApiUser } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { listReviews } from "@/lib/queries";
import { ReviewInput } from "@/lib/validators";

export const GET = route(async (req) => {
  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const id = Number(url.searchParams.get("id"));
  if ((type !== "vet" && type !== "product") || !Number.isInteger(id)) throw new HttpError(400, "type and id are required");
  return json({ reviews: await listReviews(type, id) });
});

export const POST = route(async (req) => {
  const user = await requireApiUser();
  const input = ReviewInput.parse(await readJson(req));
  const db = await getDb();
  const table = input.targetType === "vet" ? schema.vets : schema.products;
  const [target] = await db.select({ id: table.id }).from(table).where(eq(table.id, input.targetId)).limit(1);
  if (!target) throw new HttpError(404, "Not found");

  const [existing] = await db
    .select({ id: schema.reviews.id })
    .from(schema.reviews)
    .where(
      and(
        eq(schema.reviews.targetType, input.targetType),
        eq(schema.reviews.targetId, input.targetId),
        eq(schema.reviews.userId, user.id),
      ),
    );
  if (existing) throw new HttpError(409, "You've already reviewed this.");

  const [review] = await db.insert(schema.reviews).values({ ...input, userId: user.id }).returning();
  if (input.targetType === "vet") {
    revalidatePath(`/vets/${input.targetId}`);
    revalidatePath("/vets");
  } else {
    revalidatePath("/resources");
  }
  return json({ review }, { status: 201 });
});
