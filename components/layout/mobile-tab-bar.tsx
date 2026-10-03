"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, House, PawPrint, ShoppingCart, UserRound } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { useSession } from "@/components/providers/session-provider";
import { cn } from "@/lib/utils";

export function MobileTabBar() {
  const pathname = usePathname();
  const { count } = useCart();
  const { user } = useSession();

  const tabs = [
    { href: "/", label: "Home", icon: House, match: (p: string) => p === "/" },
    { href: "/pets", label: "Pets", icon: PawPrint, match: (p: string) => p.startsWith("/pets") },
    { href: "/matches", label: "Matches", icon: Heart, match: (p: string) => p.startsWith("/matches") },
    { href: "/cart", label: "Cart", icon: ShoppingCart, match: (p: string) => p.startsWith("/cart") || p.startsWith("/checkout") },
    {
      href: user ? "/dashboard" : "/login",
      label: user ? "Account" : "Log in",
      icon: UserRound,
      match: (p: string) => ["/dashboard", "/profile", "/login", "/register", "/messages", "/favorites"].some((x) => p.startsWith(x)),
    },
  ];

  return (
    <nav
      aria-label="Primary"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md lg:hidden dark:border-slate-800 dark:bg-slate-950/95"
    >
      <ul className="grid h-(--tabbar-height) grid-cols-5">
        {tabs.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={label}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium",
                  active ? "text-primary-700 dark:text-primary-300" : "text-slate-500 dark:text-slate-400",
                )}
              >
                <span className="relative">
                  <Icon className={cn("size-6", active && "fill-primary-100 dark:fill-primary-900")} strokeWidth={active ? 2.25 : 1.75} />
                  {label === "Cart" && count > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 flex min-w-4.5 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-slate-950">
                      {count}
                    </span>
                  )}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
