import { cn } from "@/lib/utils";

export function CapacityMeter({ current, capacity, className }: { current: number; capacity: number; className?: string }) {
  const pct = Math.min(100, Math.round((current / capacity) * 100));
  const tone = pct >= 90 ? "bg-rose-500" : pct >= 75 ? "bg-accent-500" : "bg-primary-500";
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium text-slate-700 dark:text-slate-300">Capacity</span>
        <span className={cn("font-semibold", pct >= 90 ? "text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-300")}>
          {pct}% full
        </span>
      </div>
      <div
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={capacity}
        aria-valuenow={current}
        aria-label={`${current} of ${capacity} spaces filled`}
      >
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {current} of {capacity} spaces filled
      </p>
    </div>
  );
}
