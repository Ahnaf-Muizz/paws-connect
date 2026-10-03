import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)} aria-label="PAWS Connect home">
      <Image src="/logo-mark.png" alt="" width={40} height={40} className="size-9 rounded-full bg-white sm:size-10" loading="eager" />
      {!compact && (
        <span className="font-display text-lg leading-none font-bold tracking-tight sm:text-xl">
          <span className="text-primary-600 dark:text-primary-400">PAWS</span>{" "}
          <span className="text-accent-600 dark:text-accent-400">Connect</span>
        </span>
      )}
    </Link>
  );
}
