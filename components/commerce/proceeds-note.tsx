import { HandHeart } from "lucide-react";
import { COUPONS, PROCEEDS_MESSAGE } from "@/lib/coupons";
import { cn } from "@/lib/utils";

export function ProceedsNote({ className }: { className?: string }) {
  const codes = Object.values(COUPONS);
  return (
    <div
      className={cn(
        "rounded-xl bg-primary-50 px-3 py-3 text-sm text-primary-900 dark:bg-primary-950 dark:text-primary-100",
        className,
      )}
    >
      <p className="flex items-start gap-2 font-medium">
        <HandHeart className="mt-0.5 size-4 shrink-0" aria-hidden />
        {PROCEEDS_MESSAGE}
      </p>
      <p className="mt-2 pl-6 text-primary-800 dark:text-primary-200">
        Sale prices are marked on products. At checkout use{" "}
        {codes.map((c, i) => (
          <span key={c.code}>
            {i > 0 ? ", " : ""}
            <span className="font-semibold">{c.code}</span> ({c.label})
          </span>
        ))}
        .
      </p>
    </div>
  );
}
