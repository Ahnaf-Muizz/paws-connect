"use client";

import Link from "next/link";
import { Bone, Minus, Pill, Plus, Scissors, ShieldCheck, ShoppingCart, Stethoscope, Trash2 } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { useSession } from "@/components/providers/session-provider";
import { money } from "@/lib/utils";

const TAX_RATE = 0.0825;
const ICONS: Record<string, typeof Bone> = { insurance: ShieldCheck, food: Bone, clinic: Stethoscope, groomer: Scissors, medicine: Pill };

export function CartView() {
  const { items, ready, subtotalCents, setQuantity, remove } = useCart();
  const { user } = useSession();
  const tax = Math.round(subtotalCents * TAX_RATE);

  if (!ready) return <div className="h-48 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />;
  if (!items.length) {
    return (
      <div className="card flex flex-col items-center px-6 py-14 text-center">
        <ShoppingCart className="size-10 text-primary-500" aria-hidden />
        <h2 className="mt-3 text-lg font-semibold">Your cart is empty</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Browse insurance, food, clinic visits, grooming, and medicine.</p>
        <Link href="/resources" className="btn btn-primary mt-5">
          Shop resources
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
      <ul className="card divide-y divide-slate-100 dark:divide-slate-800">
        {items.map((item) => {
          const Icon = ICONS[item.category] ?? ShoppingCart;
          return (
            <li key={item.productId} className="flex gap-4 p-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                <Icon className="size-6" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {item.provider} &middot; {money(item.priceCents)} / {item.unit}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => (item.quantity > 1 ? setQuantity(item.productId, item.quantity - 1) : remove(item.productId))}
                      className="flex size-10 items-center justify-center"
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold" aria-live="polite">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(item.productId, Math.min(20, item.quantity + 1))}
                      className="flex size-10 items-center justify-center"
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <span className="font-semibold">{money(item.priceCents * item.quantity)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => remove(item.productId)}
                className="flex size-10 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
                aria-label={`Remove ${item.name}`}
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          );
        })}
      </ul>

      <aside className="card p-5 lg:sticky lg:top-24">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{money(subtotalCents)}</dd>
          </div>
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <dt>Estimated tax (8.25%)</dt>
            <dd>{money(tax)}</dd>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-semibold dark:border-slate-800">
            <dt>Total</dt>
            <dd>{money(subtotalCents + tax)}</dd>
          </div>
        </dl>
        <Link href="/checkout" className="btn btn-primary mt-5 min-h-12 w-full text-base">
          {user ? "Checkout" : "Log in to checkout"}
        </Link>
        <Link href="/resources" className="btn btn-ghost mt-2 w-full">
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
