import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/commerce/checkout-form";
import { requireUser } from "@/lib/auth";
import { loadCart } from "@/lib/cart";
import { getDb } from "@/lib/db";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  const items = await loadCart(await getDb(), user.id);
  if (!items.length) redirect("/cart");
  return (
    <div className="container-page max-w-5xl pb-10">
      <h1 className="py-6 text-2xl font-bold sm:py-10 sm:text-4xl">Checkout</h1>
      <CheckoutForm items={items} name={user.name} />
    </div>
  );
}
