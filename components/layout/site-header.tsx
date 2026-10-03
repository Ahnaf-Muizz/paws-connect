"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Menu, ShoppingCart, UserRound } from "lucide-react";
import { Logo } from "@/components/logo";
import { useCart } from "@/components/providers/cart-provider";
import { useSession } from "@/components/providers/session-provider";
import { ACCOUNT_NAV, MORE_NAV, PRIMARY_NAV } from "@/lib/nav";
import { cn, initials } from "@/lib/utils";
import { MobileDrawer } from "./mobile-drawer";
import { ThemeToggle } from "./theme-toggle";

function useClickOutside(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useSession();
  const { count } = useCart();
  const [drawer, setDrawer] = useState(false);
  const [more, setMore] = useState(false);
  const [account, setAccount] = useState(false);
  const moreRef = useClickOutside(more, () => setMore(false));
  const accountRef = useClickOutside(account, () => setAccount(false));

  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setDrawer(false);
    setMore(false);
    setAccount(false);
  }

  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  async function onLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/85">
      <div className="container-page flex h-16 items-center gap-3">
        <button
          type="button"
          className="btn btn-ghost -ml-2 size-11 p-0 lg:hidden"
          onClick={() => setDrawer(true)}
          aria-label="Open menu"
          aria-expanded={drawer}
        >
          <Menu className="size-6" />
        </button>
        <Logo />

        <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Main">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active(item.href)
                  ? "bg-primary-50 text-primary-800 dark:bg-primary-950 dark:text-primary-200"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="relative" ref={moreRef}>
            <button
              type="button"
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-expanded={more}
              aria-haspopup="menu"
              onClick={() => setMore((v) => !v)}
            >
              More <ChevronDown className={cn("size-4 transition-transform", more && "rotate-180")} />
            </button>
            {more && (
              <div role="menu" className="card animate-fade-in absolute top-full left-0 mt-2 w-72 p-2">
                {MORE_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    className="block rounded-xl px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <span className="block text-sm font-semibold text-slate-900 dark:text-white">{item.label}</span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">{item.description}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <Link
            href="/cart"
            className="btn btn-ghost relative hidden size-11 rounded-full p-0 sm:inline-flex"
            aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
          >
            <ShoppingCart className="size-5" />
            {count > 0 && (
              <span className="absolute top-1 right-0.5 flex min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[11px] font-bold text-slate-950">
                {count}
              </span>
            )}
          </Link>

          {loading ? (
            <span className="ml-1 hidden h-11 w-24 animate-pulse rounded-xl bg-slate-100 sm:block dark:bg-slate-800" />
          ) : user ? (
            <div className="relative hidden sm:block" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccount((v) => !v)}
                className="btn btn-ghost gap-2 rounded-full pr-3 pl-1.5"
                aria-expanded={account}
                aria-haspopup="menu"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                  {initials(user.name)}
                </span>
                <span className="hidden max-w-28 truncate md:inline">{user.name.split(" ")[0]}</span>
                <ChevronDown className="size-4" />
              </button>
              {account && (
                <div role="menu" className="card animate-fade-in absolute top-full right-0 mt-2 w-56 p-2">
                  <p className="truncate px-3 pt-1 pb-2 text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                  {ACCOUNT_NAV.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={onLogout}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg border-t border-slate-100 px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:border-slate-800 dark:text-rose-400 dark:hover:bg-rose-950"
                  >
                    <LogOut className="size-4" /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/login" className="btn btn-ghost">
                Log in
              </Link>
              <Link href="/register" className="btn btn-primary">
                Get started
              </Link>
            </div>
          )}
          {!loading && !user && (
            <Link href="/login" className="btn btn-ghost size-11 rounded-full p-0 sm:hidden" aria-label="Log in">
              <UserRound className="size-5" />
            </Link>
          )}
        </div>
      </div>
      <MobileDrawer open={drawer} onClose={() => setDrawer(false)} onLogout={onLogout} />
    </header>
  );
}
