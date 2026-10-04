import type { Metadata } from "next";
import { CartView } from "@/components/commerce/cart-view";
import { ProceedsNote } from "@/components/commerce/proceeds-note";

export const metadata: Metadata = { title: "Cart", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="container-page pb-10">
      <h1 className="py-6 text-2xl font-bold sm:py-10 sm:text-4xl">Your cart</h1>
      <ProceedsNote className="mb-6" />
      <CartView />
    </div>
  );
}
