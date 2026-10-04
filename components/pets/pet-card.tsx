import Link from "next/link";
import { BadgeCheck, Building2, MapPin } from "lucide-react";
import type { Pet } from "@/lib/db/schema";
import { formatMiles } from "@/lib/location";
import { formatAge } from "@/lib/pets";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { FavoriteButton } from "./favorite-button";
import { PetImage } from "./pet-image";

export function PetCard({
  pet,
  owner,
  shelter,
  score,
  miles,
  priority,
  showFavorite = true,
}: {
  pet: Pet;
  owner?: { id: number; name: string; verified: boolean } | null;
  shelter?: { id: number; name: string } | null;
  score?: number;
  miles?: number;
  priority?: boolean;
  showFavorite?: boolean;
}) {
  return (
    <article className="card group relative overflow-hidden transition hover:border-primary-300 dark:hover:border-primary-700">
      <div className="relative aspect-4/3 overflow-hidden bg-slate-100 dark:bg-slate-800">
        <PetImage
          src={pet.photos[0]}
          alt={`${pet.name}, a ${pet.breed}`}
          species={pet.species}
          sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          priority={priority}
          className="transition duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {pet.status === "pending" && <Badge tone="warning">Adoption pending</Badge>}
          {pet.status === "adopted" && <Badge tone="success">Adopted</Badge>}
          {score !== undefined && (
            <Badge tone="primary" className="bg-white/95 dark:bg-slate-900/95">
              {score}% match
            </Badge>
          )}
        </div>
        {showFavorite && <FavoriteButton petId={pet.id} petName={pet.name} className="absolute top-2 right-2 z-10" />}
      </div>
      <div className="p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate text-lg font-semibold">
            <Link href={`/pets/${pet.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
              {pet.name}
            </Link>
          </h3>
          <span className="shrink-0 text-sm text-slate-500 capitalize dark:text-slate-400">
            {pet.sex}, {formatAge(pet.ageYears)}
          </span>
        </div>
        <p className="truncate text-sm text-slate-600 dark:text-slate-400">{pet.breed}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge tone="neutral" className="capitalize">
            {pet.size}
          </Badge>
          <Badge tone="neutral" className="capitalize">
            {pet.energy} energy
          </Badge>
          {pet.goodWithKids && <Badge tone="primary">Kid-friendly</Badge>}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <span className="flex min-w-0 items-center gap-1">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{miles !== undefined ? `${pet.city} · ${formatMiles(miles)}` : pet.city}</span>
          </span>
          <span className={cn("flex min-w-0 items-center gap-1", owner && "text-primary-700 dark:text-primary-300")}>
            {owner ? (
              <>
                {owner.verified && <BadgeCheck className="size-3.5 shrink-0" aria-label="Verified owner" />}
                <span className="truncate">From owner</span>
              </>
            ) : shelter ? (
              <>
                <Building2 className="size-3.5 shrink-0" aria-hidden />
                <span className="truncate">{shelter.name}</span>
              </>
            ) : null}
          </span>
        </div>
      </div>
    </article>
  );
}
