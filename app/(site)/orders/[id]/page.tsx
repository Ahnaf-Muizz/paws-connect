import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, HandHeart } from "lucide-react";
import { PrintButton } from "@/components/commerce/print-button";
import { ProceedsNote } from "@/components/commerce/proceeds-note";
import { requireUser } from "@/lib/auth";
import { getOrder } from "@/lib/queries";
import { money } from "@/lib/utils";

export const metadata: Metadata = { title: "Receipt", robots: { index: false } };

export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ new?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const user = await requireUser(`/orders/${id}`);
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) notFound();
  const data = await getOrder(user.id, orderId);
  if (!data) notFound();
  const { order, items, shelter } = data;
  const donation = order.kind === "donation";
  const placed = new Date(order.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Chicago" });

  return (
    <div className="container-page max-w-2xl pb-10">
      <Link href="/orders" className="link mt-6 inline-flex items-center gap-1 text-sm print:hidden">
        <ArrowLeft className="size-4" aria-hidden /> All orders
      </Link>

      {sp.new && (
        <div role="status" className="mt-6 flex flex-col items-center rounded-3xl bg-emerald-50 px-6 py-8 text-center dark:bg-emerald-950">
          {donation ? (
            <HandHeart className="size-12 text-emerald-600 dark:text-emerald-400" aria-hidden />
          ) : (
            <CheckCircle2 className="size-12 text-emerald-600 dark:text-emerald-400" aria-hidden />
          )}
          <h1 className="mt-3 text-2xl font-bold">{donation ? "Thank you for your gift!" : "Payment successful"}</h1>
          <p className="mt-1 text-slate-700 dark:text-slate-300">
            {donation
              ? `Your donation helps ${shelter?.name ?? "local shelters"} care for animals in need.`
              : "Your providers have been notified. A receipt is below."}
          </p>
        </div>
      )}

      <article className="card mt-6 p-6 sm:p-8" aria-labelledby="receipt">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="receipt" className="text-xl font-semibold">
              {donation ? "Donation receipt" : "Receipt"}
            </h2>
            <p className="mt-1 font-mono text-sm text-slate-600 dark:text-slate-400">{order.confirmation}</p>
          </div>
          <PrintButton />
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Date</dt>
            <dd className="font-medium">{placed}</dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Paid with</dt>
            <dd className="font-medium">
              {order.cardBrand} ending {order.cardLast4}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Billing name</dt>
            <dd className="font-medium">{order.billingName}</dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">ZIP</dt>
            <dd className="font-medium">{order.billingZip}</dd>
          </div>
        </dl>

        {donation ? (
          <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-900">
            Donation to <strong>{shelter?.name ?? "PAWS Connect Shelter Fund"}</strong>
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-slate-100 border-y border-slate-100 text-sm dark:divide-slate-800 dark:border-slate-800">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between gap-3 py-3">
                <span>
                  <span className="block font-medium">{i.name}</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {i.quantity} &times; {money(i.priceCents)} / {i.unit}
                  </span>
                </span>
                <span className="font-medium">{money(i.priceCents * i.quantity)}</span>
              </li>
            ))}
          </ul>
        )}

        <dl className="mt-4 space-y-1.5 text-sm">
          {!donation && (
            <>
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>{money(order.subtotalCents)}</dd>
              </div>
              {order.discountCents > 0 && (
                <div className="flex justify-between text-emerald-700 dark:text-emerald-300">
                  <dt>Coupon {order.couponCode}</dt>
                  <dd>−{money(order.discountCents)}</dd>
                </div>
              )}
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <dt>Tax</dt>
                <dd>{money(order.taxCents)}</dd>
              </div>
            </>
          )}
          <div className="flex justify-between pt-1 text-base font-semibold">
            <dt>Total</dt>
            <dd>{money(order.totalCents)}</dd>
          </div>
        </dl>
        {!donation && <ProceedsNote className="mt-6" />}
        <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">
          Simulated transaction for demonstration. No card was charged{donation ? " and no tax receipt is issued" : ""}.
        </p>
      </article>

      <div className="mt-6 flex flex-wrap gap-2 print:hidden">
        <Link href="/dashboard" className="btn btn-primary">
          Go to dashboard
        </Link>
        <Link href={donation ? "/donate" : "/resources"} className="btn btn-outline">
          {donation ? "Give again" : "Keep shopping"}
        </Link>
      </div>
    </div>
  );
}
