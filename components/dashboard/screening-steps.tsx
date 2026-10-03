import { Check, Clock } from "lucide-react";
import type { ScreeningState } from "@/lib/screening";
import { cn } from "@/lib/utils";

export function ScreeningSteps({ state }: { state: ScreeningState }) {
  if (state.status === "declined" || state.status === "withdrawn") return null;
  return (
    <ol className="mt-3 grid gap-2 sm:grid-cols-3" aria-label="Screening progress">
      {state.steps.map((s) => (
        <li
          key={s.key}
          className={cn(
            "flex items-start gap-2 rounded-xl border p-2.5 text-xs",
            s.done
              ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-100"
              : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400",
          )}
        >
          <span
            className={cn(
              "flex size-5 shrink-0 items-center justify-center rounded-full",
              s.done ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500 dark:bg-slate-800",
            )}
          >
            {s.done ? <Check className="size-3" aria-hidden /> : <Clock className="size-3" aria-hidden />}
          </span>
          <span>
            <span className="block font-semibold">{s.label}</span>
            <span className="sr-only">{s.done ? "complete" : "in progress"}</span>
            {!s.done && <span className="block">In progress</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}
