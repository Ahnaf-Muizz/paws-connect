import Link from "next/link";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 py-6 sm:py-10 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-3xl">
        {eyebrow && (
          <p className="mb-2 text-sm font-semibold tracking-wide text-primary-600 uppercase dark:text-primary-400">{eyebrow}</p>
        )}
        <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {description && <div className="mt-3 text-base text-slate-600 sm:text-lg dark:text-slate-400">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

type BadgeTone = "neutral" | "primary" | "accent" | "success" | "warning" | "danger";
const TONES: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  primary: "bg-primary-50 text-primary-800 dark:bg-primary-950 dark:text-primary-200",
  accent: "bg-accent-50 text-accent-700 dark:bg-accent-700/20 dark:text-accent-300",
  success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  warning: "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  danger: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
};

export function Badge({ tone = "neutral", className, children }: { tone?: BadgeTone; className?: string; children: React.ReactNode }) {
  return <span className={cn("chip", TONES[tone], className)}>{children}</span>;
}

export function Stars({ rating, count, className }: { rating: number; count?: number; className?: string }) {
  if (!count) return <span className={cn("text-xs text-slate-500 dark:text-slate-400", className)}>No reviews yet</span>;
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm", className)} aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
      <span className="font-semibold text-slate-900 dark:text-white">{rating.toFixed(1)}</span>
      <span className="text-slate-500 dark:text-slate-400">({count})</span>
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      {icon && <div className="mb-3 text-primary-500">{icon}</div>}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-slate-600 dark:text-slate-400">{description}</p>}
      {action && (
        <Link href={action.href} className="btn btn-primary mt-5">
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function SampleTag({ isReal }: { isReal: boolean }) {
  return isReal ? (
    <Badge tone="success">Real local organization</Badge>
  ) : (
    <Badge tone="neutral" className="italic">
      Sample listing
    </Badge>
  );
}
