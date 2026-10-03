import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, Globe, HandHeart, Home, Mail, MapPin, Phone } from "lucide-react";
import { CapacityMeter } from "@/components/capacity-meter";
import { PetCard } from "@/components/pets/pet-card";
import { EmptyState, SampleTag } from "@/components/ui";
import { getShelter, listShelters } from "@/lib/queries";
import { eventDate, eventTime, telHref } from "@/lib/utils";

export const revalidate = 300;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return (await listShelters()).map(({ shelter }) => ({ slug: shelter.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const data = await getShelter((await params).slug);
  return data ? { title: data.shelter.name, description: data.shelter.description.slice(0, 155) } : {};
}

export default async function ShelterPage({ params }: { params: Params }) {
  const data = await getShelter((await params).slug);
  if (!data) notFound();
  const { shelter, pets, events } = data;
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${shelter.name} ${shelter.address}`)}`;
  const upcoming = events.filter((e) => new Date(e.endsAt) > new Date());

  return (
    <div className="container-page pb-10">
      <Link href="/shelters" className="link mt-6 inline-flex items-center gap-1 text-sm">
        <ArrowLeft className="size-4" aria-hidden /> All shelters
      </Link>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <SampleTag isReal={shelter.isReal} />
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{shelter.name}</h1>
          <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">{shelter.description}</p>

          <section className="mt-10" aria-labelledby="pets">
            <h2 id="pets" className="text-xl font-semibold">
              Pets at {shelter.name} ({pets.length})
            </h2>
            {pets.length ? (
              <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {pets.map((pet) => (
                  <li key={pet.id}>
                    <PetCard pet={pet} shelter={shelter} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4">
                <EmptyState
                  title="No pets listed on PAWS right now"
                  description={
                    shelter.website
                      ? "This shelter lists animals on its own site. Visit them to see who is waiting."
                      : "Check back soon, or browse pets from local owners."
                  }
                  action={{ href: "/pets", label: "Browse all pets" }}
                />
              </div>
            )}
          </section>

          {upcoming.length > 0 && (
            <section className="mt-10" aria-labelledby="events">
              <h2 id="events" className="text-xl font-semibold">
                Upcoming events
              </h2>
              <ul className="mt-4 space-y-3">
                {upcoming.map((e) => (
                  <li key={e.id} className="card flex gap-4 p-4">
                    <CalendarDays className="size-6 shrink-0 text-primary-600 dark:text-primary-400" aria-hidden />
                    <div>
                      <p className="font-semibold">{e.title}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {eventDate(e.startsAt)} &middot; {eventTime(e.startsAt)}
                      </p>
                      <Link href={`/events#event-${e.id}`} className="link text-sm">
                        Details & RSVP
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <CapacityMeter current={shelter.currentCount} capacity={shelter.capacity} />
            <ul className="mt-5 space-y-3 text-sm">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden />
                <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="link">
                  {shelter.address}
                </a>
              </li>
              {shelter.hours && (
                <li className="flex gap-3">
                  <Clock className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden /> {shelter.hours}
                </li>
              )}
              {shelter.phone && (
                <li className="flex gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden />
                  <a href={telHref(shelter.phone)} className="link">
                    {shelter.phone}
                  </a>
                </li>
              )}
              {shelter.email && (
                <li className="flex gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden />
                  <a href={`mailto:${shelter.email}`} className="link break-all">
                    {shelter.email}
                  </a>
                </li>
              )}
              {shelter.website && (
                <li className="flex gap-3">
                  <Globe className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden />
                  <a href={shelter.website} target="_blank" rel="noopener noreferrer" className="link break-all">
                    {shelter.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                  </a>
                </li>
              )}
            </ul>
          </div>
          <div className="card space-y-2 p-5">
            <h2 className="font-semibold">Help {shelter.name}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Fostering and donations free up space for animals in crisis.</p>
            {shelter.acceptsFosters && (
              <Link href={`/foster?shelter=${shelter.id}`} className="btn btn-primary w-full">
                <Home className="size-4" aria-hidden /> Foster a pet
              </Link>
            )}
            <Link href={`/donate?shelter=${shelter.id}`} className="btn btn-accent w-full">
              <HandHeart className="size-4" aria-hidden /> Donate
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
