"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ShareButton({ title, label, className }: { title: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        return;
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const icon = copied ? <Check className="size-5 text-emerald-500" aria-hidden /> : <Share2 className="size-5" aria-hidden />;

  if (label) {
    return (
      <button type="button" onClick={share} className={cn("btn btn-outline min-h-10 text-sm", className)}>
        {icon}
        <span aria-live="polite">{copied ? "Link copied" : label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={share}
      aria-label={copied ? "Link copied" : "Share"}
      className={cn(
        "flex size-11 items-center justify-center rounded-full bg-white/90 text-slate-700 backdrop-blur transition hover:scale-105 dark:bg-slate-900/90 dark:text-slate-200",
        className,
      )}
    >
      {icon}
    </button>
  );
}
