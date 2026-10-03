import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, CalendarDays, MapPin } from "lucide-react";
import { PetCard } from "@/components/pets/pet-card";
import { EmptyState } from "@/components/ui";
import { getOwner } from "@/lib/queries";
import { initials, shortDate } from "@/lib/utils";

export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

type Params = Promise<{ id: string }>;

async function load(params: Params) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const data = await getOwner(id);
  if (!data) notFound();
  return data;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { owner } = await load(params);
  return { title: owner.name, description: owner.bio?.slice(0, 155) ?? `${owner.name} on PAWS Connect` };
}

export default async function OwnerPage({ params }: { params: Params }) {
  const { owner, pets } = await load(params);
  const listed = pets.filter((p) => p.status !== "adopted");
  const rehomed = pets.filter((p) => p.status === "adopted");

  return (
    <div className="container-page pb-10">
      <Link href="/owners" className="link mt-6 inline-flex items-center gap-1 text-sm">
        <ArrowLeft className="size-4" aria-hidden /> All owners
      </Link>
      <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
        <span className="flex size-20 shrink-0 items-center justify-center rounded-full bg-primary-600 text-2xl font-semibold text-white">
          {initials(owner.name)}
        </span>
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            {owner.name}
            {owner.verified && <BadgeCheck className="size-6 text-primary-600 dark:text-primary-400" aria-label="Verified owner" />}
          </h1>
          <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="size-4" aria-hidden /> {owner.city}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays className="size-4" aria-hidden /> Member since {shortDate(owner.createdAt)}
            </span>
          </p>
          {owner.bio && <p className="mt-3 max-w-2xl text-slate-700 dark:text-slate-300">{owner.bio}</p>}
        </div>
      </div>

      <section className="mt-10" aria-labelledby="listed">
        <h2 id="listed" className="text-xl font-semibold">
          Looking for a home ({listed.length})
        </h2>
        {listed.length ? (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listed.map((pet) => (
              <li key={pet.id}>
                <PetCard pet={pet} owner={owner} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4">
            <EmptyState title="No pets listed right now" />
          </div>
        )}
      </section>

      {rehomed.length > 0 && (
        <section className="mt-10" aria-labelledby="rehomed">
          <h2 id="rehomed" className="text-xl font-semibold">
            Safely rehomed
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rehomed.map((pet) => (
              <li key={pet.id}>
                <PetCard pet={pet} owner={owner} showFavorite={false} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
