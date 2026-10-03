"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart } from "lucide-react";
import { useFavorites } from "@/components/providers/favorites-provider";
import { useSession } from "@/components/providers/session-provider";
import { cn } from "@/lib/utils";

export function FavoriteButton({ petId, petName, className }: { petId: number; petName: string; className?: string }) {
  const { user } = useSession();
  const { ids, toggle } = useFavorites();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const on = ids.has(petId);

  async function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setBusy(true);
    await toggle(petId);
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-pressed={on}
      aria-label={on ? `Remove ${petName} from favorites` : `Save ${petName} to favorites`}
      className={cn(
        "flex size-11 items-center justify-center rounded-full bg-white/90 text-slate-700 backdrop-blur transition hover:scale-105 dark:bg-slate-900/90 dark:text-slate-200",
        className,
      )}
    >
      <Heart className={cn("size-5", on && "fill-rose-500 text-rose-500")} />
    </button>
  );
}
