"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "./session-provider";

export type CartLine = {
  productId: number;
  quantity: number;
  name: string;
  provider: string;
  category: string;
  priceCents: number;
  unit: string;
};

type CartContextValue = {
  items: CartLine[];
  count: number;
  subtotalCents: number;
  ready: boolean;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => Promise<void>;
  setQuantity: (productId: number, quantity: number) => Promise<void>;
  remove: (productId: number) => Promise<void>;
  reload: () => Promise<void>;
  clearLocal: () => void;
  lastAdded: { name: string; at: number } | null;
};

const STORAGE_KEY = "paws-guest-cart";
const CartContext = createContext<CartContextValue | null>(null);

function readLocal(): CartLine[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeLocal(items: CartLine[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

async function syncServer(body: { items: { productId: number; quantity: number }[]; mode: "add" | "set" }) {
  const res = await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json()).error ?? "Could not update cart");
  return (await res.json()).items as CartLine[];
}

/** Call right after login so server-rendered pages (like checkout) already see the guest's items. */
export async function mergeGuestCart() {
  const guest = readLocal();
  if (!guest.length) return;
  await syncServer({ items: guest.map(({ productId, quantity }) => ({ productId, quantity })), mode: "add" });
  writeLocal([]);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSession();
  const [items, setItems] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [lastAdded, setLastAdded] = useState<CartContextValue["lastAdded"]>(null);
  const userId = user?.id ?? null;
  const userRef = useRef(userId);
  useEffect(() => {
    userRef.current = userId;
  }, [userId]);

  const reload = useCallback(async () => {
    if (!userRef.current) {
      setItems(readLocal());
      return;
    }
    const res = await fetch("/api/cart", { cache: "no-store" });
    if (res.ok) setItems((await res.json()).items);
  }, []);

  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    (async () => {
      if (!userId) {
        setItems(readLocal());
      } else {
        const guest = readLocal();
        if (guest.length) {
          const merged = await syncServer({
            items: guest.map(({ productId, quantity }) => ({ productId, quantity })),
            mode: "add",
          }).catch(() => null);
          if (merged) writeLocal([]);
        }
        const res = await fetch("/api/cart", { cache: "no-store" });
        if (!cancelled && res.ok) setItems((await res.json()).items);
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, loading]);

  const applyLocal = useCallback((updater: (prev: CartLine[]) => CartLine[]) => {
    setItems((prev) => {
      const next = updater(prev).filter((l) => l.quantity > 0);
      if (!userRef.current) writeLocal(next);
      return next;
    });
  }, []);

  const add = useCallback<CartContextValue["add"]>(
    async (line, quantity = 1) => {
      applyLocal((prev) => {
        const existing = prev.find((l) => l.productId === line.productId);
        return existing
          ? prev.map((l) => (l.productId === line.productId ? { ...l, quantity: l.quantity + quantity } : l))
          : [...prev, { ...line, quantity }];
      });
      setLastAdded({ name: line.name, at: Date.now() });
      if (userRef.current) setItems(await syncServer({ items: [{ productId: line.productId, quantity }], mode: "add" }));
    },
    [applyLocal],
  );

  const setQuantity = useCallback<CartContextValue["setQuantity"]>(
    async (productId, quantity) => {
      applyLocal((prev) => prev.map((l) => (l.productId === productId ? { ...l, quantity } : l)));
      if (userRef.current) setItems(await syncServer({ items: [{ productId, quantity }], mode: "set" }));
    },
    [applyLocal],
  );

  const remove = useCallback((productId: number) => setQuantity(productId, 0), [setQuantity]);

  const clearLocal = useCallback(() => {
    writeLocal([]);
    setItems([]);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((n, l) => n + l.quantity, 0),
      subtotalCents: items.reduce((n, l) => n + l.quantity * l.priceCents, 0),
      ready,
      add,
      setQuantity,
      remove,
      reload,
      clearLocal,
      lastAdded,
    }),
    [items, ready, add, setQuantity, remove, reload, clearLocal, lastAdded],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
