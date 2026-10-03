"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { BottomSheet } from "@/components/bottom-sheet";
import { ToggleChip, toggleValue } from "@/components/toggle-chip";
import { AGES, LEVELS, SIZES, SPECIES } from "@/lib/validators";
import { cn } from "@/lib/utils";

type State = {
  q: string;
  species: string[];
  size: string[];
  age: string[];
  energy: string[];
  kids: boolean;
  dogs: boolean;
  cats: boolean;
  source: string;
  sort: string;
};

function fromParams(p: URLSearchParams): State {
  const list = (k: string) => p.get(k)?.split(",").filter(Boolean) ?? [];
  return {
    q: p.get("q") ?? "",
    species: list("species"),
    size: list("size"),
    age: list("age"),
    energy: list("energy"),
    kids: p.get("kids") === "1",
    dogs: p.get("dogs") === "1",
    cats: p.get("cats") === "1",
    source: p.get("source") ?? "",
    sort: p.get("sort") ?? "newest",
  };
}

function toQuery(s: State) {
  const p = new URLSearchParams();
  if (s.q.trim()) p.set("q", s.q.trim());
  for (const k of ["species", "size", "age", "energy"] as const) if (s[k].length) p.set(k, s[k].join(","));
  for (const k of ["kids", "dogs", "cats"] as const) if (s[k]) p.set(k, "1");
  if (s.source) p.set("source", s.source);
  if (s.sort !== "newest") p.set("sort", s.sort);
  const q = p.toString();
  return q ? `?${q}` : "";
}

const activeCount = (s: State) =>
  s.species.length + s.size.length + s.age.length + s.energy.length + Number(s.kids) + Number(s.dogs) + Number(s.cats) + Number(!!s.source);

function FilterFields({ state, set }: { state: State; set: (s: State) => void }) {
  const group = (label: string, key: "species" | "size" | "age" | "energy", options: readonly string[]) => (
    <fieldset>
      <legend className="label">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <ToggleChip key={o} selected={state[key].includes(o)} onClick={() => set({ ...state, [key]: toggleValue(state[key], o) })}>
            {o === "rabbit" ? "rabbits" : o === "bird" ? "birds" : key === "species" ? `${o}s` : o}
          </ToggleChip>
        ))}
      </div>
    </fieldset>
  );
  return (
    <div className="space-y-6">
      {group("Type of pet", "species", SPECIES)}
      {group("Size", "size", SIZES)}
      {group("Age", "age", AGES)}
      {group("Energy level", "energy", LEVELS)}
      <fieldset>
        <legend className="label">Good with</legend>
        <div className="flex flex-wrap gap-2">
          <ToggleChip selected={state.kids} onClick={() => set({ ...state, kids: !state.kids })}>
            Kids
          </ToggleChip>
          <ToggleChip selected={state.dogs} onClick={() => set({ ...state, dogs: !state.dogs })}>
            Dogs
          </ToggleChip>
          <ToggleChip selected={state.cats} onClick={() => set({ ...state, cats: !state.cats })}>
            Cats
          </ToggleChip>
        </div>
      </fieldset>
      <fieldset>
        <legend className="label">Listed by</legend>
        <div className="flex flex-wrap gap-2">
          {[
            ["", "Anyone"],
            ["owner", "Owners"],
            ["shelter", "Shelters"],
          ].map(([v, l]) => (
            <ToggleChip key={v} selected={state.source === v} onClick={() => set({ ...state, source: v })}>
              {l}
            </ToggleChip>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

export function PetFilters({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const current = fromParams(new URLSearchParams(params.toString()));
  const [draft, setDraft] = useState<State>(current);
  const [sheet, setSheet] = useState(false);
  const [q, setQ] = useState(current.q);

  const apply = (s: State) => startTransition(() => router.replace(`${pathname}${toQuery(s)}`, { scroll: false }));
  const count = activeCount(current);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          role="search"
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            apply({ ...current, q });
          }}
        >
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or breed"
            className="input pl-9"
            aria-label="Search pets"
            enterKeyHint="search"
          />
        </form>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-outline flex-1 lg:hidden"
            onClick={() => {
              setDraft(current);
              setSheet(true);
            }}
          >
            <SlidersHorizontal className="size-4" aria-hidden /> Filters
            {count > 0 && <span className="rounded-full bg-primary-600 px-2 text-xs text-white">{count}</span>}
          </button>
          <label className="sr-only" htmlFor="sort">
            Sort by
          </label>
          <select
            id="sort"
            className="input flex-1 sm:w-44"
            value={current.sort}
            onChange={(e) => apply({ ...current, sort: e.target.value })}
          >
            <option value="newest">Newest first</option>
            <option value="name">Name A-Z</option>
            <option value="age">Youngest first</option>
          </select>
        </div>
      </div>

      <p className={cn("mt-4 text-sm text-slate-600 transition-opacity dark:text-slate-400", pending && "opacity-50")} aria-live="polite">
        {total} pet{total === 1 ? "" : "s"} found
        {count > 0 && (
          <>
            {" "}
            &middot;{" "}
            <button type="button" className="link" onClick={() => apply({ ...fromParams(new URLSearchParams()), q: current.q })}>
              Clear filters
            </button>
          </>
        )}
      </p>

      <BottomSheet
        open={sheet}
        onClose={() => setSheet(false)}
        title="Filter pets"
        footer={
          <div className="flex gap-2">
            <button type="button" className="btn btn-outline flex-1" onClick={() => setDraft({ ...fromParams(new URLSearchParams()), q: current.q, sort: current.sort })}>
              Reset
            </button>
            <button
              type="button"
              className="btn btn-primary flex-[2]"
              onClick={() => {
                apply(draft);
                setSheet(false);
              }}
            >
              Show results
            </button>
          </div>
        }
      >
        <FilterFields state={draft} set={setDraft} />
      </BottomSheet>
    </>
  );
}

export function PetFiltersSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const current = fromParams(new URLSearchParams(params.toString()));
  return (
    <FilterFields
      state={current}
      set={(s) => startTransition(() => router.replace(`${pathname}${toQuery(s)}`, { scroll: false }))}
    />
  );
}
