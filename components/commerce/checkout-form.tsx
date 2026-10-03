"use client";

import { useRouter } from "next/navigation";
import { CardForm, type CardValues } from "@/components/commerce/card-form";
import { useCart, type CartLine } from "@/components/providers/cart-provider";
import { money } from "@/lib/utils";

export function CheckoutForm({ items, subtotal, tax, name }: { items: CartLine[]; subtotal: number; tax: number; name: string }) {
  const router = useRouter();
  const { reload } = useCart();
  const total = subtotal + tax;

  async function pay(card: CardValues) {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ card }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return data.error ?? "Payment failed. Please try again.";
    await reload();
    router.replace(`/orders/${data.order.id}?new=1`);
    return null;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
      <section className="card p-5 sm:p-6" aria-labelledby="pay">
        <h2 id="pay" className="mb-4 text-lg font-semibold">
          Payment details
        </h2>
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">Paying as {name}</p>
        <CardForm payLabel={`Pay ${money(total)}`} onPay={pay} defaultName={name} />
      </section>
      <aside className="card p-5 lg:sticky lg:top-24" aria-labelledby="summary">
        <h2 id="summary" className="text-lg font-semibold">
          Order summary
        </h2>
        <ul className="mt-4 space-y-3 text-sm">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-3">
              <span className="min-w-0">
                <span className="block truncate font-medium text-slate-900 dark:text-white">{i.name}</span>
                <span className="text-slate-500 dark:text-slate-400">
                  {i.quantity} &times; {money(i.priceCents)} / {i.unit}
                </span>
              </span>
              <span className="shrink-0 font-medium">{money(i.priceCents * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{money(subtotal)}</dd>
          </div>
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <dt>Tax (8.25%)</dt>
            <dd>{money(tax)}</dd>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <dt>Total</dt>
            <dd>{money(total)}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
