import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";
import { PetCard } from "@/components/pets/pet-card";
import { EmptyState, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { withMiles } from "@/lib/location";
import { readSimulatedLocation } from "@/lib/location-server";
import { listFavorites } from "@/lib/queries";

export const metadata: Metadata = { title: "Favorites", robots: { index: false } };

export default async function FavoritesPage() {
  const user = await requireUser("/favorites");
  const [raw, origin] = await Promise.all([listFavorites(user.id), readSimulatedLocation()]);
  const rows = withMiles(raw, origin);
  return (
    <div className="container-page pb-10">
      <PageHeader
        title="Favorites"
        description={rows.length ? `${rows.length} saved ${rows.length === 1 ? "pet" : "pets"}. Tap a pet to apply or message the owner.` : undefined}
        actions={
          rows.length > 0 && (
            <Link href="/matches" className="btn btn-outline">
              Find more matches
            </Link>
          )
        }
      />
      {rows.length === 0 ? (
        <EmptyState
          icon={<Heart className="size-10" />}
          title="No favorites yet"
          description="Tap the heart on any pet, or like pets in your matches, to save them here."
          action={{ href: "/pets", label: "Browse pets" }}
        />
      ) : (
        <>
          <h2 className="sr-only">Saved pets</h2>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {rows.map((r, i) => (
              <PetCard key={r.pet.id} pet={r.pet} owner={r.owner} shelter={r.shelter} miles={r.miles} priority={i < 4} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
