import type { Metadata } from "next";
import Link from "next/link";
import { HandHeart, Receipt } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { listOrders } from "@/lib/queries";
import { money, shortDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Orders", robots: { index: false } };

export default async function OrdersPage() {
  const user = await requireUser("/orders");
  const orders = await listOrders(user.id);
  return (
    <div className="container-page max-w-3xl pb-10">
      <PageHeader title="Orders & donations" />
      {orders.length === 0 ? (
        <EmptyState icon={<Receipt className="size-10" />} title="No orders yet" action={{ href: "/resources", label: "Shop resources" }} />
      ) : (
        <ul className="card divide-y divide-slate-100 dark:divide-slate-800">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/orders/${o.id}`} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-900">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                  {o.kind === "donation" ? <HandHeart className="size-5" aria-hidden /> : <Receipt className="size-5" aria-hidden />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">
                    {o.kind === "donation" ? "Donation" : "Order"} {o.confirmation}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {shortDate(o.createdAt)} &middot; {o.cardBrand} &bull;&bull;&bull;&bull; {o.cardLast4}
                  </span>
                </span>
                <span className="font-semibold">{money(o.totalCents)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
