import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, HandHeart } from "lucide-react";
import { DonateForm } from "@/components/commerce/donate-form";
import { PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { listShelters } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Donate",
  description: "Support Lubbock-area shelters with a donation that goes toward food, vaccines, and spay/neuter surgeries.",
};

const IMPACT = [
  { amount: "$25", body: "Vaccinates one puppy or kitten" },
  { amount: "$50", body: "Feeds a shelter dog for a month" },
  { amount: "$100", body: "Covers a spay or neuter surgery" },
];

export default async function DonatePage({ searchParams }: { searchParams: Promise<{ shelter?: string }> }) {
  const sp = await searchParams;
  const [rows, user] = await Promise.all([listShelters(), getCurrentUser()]);
  const shelters = rows.map((r) => ({ id: r.shelter.id, name: r.shelter.name, isReal: r.shelter.isReal, website: r.shelter.website }));
  const preselect = shelters.find((s) => String(s.id) === sp.shelter)?.id ?? null;

  return (
    <div className="container-page max-w-5xl pb-10">
      <PageHeader eyebrow="Donate" title="Help a shelter make room" description="Lubbock-area shelters are running above capacity. Your gift keeps animals fed, vaccinated, and off the streets." />
      <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
        <section className="card p-5 sm:p-6" aria-labelledby="give">
          <h2 id="give" className="sr-only">
            Donation details
          </h2>
          {user ? (
            <DonateForm shelters={shelters} defaultShelterId={preselect} name={user.name} />
          ) : (
            <div className="py-6 text-center">
              <HandHeart className="mx-auto size-10 text-primary-500" aria-hidden />
              <p className="mt-3 text-slate-600 dark:text-slate-400">Log in so we can send your receipt to your PAWS Connect account.</p>
              <Link href={`/login?next=${encodeURIComponent(`/donate${sp.shelter ? `?shelter=${sp.shelter}` : ""}`)}`} className="btn btn-primary mt-5">
                Log in to donate
              </Link>
            </div>
          )}
        </section>
        <aside className="space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold">Your impact</h2>
            <ul className="mt-3 space-y-3">
              {IMPACT.map((i) => (
                <li key={i.amount} className="flex items-center gap-3 text-sm">
                  <span className="w-14 shrink-0 rounded-lg bg-accent-50 py-1 text-center font-bold text-accent-700 dark:bg-accent-700/20 dark:text-accent-300">{i.amount}</span>
                  {i.body}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-5 text-sm">
            <h2 className="font-semibold">Prefer to give directly?</h2>
            <p className="mt-1 text-slate-600 dark:text-slate-400">Donations here are simulated for this demo. To make a real gift, visit a shelter&apos;s own site:</p>
            <ul className="mt-3 space-y-1.5">
              {shelters
                .filter((s) => s.isReal && s.website)
                .map((s) => (
                  <li key={s.id}>
                    <a href={s.website!} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1">
                      {s.name} <ExternalLink className="size-3" aria-hidden />
                    </a>
                  </li>
                ))}
              <li>
                <Link href="/nonprofits" className="link">
                  More nonprofits
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
