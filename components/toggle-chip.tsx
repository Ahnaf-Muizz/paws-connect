"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToggleChip({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium capitalize transition-colors",
        selected
          ? "border-primary-600 bg-primary-600 text-white dark:border-primary-500 dark:bg-primary-600"
          : "border-slate-300 bg-white text-slate-700 hover:border-primary-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
        className,
      )}
    >
      {selected && <Check className="size-3.5" aria-hidden />}
      {children}
    </button>
  );
}

export function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}
