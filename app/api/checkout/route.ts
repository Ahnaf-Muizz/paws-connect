import { eq } from "drizzle-orm";
import { json, readJson, route } from "@/lib/api";
import { HttpError, requireApiUser } from "@/lib/auth";
import { loadCart, TAX_RATE } from "@/lib/cart";
import { orderTotals } from "@/lib/coupons";
import { getDb, schema } from "@/lib/db";
import { chargeCard, confirmationCode } from "@/lib/payments";

export const POST = route(async (req) => {
  const user = await requireApiUser();
  const body = (await readJson(req)) as { card?: unknown; coupon?: string };
  const db = await getDb();
  const items = await loadCart(db, user.id);
  if (!items.length) throw new HttpError(400, "Your cart is empty.");

  const payment = await chargeCard(body.card);
  const subtotalCents = items.reduce((n, i) => n + i.priceCents * i.quantity, 0);
  const totals = orderTotals(subtotalCents, TAX_RATE, body.coupon);
  if (body.coupon && !totals.coupon) throw new HttpError(400, "That coupon code is not valid.");

  const [order] = await db
    .insert(schema.orders)
    .values({
      userId: user.id,
      kind: "purchase",
      subtotalCents,
      discountCents: totals.discountCents,
      couponCode: totals.coupon?.code ?? null,
      taxCents: totals.taxCents,
      totalCents: totals.totalCents,
      cardBrand: payment.brand,
      cardLast4: payment.last4,
      billingName: payment.name,
      billingZip: payment.zip,
      confirmation: confirmationCode(),
    })
    .returning();
  await db.insert(schema.orderItems).values(
    items.map((i) => ({ orderId: order.id, productId: i.productId, name: i.name, unit: i.unit, priceCents: i.priceCents, quantity: i.quantity })),
  );
  await db.delete(schema.cartItems).where(eq(schema.cartItems.userId, user.id));
  return json({ order }, { status: 201 });
});
