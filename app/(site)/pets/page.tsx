import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { PawPrint } from "lucide-react";
import { PetCard } from "@/components/pets/pet-card";
import { PetFilters, PetFiltersSidebar } from "@/components/pets/pet-filters";
import { EmptyState, PageHeader } from "@/components/ui";
import type { AgeGroup, Level, Size, Species } from "@/lib/db/schema";
import { listPets } from "@/lib/queries";
import { AGES, LEVELS, SIZES, SPECIES } from "@/lib/validators";

export const metadata: Metadata = {
  title: "Adoptable pets",
  description: "Dogs, cats, rabbits, and birds in Lubbock and the South Plains who need a safe new home.",
};

type SP = Promise<Record<string, string | string[] | undefined>>;

function pick<T extends string>(raw: string | string[] | undefined, allowed: readonly T[]): T[] {
  const value = Array.isArray(raw) ? raw.join(",") : raw;
  return (value?.split(",") ?? []).filter((v): v is T => (allowed as readonly string[]).includes(v));
}

export default async function PetsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined));
  const sort = one("sort");
  const source = one("source");
  const rows = await listPets({
    q: one("q")?.slice(0, 60),
    species: pick<Species>(sp.species, SPECIES),
    size: pick<Size>(sp.size, SIZES),
    age: pick<AgeGroup>(sp.age, AGES),
    energy: pick<Level>(sp.energy, LEVELS),
    kids: one("kids") === "1",
    dogs: one("dogs") === "1",
    cats: one("cats") === "1",
    source: source === "owner" || source === "shelter" ? source : undefined,
    sort: sort === "name" || sort === "age" ? sort : "newest",
  });

  return (
    <div className="container-page">
      <PageHeader
        eyebrow="Pets"
        title="Find a pet who fits your life"
        description="Every pet here is waiting for a safe, screened home. Many are being rehomed directly by their owners, so they never have to enter a crowded shelter."
        actions={
          <Link href="/matches" className="btn btn-primary">
            See my matches
          </Link>
        }
      />
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-24">
            <Suspense>
              <PetFiltersSidebar />
            </Suspense>
          </div>
        </aside>
        <div>
          <Suspense>
            <PetFilters total={rows.length} />
          </Suspense>
          {rows.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                icon={<PawPrint className="size-10" />}
                title="No pets match those filters"
                description="Try removing a filter or two. New pets are posted every day."
                action={{ href: "/pets", label: "Clear all filters" }}
              />
            </div>
          ) : (
            <>
              <h2 className="sr-only">Results</h2>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {rows.map(({ pet, owner, shelter }, i) => (
                  <li key={pet.id}>
                    <PetCard pet={pet} owner={owner} shelter={shelter} priority={i < 3} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
