import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, MapPin } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { listOwners } from "@/lib/queries";
import { initials } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Owners",
  description: "Pet owners in the Lubbock area rehoming their pets directly with screened families.",
};

export default async function OwnersPage() {
  const rows = await listOwners();
  return (
    <div className="container-page pb-10">
      <PageHeader
        eyebrow="Owners"
        title="Owners rehoming responsibly"
        description="Life changes. These owners chose to find their pets a safe, screened home directly instead of surrendering them to a full shelter."
        actions={
          <Link href="/rehome" className="btn btn-primary">
            Rehome your pet
          </Link>
        }
      />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rows.map(({ owner, pets }) => (
          <li key={owner.id} className="card relative p-5 transition hover:border-primary-300 dark:hover:border-primary-700">
            <div className="flex items-center gap-3">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-600 text-lg font-semibold text-white">
                {initials(owner.name)}
              </span>
              <div className="min-w-0">
                <h2 className="flex items-center gap-1 font-semibold">
                  <Link href={`/owners/${owner.id}`} className="truncate after:absolute after:inset-0">
                    {owner.name}
                  </Link>
                  {owner.verified && <BadgeCheck className="size-4 shrink-0 text-primary-600 dark:text-primary-400" aria-label="Verified owner" />}
                </h2>
                <p className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                  <MapPin className="size-3.5" aria-hidden /> {owner.city}
                </p>
              </div>
            </div>
            {owner.bio && <p className="mt-3 line-clamp-3 text-sm text-slate-600 dark:text-slate-400">{owner.bio}</p>}
            <p className="mt-4 text-sm font-medium text-primary-700 dark:text-primary-300">
              {pets} pet{pets === 1 ? "" : "s"} looking for a home
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
