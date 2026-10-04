"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CardForm, type CardValues } from "@/components/commerce/card-form";
import { ProceedsNote } from "@/components/commerce/proceeds-note";
import { useCart, type CartLine } from "@/components/providers/cart-provider";
import { COUPONS, TAX_RATE, orderTotals } from "@/lib/coupons";
import { money } from "@/lib/utils";

export function CheckoutForm({ items, name }: { items: CartLine[]; name: string }) {
  const router = useRouter();
  const { reload } = useCart();
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const totals = useMemo(() => orderTotals(
    items.reduce((n, i) => n + i.priceCents * i.quantity, 0),
    TAX_RATE,
    applied,
  ), [items, applied]);

  function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    const next = orderTotals(items.reduce((n, i) => n + i.priceCents * i.quantity, 0), TAX_RATE, code);
    if (code.trim() && !next.coupon) {
      setCouponError("Try PAWS10, SHELTER15, or WELCOME5.");
      setApplied("");
      return;
    }
    setCouponError(null);
    setApplied(next.coupon?.code ?? "");
  }

  async function pay(card: CardValues) {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ card, coupon: applied || undefined }),
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
        <CardForm payLabel={`Pay ${money(totals.totalCents)}`} onPay={pay} defaultName={name} />
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
                  {i.salePct ? ` · ${i.salePct}% off` : ""}
                </span>
              </span>
              <span className="shrink-0 font-medium">{money(i.priceCents * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <form onSubmit={applyCoupon} className="mt-4 flex gap-2">
          <label className="sr-only" htmlFor="coupon">
            Coupon code
          </label>
          <input
            id="coupon"
            className="input flex-1"
            placeholder="Coupon code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoComplete="off"
          />
          <button type="submit" className="btn btn-outline shrink-0">
            Apply
          </button>
        </form>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Demo codes: {Object.keys(COUPONS).join(", ")}
        </p>
        {couponError && (
          <p role="alert" className="mt-1 text-sm text-rose-600 dark:text-rose-400">
            {couponError}
          </p>
        )}
        <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{money(totals.subtotalCents)}</dd>
          </div>
          {totals.discountCents > 0 && (
            <div className="flex justify-between text-emerald-700 dark:text-emerald-300">
              <dt>Coupon {totals.coupon?.code}</dt>
              <dd>−{money(totals.discountCents)}</dd>
            </div>
          )}
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <dt>Tax (8.25%)</dt>
            <dd>{money(totals.taxCents)}</dd>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <dt>Total</dt>
            <dd>{money(totals.totalCents)}</dd>
          </div>
        </dl>
        <ProceedsNote className="mt-4" />
      </aside>
    </div>
  );
}
