"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function FormSection({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="card p-5 sm:p-6">
      <legend className="sr-only">{title}</legend>
      <h2 className="text-lg font-semibold" aria-hidden>
        {title}
      </h2>
      {hint && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{hint}</p>}
      <div className="mt-4 space-y-5">{children}</div>
    </fieldset>
  );
}

export function RadioCards<T extends string>({
  name,
  value,
  options,
  onChange,
  labels = {},
}: {
  name: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
  labels?: Partial<Record<string, string>>;
}) {
  return (
    <div role="radiogroup" aria-label={name} className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={value === o}
          onClick={() => onChange(o)}
          className={cn(
            "flex min-h-11 items-center justify-center gap-1.5 rounded-xl border px-4 text-sm font-medium transition",
            value === o
              ? "border-primary-600 bg-primary-600 text-white"
              : "border-slate-200 bg-white text-slate-700 hover:border-primary-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
          )}
        >
          {value === o && <Check className="size-4" aria-hidden />}
          {labels[o] ?? o}
        </button>
      ))}
    </div>
  );
}

export function Switch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4">
      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className="relative h-7 w-12 shrink-0 rounded-full bg-slate-300 transition peer-checked:bg-primary-600 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 peer-focus-visible:ring-offset-2 after:absolute after:top-1 after:left-1 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5 dark:bg-slate-700"
      />
    </label>
  );
}
