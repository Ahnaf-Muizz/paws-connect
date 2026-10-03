import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import type { ConversationSummary } from "@/lib/messages";
import { cn, initials, timeAgo } from "@/lib/utils";

export function ConversationList({ items, activeId, userId }: { items: ConversationSummary[]; activeId?: number; userId: number }) {
  return (
    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
      {items.map((c) => {
        const active = c.id === activeId;
        return (
          <li key={c.id}>
            <Link
              href={`/messages/${c.id}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex gap-3 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60",
                active && "bg-primary-50 hover:bg-primary-50 dark:bg-primary-950/60 dark:hover:bg-primary-950/60",
              )}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-800 dark:bg-primary-900 dark:text-primary-100">
                {initials(c.other.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className={cn("flex min-w-0 items-center gap-1 truncate", c.unread ? "font-semibold text-slate-900 dark:text-white" : "font-medium")}>
                    <span className="truncate">{c.other.name}</span>
                    {c.other.verified && <BadgeCheck className="size-4 shrink-0 text-primary-600" aria-label="Verified" />}
                  </span>
                  <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">{timeAgo(c.last?.createdAt ?? c.lastMessageAt)}</span>
                </span>
                {c.pet && <span className="block truncate text-xs text-primary-700 dark:text-primary-300">About {c.pet.name}</span>}
                <span className="mt-0.5 flex items-center justify-between gap-2">
                  <span className={cn("truncate text-sm", c.unread ? "text-slate-800 dark:text-slate-200" : "text-slate-500 dark:text-slate-400")}>
                    {c.last ? `${c.last.senderId === userId ? "You: " : ""}${c.last.body}` : "No messages yet"}
                  </span>
                  {c.unread > 0 && (
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent-500 px-1.5 text-xs font-bold text-slate-950">
                      {c.unread}
                      <span className="sr-only"> unread</span>
                    </span>
                  )}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
