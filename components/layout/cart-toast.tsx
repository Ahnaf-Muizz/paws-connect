"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";

export function CartToast() {
  const { lastAdded } = useCart();
  const [shown, setShown] = useState<typeof lastAdded>(null);

  const [prev, setPrev] = useState(lastAdded);
  if (prev !== lastAdded) {
    setPrev(lastAdded);
    setShown(lastAdded);
  }

  useEffect(() => {
    if (!shown) return;
    const t = setTimeout(() => setShown(null), 3000);
    return () => clearTimeout(t);
  }, [shown]);

  if (!shown) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="card animate-fade-in fixed inset-x-3 top-20 z-50 mx-auto flex max-w-md items-center gap-3 px-4 py-3"
    >
      <CheckCircle2 className="size-5 shrink-0 text-emerald-500" aria-hidden />
      <p className="min-w-0 flex-1 truncate text-sm">
        <span className="font-semibold">Added:</span> {shown.name}
      </p>
      <Link href="/cart" className="link shrink-0 text-sm">
        View cart
      </Link>
    </div>
  );
}
