import Link from "next/link";
import { Logo } from "@/components/logo";
import { MORE_NAV, PRIMARY_NAV } from "@/lib/nav";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 font-display text-sm font-semibold text-primary-700 dark:text-primary-300">
            Pets And Their Worlds Connected
          </p>
          <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
            Shelters are often full. PAWS Connect links pets who need a new home directly with safe, screened families, so they go
            from one home to the next without ever being left outside.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Explore</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {PRIMARY_NAV.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="text-slate-600 hover:text-primary-700 dark:text-slate-400 dark:hover:text-primary-300">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Community</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {MORE_NAV.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="text-slate-600 hover:text-primary-700 dark:text-slate-400 dark:hover:text-primary-300">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 dark:border-slate-800">
        <p className="container-page py-5 text-xs text-slate-500 dark:text-slate-400">
          Demo site. Payments are simulated and no card is ever charged. Listings marked &ldquo;Sample listing&rdquo; are fictional;
          real organizations are linked to their official websites. &copy; {new Date().getFullYear()} PAWS Connect.
        </p>
      </div>
    </footer>
  );
}
