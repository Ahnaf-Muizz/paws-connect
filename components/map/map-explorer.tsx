"use client";

import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Building2, Phone, Siren, Stethoscope } from "lucide-react";
import { SimulatedLocationSelect } from "@/components/location/simulated-location";
import { ToggleChip } from "@/components/toggle-chip";
import { formatMiles, haversineMiles, type SimulatedLocation } from "@/lib/location";
import { cn, telHref } from "@/lib/utils";

export type PlaceKind = "shelter" | "vet" | "emergency";
export type Place = { key: string; kind: PlaceKind; name: string; address: string; phone: string | null; lat: number; lng: number; href: string; isReal: boolean };

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">Loading map...</div>,
});

export const KIND_META: Record<PlaceKind, { label: string; icon: typeof Building2; dot: string }> = {
  shelter: { label: "Shelters", icon: Building2, dot: "bg-primary-600" },
  vet: { label: "Vets", icon: Stethoscope, dot: "bg-accent-500" },
  emergency: { label: "24/7 emergency", icon: Siren, dot: "bg-rose-600" },
};

export function MapExplorer({ places, origin }: { places: Place[]; origin: SimulatedLocation }) {
  const [kinds, setKinds] = useState<PlaceKind[]>(["shelter", "vet", "emergency"]);
  const [selected, setSelected] = useState<string | null>(null);
  const me = useMemo(() => ({ lat: origin.lat, lng: origin.lng }), [origin.lat, origin.lng]);
  const mapBox = useRef<HTMLDivElement>(null);

  const visible = useMemo(() => places.filter((p) => kinds.includes(p.kind)), [places, kinds]);
  const sorted = useMemo(() => {
    return [...visible].sort((a, b) => haversineMiles(me, a) - haversineMiles(me, b));
  }, [visible, me]);

  function show(key: string) {
    setSelected(key);
    if (!window.matchMedia("(min-width: 1024px)").matches) mapBox.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[340px_1fr] lg:gap-6">
      <div className="order-first flex flex-wrap items-center gap-2 lg:col-span-2">
        {(Object.keys(KIND_META) as PlaceKind[]).map((k) => (
          <ToggleChip key={k} selected={kinds.includes(k)} onClick={() => setKinds((v) => (v.includes(k) ? v.filter((x) => x !== k) : [...v, k]))}>
            <span className={cn("size-2.5 rounded-full ring-2 ring-white dark:ring-slate-900", KIND_META[k].dot)} aria-hidden />
            {KIND_META[k].label}
          </ToggleChip>
        ))}
        <div className="w-full sm:ml-auto sm:w-72">
          <SimulatedLocationSelect current={origin} />
        </div>
      </div>

      <div ref={mapBox} className="order-first h-[55dvh] scroll-mt-20 min-h-80 lg:order-last lg:h-[calc(100dvh-14rem)]">
        <LeafletMap places={visible} selected={selected} onSelect={setSelected} me={me} />
      </div>

      <ul className="card divide-y divide-slate-100 overflow-y-auto lg:h-[calc(100dvh-14rem)] dark:divide-slate-800" aria-label={`${sorted.length} places`}>
        {sorted.map((p) => {
          const Icon = KIND_META[p.kind].icon;
          return (
            <li key={p.key} className={cn("p-4", selected === p.key && "bg-primary-50 dark:bg-primary-950/50")}>
              <button type="button" onClick={() => show(p.key)} className="flex w-full items-start gap-3 text-left">
                <span className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-white", KIND_META[p.kind].dot)}>
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block font-medium text-slate-900 dark:text-white">{p.name}</span>
                  <span className="block text-sm text-slate-500 dark:text-slate-400">
                    {p.address} · {formatMiles(haversineMiles(me, p))}
                  </span>
                </span>
              </button>
              <div className="mt-2 flex gap-4 pl-11 text-sm">
                <Link href={p.href} className="link">
                  Details
                </Link>
                {p.phone && (
                  <a href={telHref(p.phone)} className="link inline-flex items-center gap-1">
                    <Phone className="size-3.5" aria-hidden /> Call
                  </a>
                )}
              </div>
            </li>
          );
        })}
        {sorted.length === 0 && <li className="p-6 text-center text-sm text-slate-500">Turn on a category to see places.</li>}
      </ul>
    </div>
  );
}
