import { eq } from "drizzle-orm";
import { z } from "zod";
import { json, readJson, route } from "@/lib/api";
import { HttpError, requireApiUser } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { chargeCard, confirmationCode } from "@/lib/payments";

const DonateInput = z.object({
  shelterId: z.number().int().positive().nullable(),
  amountCents: z.number().int().min(100, "Minimum donation is $1").max(1_000_000, "For gifts over $10,000 please contact the shelter directly"),
  card: z.unknown(),
});

export const POST = route(async (req) => {
  const user = await requireApiUser();
  const input = DonateInput.parse(await readJson(req));
  const db = await getDb();
  if (input.shelterId) {
    const [shelter] = await db.select({ id: schema.shelters.id }).from(schema.shelters).where(eq(schema.shelters.id, input.shelterId)).limit(1);
    if (!shelter) throw new HttpError(404, "Shelter not found.");
  }
  const payment = await chargeCard(input.card);
  const [order] = await db
    .insert(schema.orders)
    .values({
      userId: user.id,
      kind: "donation",
      shelterId: input.shelterId,
      subtotalCents: input.amountCents,
      taxCents: 0,
      totalCents: input.amountCents,
      cardBrand: payment.brand,
      cardLast4: payment.last4,
      billingName: payment.name,
      billingZip: payment.zip,
      confirmation: confirmationCode(),
    })
    .returning();
  return json({ order }, { status: 201 });
});
