import { HandHeart } from "lucide-react";
import { PROCEEDS_MESSAGE } from "@/lib/coupons";
import { cn } from "@/lib/utils";

export function ProceedsNote({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-xl bg-primary-50 px-3 py-2 text-sm text-primary-900 dark:bg-primary-950 dark:text-primary-100",
        className,
      )}
    >
      <HandHeart className="mt-0.5 size-4 shrink-0" aria-hidden />
      {PROCEEDS_MESSAGE}
    </p>
  );
}
