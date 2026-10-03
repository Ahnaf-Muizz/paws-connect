import { and, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { json, readJson, route } from "@/lib/api";
import { requireApiUser } from "@/lib/auth";
import { loadCart } from "@/lib/cart";
import { getDb, schema } from "@/lib/db";

const Body = z.object({
  mode: z.enum(["add", "set"]),
  items: z
    .array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(0).max(99) }))
    .max(100),
});

export const GET = route(async () => {
  const user = await requireApiUser();
  return json({ items: await loadCart(await getDb(), user.id) });
});

export const POST = route(async (req) => {
  const user = await requireApiUser();
  const { mode, items } = Body.parse(await readJson(req));
  const db = await getDb();

  const ids = items.map((i) => i.productId);
  const valid = ids.length
    ? new Set((await db.select({ id: schema.products.id }).from(schema.products).where(inArray(schema.products.id, ids))).map((p) => p.id))
    : new Set<number>();

  for (const { productId, quantity } of items) {
    if (!valid.has(productId)) continue;
    const key = and(eq(schema.cartItems.userId, user.id), eq(schema.cartItems.productId, productId));
    if (mode === "set" && quantity === 0) {
      await db.delete(schema.cartItems).where(key);
    } else if (mode === "set") {
      await db
        .insert(schema.cartItems)
        .values({ userId: user.id, productId, quantity })
        .onConflictDoUpdate({ target: [schema.cartItems.userId, schema.cartItems.productId], set: { quantity } });
    } else if (quantity > 0) {
      await db
        .insert(schema.cartItems)
        .values({ userId: user.id, productId, quantity })
        .onConflictDoUpdate({
          target: [schema.cartItems.userId, schema.cartItems.productId],
          set: { quantity: sql`least(${schema.cartItems.quantity} + ${quantity}, 99)` },
        });
    }
  }
  return json({ items: await loadCart(db, user.id) });
});
