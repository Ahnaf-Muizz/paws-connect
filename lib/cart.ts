import { eq } from "drizzle-orm";
import { salePriceCents } from "./coupons";
import { schema, type DB } from "./db";

export async function loadCart(db: DB, userId: number) {
  const rows = await db
    .select({ item: schema.cartItems, product: schema.products })
    .from(schema.cartItems)
    .innerJoin(schema.products, eq(schema.cartItems.productId, schema.products.id))
    .where(eq(schema.cartItems.userId, userId))
    .orderBy(schema.products.name);
  return rows.map(({ item, product }) => ({
    productId: product.id,
    quantity: item.quantity,
    name: product.name,
    provider: product.provider,
    category: product.category,
    listPriceCents: product.priceCents,
    salePct: product.salePct,
    priceCents: salePriceCents(product.priceCents, product.salePct),
    unit: product.unit,
  }));
}

export { TAX_RATE } from "./coupons";
