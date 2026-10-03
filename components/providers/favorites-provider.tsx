"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "./session-provider";

type FavoritesValue = {
  ids: Set<number>;
  toggle: (petId: number) => Promise<boolean>;
  markLocal: (petId: number) => void;
};

const FavoritesContext = createContext<FavoritesValue | null>(null);
const EMPTY: Set<number> = new Set();

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const userId = user?.id ?? null;
  // Tagged with the owner so a logout or account switch never shows the previous user's hearts.
  const [store, setStore] = useState<{ owner: number | null; ids: Set<number> }>({ owner: null, ids: EMPTY });
  const ids = userId && store.owner === userId ? store.ids : EMPTY;
  const setIds = useCallback(
    (update: (prev: Set<number>) => Set<number>) => setStore((s) => ({ owner: userId, ids: update(s.owner === userId ? s.ids : EMPTY) })),
    [userId],
  );

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    fetch("/api/favorites?ids=1", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { ids: [] }))
      .then((d: { ids: number[] }) => {
        if (!cancelled) setStore({ owner: userId, ids: new Set(d.ids) });
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const toggle = useCallback(
    async (petId: number) => {
      const next = !ids.has(petId);
      const update = (add: boolean) =>
        setIds((prev) => {
          const s = new Set(prev);
          if (add) s.add(petId);
          else s.delete(petId);
          return s;
        });
      update(next);
      const res = await fetch(`/api/favorites/${petId}`, { method: next ? "POST" : "DELETE" });
      if (!res.ok) {
        update(!next);
        return !next;
      }
      return next;
    },
    [ids, setIds],
  );

  const markLocal = useCallback((petId: number) => setIds((prev) => new Set(prev).add(petId)), [setIds]);

  const value = useMemo(() => ({ ids, toggle, markLocal }), [ids, toggle, markLocal]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used inside FavoritesProvider");
  return ctx;
}
