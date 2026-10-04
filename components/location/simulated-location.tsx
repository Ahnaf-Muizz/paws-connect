"use client";

import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { LOCATION_COOKIE, SIMULATED_LOCATIONS, type SimulatedLocation } from "@/lib/location";

export function SimulatedLocationSelect({
  current,
  className,
}: {
  current: SimulatedLocation;
  className?: string;
}) {
  const router = useRouter();

  function onChange(id: string) {
    document.cookie = `${LOCATION_COOKIE}=${id}; Path=/; Max-Age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <label className={className}>
      <span className="mb-1 block text-sm font-medium text-slate-800 dark:text-slate-100">
        Distances from your simulated location
      </span>
      <span className="flex min-h-11 items-center gap-2">
        <MapPin className="size-4 shrink-0 text-primary-600 dark:text-primary-400" aria-hidden />
        <select
          className="input min-w-0 flex-1"
          value={current.id}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Simulated location for distances"
        >
          {SIMULATED_LOCATIONS.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
      </span>
      <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
        No GPS is used. Pick a starting point to see how many miles each pet is from you.
      </span>
    </label>
  );
}
