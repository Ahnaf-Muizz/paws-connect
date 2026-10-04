import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarClock,
  Check,
  Globe,
  HeartPulse,
  MapPin,
  Phone,
  Stethoscope,
  Syringe,
  X,
} from "lucide-react";
import { BreedCare } from "@/components/pets/breed-care";
import { FavoriteButton } from "@/components/pets/favorite-button";
import { PetActions } from "@/components/pets/pet-actions";
import { PetImage } from "@/components/pets/pet-image";
import { ShareButton } from "@/components/share-button";
import { Badge } from "@/components/ui";
import { formatMiles, haversineMiles } from "@/lib/location";
import { readSimulatedLocation } from "@/lib/location-server";
import { formatAge, SPECIES_LABEL } from "@/lib/pets";
import { getPet } from "@/lib/queries";
import { initials, money, shortDate, telHref } from "@/lib/utils";

export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

type Params = Promise<{ id: string }>;

const dueWithin30Days = (d: Date | null) => !!d && new Date(d).getTime() - Date.now() < 30 * 86_400_000;

async function load(params: Params) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const data = await getPet(id);
  if (!data) notFound();
  return data;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { pet } = await load(params);
  return {
    title: `${pet.name}, ${pet.breed}`,
    description: pet.description.slice(0, 155),
    openGraph: { images: pet.photos.slice(0, 1) },
  };
}

function Trait({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <span
        className={
          ok
            ? "flex size-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300"
            : "flex size-6 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800"
        }
      >
        {ok ? <Check className="size-3.5" aria-hidden /> : <X className="size-3.5" aria-hidden />}
      </span>
      <span className={ok ? "" : "text-slate-500 dark:text-slate-400"}>
        {label}
        <span className="sr-only">: {ok ? "yes" : "no"}</span>
      </span>
    </li>
  );
}

const RECORD_ICON = { vaccine: Syringe, checkup: Stethoscope, medication: HeartPulse, procedure: HeartPulse };

export default async function PetPage({ params }: { params: Params }) {
  const [{ pet, owner, shelter, health }, origin] = await Promise.all([load(params), readSimulatedLocation()]);
  const available = pet.status === "available";
  const miles = haversineMiles(origin, pet);

  return (
    <div className="container-page pb-28 lg:pb-0">
      <Link href="/pets" className="link mt-4 inline-flex items-center gap-1 text-sm sm:mt-6">
        <ArrowLeft className="size-4" aria-hidden /> All pets
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:grid-rows-[auto_1fr] lg:gap-x-12">
        <div>
          <div className="relative -mx-4 aspect-square overflow-hidden bg-slate-100 sm:mx-0 sm:aspect-4/3 sm:rounded-3xl dark:bg-slate-800">
            <PetImage src={pet.photos[0]} alt={`${pet.name}, a ${pet.breed}`} species={pet.species} sizes="(min-width: 1024px) 640px, 100vw" priority />
            <div className="absolute top-3 right-3 flex gap-2">
              <ShareButton title={`Meet ${pet.name} on PAWS Connect`} />
              <FavoriteButton petId={pet.id} petName={pet.name} />
            </div>
            {pet.status !== "available" && (
              <div className="absolute bottom-3 left-3">
                <Badge tone={pet.status === "adopted" ? "success" : "warning"} className="text-sm">
                  {pet.status === "adopted" ? "Adopted - safe match made" : "Adoption pending"}
                </Badge>
              </div>
            )}
          </div>
          {pet.photos.length > 1 && (
            <ul className="mt-3 grid grid-cols-4 gap-2">
              {pet.photos.slice(1).map((src) => (
                <li key={src} className="relative aspect-square overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                  <PetImage src={src} alt={`Another photo of ${pet.name}`} species={pet.species} sizes="160px" />
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">{pet.name}</h1>
              <p className="mt-1 text-lg text-slate-600 dark:text-slate-400">{pet.breed}</p>
            </div>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {[
              ["Type", SPECIES_LABEL[pet.species]],
              ["Age", formatAge(pet.ageYears)],
              ["Sex", pet.sex],
              ["Size", pet.size],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
                <dt className="text-xs text-slate-500 dark:text-slate-400">{k}</dt>
                <dd className="font-semibold text-slate-900 capitalize dark:text-white">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone="neutral" className="capitalize">
              {pet.energy} energy
            </Badge>
            <Badge tone="neutral">
              <MapPin className="size-3.5" aria-hidden /> {pet.city} · {formatMiles(miles)}
            </Badge>
            <Badge tone="neutral">Care ~${pet.monthlyCost}/mo</Badge>
            <Badge tone={pet.adoptionFee ? "neutral" : "success"}>
              {pet.adoptionFee ? `Adoption fee ${money(pet.adoptionFee * 100)}` : "No rehoming fee"}
            </Badge>
          </div>

          <div className="card mt-6 p-5">
            <PetActions petId={pet.id} petName={pet.name} available={available} contactUserId={owner?.id ?? null} />
          </div>

          <div className="card mt-4 p-5">
            <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">Listed by</h2>
            {owner ? (
              <Link href={`/owners/${owner.id}`} className="mt-3 flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-full bg-primary-600 font-semibold text-white">
                  {initials(owner.name)}
                </span>
                <span>
                  <span className="flex items-center gap-1 font-semibold text-slate-900 dark:text-white">
                    {owner.name}
                    {owner.verified && <BadgeCheck className="size-4 text-primary-600 dark:text-primary-400" aria-label="Verified owner" />}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">Pet owner in {owner.city}</span>
                </span>
              </Link>
            ) : shelter ? (
              <div className="mt-3">
                <Link href={`/shelters/${shelter.slug}`} className="flex items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-full bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                    <Building2 className="size-6" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-semibold text-slate-900 dark:text-white">{shelter.name}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{shelter.address}</span>
                  </span>
                </Link>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {shelter.phone && (
                    <a href={telHref(shelter.phone)} className="btn btn-outline">
                      <Phone className="size-4" aria-hidden /> Call
                    </a>
                  )}
                  {shelter.website && (
                    <a href={shelter.website} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                      <Globe className="size-4" aria-hidden /> Website
                    </a>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            Budgeting for a {SPECIES_LABEL[pet.species].toLowerCase()}?{" "}
            <Link href={`/cost-estimator?species=${pet.species}&size=${pet.size}`} className="link">
              Estimate monthly costs
            </Link>{" "}
            or{" "}
            <Link href="/resources?tab=insurance" className="link">
              compare pet insurance
            </Link>
            .
          </p>
        </aside>

        <div className="lg:col-start-1 lg:row-start-2">
          <section aria-labelledby="about">
            <h2 id="about" className="text-xl font-semibold">
              About {pet.name}
            </h2>
            <p className="mt-3 leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300">{pet.description}</p>
            {pet.rehomeReason && (
              <div className="mt-5 rounded-2xl border-l-4 border-accent-400 bg-accent-50 p-4 dark:bg-accent-700/15">
                <p className="text-sm font-semibold text-accent-700 dark:text-accent-300">Why {pet.name} needs a new home</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{pet.rehomeReason}</p>
              </div>
            )}
          </section>

          <BreedCare
            name={pet.name}
            breed={pet.breed}
            species={pet.species}
            size={pet.size}
            energy={pet.energy}
            ageGroup={pet.ageGroup}
            needsYard={pet.needsYard}
            goodWithKids={pet.goodWithKids}
          />

          <section className="mt-8 grid gap-6 sm:grid-cols-2" aria-label="Compatibility and health">
            <div className="card p-5">
              <h2 className="font-semibold">Compatibility</h2>
              <ul className="mt-3 space-y-2.5">
                <Trait ok={pet.goodWithKids} label="Good with kids" />
                <Trait ok={pet.goodWithDogs} label="Good with dogs" />
                <Trait ok={pet.goodWithCats} label="Good with cats" />
                <Trait ok={!pet.needsYard} label="Fine without a yard" />
                <Trait ok={pet.experienceNeeded === "first-time"} label="Good for first-time owners" />
              </ul>
            </div>
            <div className="card p-5">
              <h2 className="font-semibold">Health &amp; care</h2>
              <ul className="mt-3 space-y-2.5">
                <Trait ok={pet.vaccinated} label="Vaccinated" />
                <Trait ok={pet.spayedNeutered} label="Spayed / neutered" />
                <Trait ok={pet.microchipped} label="Microchipped" />
                <Trait ok={pet.houseTrained} label={pet.species === "bird" ? "Hand-tame" : "House / litter trained"} />
              </ul>
            </div>
          </section>

          {health.length > 0 && (
            <section className="mt-8" aria-labelledby="records">
              <h2 id="records" className="text-xl font-semibold">
                Health records
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Shared by the current caretaker. Verify with your vet after adoption.</p>
              <ol className="mt-4 space-y-3">
                {health.map((r) => {
                  const Icon = RECORD_ICON[r.kind];
                  const dueSoon = dueWithin30Days(r.nextDue);
                  return (
                    <li key={r.id} className="card flex gap-3 p-4">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">{r.title}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          <span className="capitalize">{r.kind}</span> &middot; {shortDate(r.date)}
                        </p>
                        {r.notes && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{r.notes}</p>}
                      </div>
                      {r.nextDue && (
                        <Badge tone={dueSoon ? "warning" : "neutral"} className="h-fit shrink-0">
                          <CalendarClock className="size-3.5" aria-hidden /> Due {shortDate(r.nextDue)}
                        </Badge>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          )}
        </div>
      </div>

      {available && (
        <div className="fixed inset-x-0 bottom-[calc(var(--tabbar-height)+env(safe-area-inset-bottom))] z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-950/95">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-900 dark:text-white">{pet.name}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {pet.breed} &middot; {formatMiles(miles)}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2">
              <Link href={`/pets/${pet.id}/apply`} className="btn btn-primary px-5">
                Apply to adopt
              </Link>
              <Link href={`/pets/${pet.id}/appointment`} className="btn btn-outline px-5">
                Set up an appointment
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
