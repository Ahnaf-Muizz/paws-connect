"use client";

import Link from "next/link";
import { useEffect } from "react";
import { LogOut, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { useSession } from "@/components/providers/session-provider";
import { ACCOUNT_NAV, MORE_NAV, PRIMARY_NAV } from "@/lib/nav";

export function MobileDrawer({ open, onClose, onLogout }: { open: boolean; onClose: () => void; onLogout: () => void }) {
  const { user } = useSession();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const section = (title: string, items: { href: string; label: string }[]) => (
    <div className="py-3">
      <p className="px-3 pb-1 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">{title}</p>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClose}
          className="flex min-h-12 items-center rounded-xl px-3 text-base font-medium text-slate-800 active:bg-slate-100 dark:text-slate-100 dark:active:bg-slate-800"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <button type="button" aria-label="Close menu" className="animate-fade-in absolute inset-0 bg-slate-950/50" onClick={onClose} />
      <div className="animate-fade-in pt-safe pb-safe absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-white dark:bg-slate-950">
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
          <Logo />
          <button type="button" onClick={onClose} className="btn btn-ghost size-11 p-0" aria-label="Close menu">
            <X className="size-6" />
          </button>
        </div>
        <nav className="flex-1 divide-y divide-slate-100 overflow-y-auto px-2 dark:divide-slate-800">
          {section("Explore", PRIMARY_NAV)}
          {section("Community", MORE_NAV)}
          {user ? section("Your account", ACCOUNT_NAV) : null}
        </nav>
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          {user ? (
            <button type="button" onClick={onLogout} className="btn btn-outline w-full text-rose-600 dark:text-rose-400">
              <LogOut className="size-4" /> Log out
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link href="/login" onClick={onClose} className="btn btn-outline">
                Log in
              </Link>
              <Link href="/register" onClick={onClose} className="btn btn-primary">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
