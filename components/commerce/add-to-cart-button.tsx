"use client";

import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { useCart, type CartLine } from "@/components/providers/cart-provider";

export function AddToCartButton({ line, label = "Add" }: { line: Omit<CartLine, "quantity">; label?: string }) {
  const { add, items } = useCart();
  const [state, setState] = useState<"idle" | "busy" | "added" | "error">("idle");
  const inCart = items.find((i) => i.productId === line.productId)?.quantity ?? 0;

  async function onClick() {
    setState("busy");
    try {
      await add(line);
      setState("added");
      setTimeout(() => setState("idle"), 1500);
    } catch {
      setState("error");
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === "busy"}
      className="btn btn-primary shrink-0"
      aria-label={`${label} ${line.name} to cart${inCart ? ` (${inCart} in cart)` : ""}`}
    >
      {state === "added" ? <Check className="size-4" aria-hidden /> : <ShoppingCart className="size-4" aria-hidden />}
      {state === "added" ? "Added" : state === "error" ? "Retry" : label}
      {inCart > 0 && state !== "added" && <span className="rounded-full bg-white/25 px-1.5 text-xs">{inCart}</span>}
    </button>
  );
}
