import Link from "next/link";
import { asc, gte } from "drizzle-orm";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  ClipboardList,
  HandHeart,
  HeartHandshake,
  Home as HomeIcon,
  Link2,
  PawPrint,
  Search,
  ShieldCheck,
  ShoppingBag,
  Stethoscope,
  Users,
} from "lucide-react";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { PetCard } from "@/components/pets/pet-card";
import { getDb, schema } from "@/lib/db";
import { HERO_SLIDES } from "@/lib/photos";
import { withMiles } from "@/lib/location";
import { readSimulatedLocation } from "@/lib/location-server";
import { getStats, listPets, listShelters } from "@/lib/queries";
import { eventDate, eventTime } from "@/lib/utils";

export const revalidate = 300;

const STEPS = [
  {
    icon: ClipboardList,
    title: "Post a pet profile",
    body: "Owners who can no longer care for a pet share photos, personality, health records, and what kind of home they need.",
  },
  {
    icon: ShieldCheck,
    title: "Families apply and get screened",
    body: "Adopters complete a lifestyle profile, then pass identity, home, and reference checks before any meet-and-greet.",
  },
  {
    icon: HeartHandshake,
    title: "We make a safe match",
    body: "Our matching score highlights the best fits and flags concerns, so pets go straight from one loving home to the next.",
  },
];

const EXPLORE = [
  { href: "/shelters", icon: Building2, title: "Shelters", body: "Local shelters, capacity, and adoptable pets" },
  { href: "/vets", icon: Stethoscope, title: "Vets", body: "Clinics, specialists, and 24/7 emergency care" },
  { href: "/owners", icon: Users, title: "Owners", body: "Pet owners in your community" },
  { href: "/pets", icon: PawPrint, title: "Pets", body: "Dogs, cats, rabbits, and birds needing homes" },
  { href: "/resources", icon: ShoppingBag, title: "Resources", body: "Insurance, food, clinics, groomers, medicine" },
  { href: "/nonprofits", icon: Link2, title: "Nonprofits", body: "Trusted pet-care organizations near Lubbock" },
];

export default async function HomePage() {
  const db = await getDb();
  const [pets, stats, shelters, events, origin] = await Promise.all([
    listPets({ sort: "newest" }),
    getStats(),
    listShelters(),
    db.select().from(schema.events).where(gte(schema.events.startsAt, new Date())).orderBy(asc(schema.events.startsAt)).limit(3),
    readSimulatedLocation(),
  ]);
  const featured = withMiles(
    pets.filter(({ pet }) => pet.status === "available").slice(0, 8),
    origin,
  );
  const real = shelters.filter((s) => s.shelter.isReal);
  const capacity = real.reduce((n, s) => n + s.shelter.capacity, 0);
  const occupied = real.reduce((n, s) => n + s.shelter.currentCount, 0);
  const capacityPct = capacity ? Math.round((occupied / capacity) * 100) : 0;

  return (
    <>
      <section className="relative overflow-hidden bg-primary-50/70 dark:bg-slate-900/60">
        <div className="container-page grid items-center gap-10 py-10 sm:py-16 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary-800 ring-1 ring-primary-200 dark:bg-slate-950 dark:text-primary-200 dark:ring-primary-800">
              <HomeIcon className="size-3.5" aria-hidden /> Lubbock &amp; the South Plains
            </p>
            <h1 className="mt-5 text-4xl leading-tight font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Every pet deserves a <span className="text-primary-600 dark:text-primary-400">safe next home</span>.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-300">
              Shelters are often full, and when there&apos;s no room, pets can end up on the streets. PAWS Connect links pets who
              need a new home directly with safe, screened families, so they never have to be left outside.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/matches" className="btn btn-primary min-h-12 px-6 text-base">
                <Search className="size-5" aria-hidden /> Find my match
              </Link>
              <Link href="/rehome" className="btn btn-outline min-h-12 px-6 text-base">
                <HandHeart className="size-5" aria-hidden /> Rehome a pet safely
              </Link>
            </div>
            <ul className="mt-8 grid grid-cols-3 gap-4 text-sm">
              {[
                ["Screened", "families only"],
                ["Home to home", "no shelter stop"],
                ["Free", "for pet owners"],
              ].map(([a, b]) => (
                <li key={a}>
                  <p className="font-display text-lg font-bold text-slate-900 dark:text-white">{a}</p>
                  <p className="text-slate-600 dark:text-slate-400">{b}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative mx-auto w-full max-w-xl">
            <HeroSlideshow slides={HERO_SLIDES} sizes="(min-width: 1024px) 560px, 100vw" label="Families with their adopted pets" />
            <div className="card absolute -bottom-5 left-4 flex items-center gap-3 p-3 sm:-left-6">
              <span className="flex size-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
                <BadgeCheck className="size-6" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {stats.matches} safe {stats.matches === 1 ? "match" : "matches"} made
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{stats.pets} pets looking for homes now</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-14 sm:py-20" aria-labelledby="problem">
        <div className="grid gap-8 lg:grid-cols-5 lg:items-center">
          <div className="lg:col-span-2">
            <h2 id="problem" className="text-2xl font-bold sm:text-3xl">
              Local shelters are at {capacityPct}% capacity.
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Pet owners struggle to find safe, reliable resources when life changes. Care is expensive, finding services takes time,
              and with nowhere to turn, owners can make unsafe decisions for their pets. PAWS Connect brings it all into one place.
            </p>
            <Link href="/shelters" className="link mt-4 inline-flex items-center gap-1">
              See shelter capacity <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-3">
            {real.map(({ shelter }) => {
              const pct = Math.round((shelter.currentCount / shelter.capacity) * 100);
              return (
                <li key={shelter.id} className="card p-4">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{shelter.name}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-accent-500" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {shelter.currentCount} of {shelter.capacity} spaces filled ({pct}%)
                  </p>
                </li>
              );
            })}
            <li className="card flex flex-col justify-center bg-primary-600 p-4 text-white dark:bg-primary-700">
              <p className="text-sm font-semibold">Can&apos;t keep your pet?</p>
              <p className="mt-1 text-xs text-primary-50">Skip the full shelter. Rehome directly to a screened family.</p>
              <Link href="/guides/cant-keep-my-pet" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline">
                See your options <ArrowRight className="size-4" aria-hidden />
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <section className="surface-muted py-14 sm:py-20" aria-labelledby="how">
        <div className="container-page">
          <p className="text-sm font-semibold tracking-wide text-primary-600 uppercase dark:text-primary-400">How it works</p>
          <h2 id="how" className="mt-2 text-2xl font-bold sm:text-3xl">
            From one home to the next, safely.
          </h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative">
                <div className="flex items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-primary-600 ring-1 ring-primary-200 dark:bg-slate-950 dark:text-primary-300 dark:ring-primary-800">
                    <step.icon className="size-6" aria-hidden />
                  </span>
                  <span className="font-display text-sm font-semibold text-slate-400">Step {i + 1}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page py-14 sm:py-20" aria-labelledby="featured">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="featured" className="text-2xl font-bold sm:text-3xl">
              Pets looking for a home
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Newly posted by owners and local shelters.</p>
          </div>
          <Link href="/pets" className="btn btn-outline hidden sm:inline-flex">
            Browse all {stats.pets} <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {featured.map(({ pet, owner, shelter, miles }, i) => (
            <div key={pet.id} className="w-[78%] shrink-0 snap-start sm:w-auto">
              <PetCard pet={pet} owner={owner} shelter={shelter} miles={miles} priority={i < 2} />
            </div>
          ))}
        </div>
        <Link href="/pets" className="btn btn-outline mt-6 w-full sm:hidden">
          Browse all {stats.pets} pets
        </Link>
      </section>

      <section className="container-page pb-14 sm:pb-20" aria-labelledby="explore">
        <h2 id="explore" className="text-2xl font-bold sm:text-3xl">
          Everything your pet needs, in one place
        </h2>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {EXPLORE.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="card flex h-full flex-col gap-3 p-4 transition hover:border-primary-300 sm:flex-row sm:items-start sm:p-5 dark:hover:border-primary-700"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                  <item.icon className="size-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-semibold text-slate-900 dark:text-white">{item.title}</span>
                  <span className="mt-0.5 block text-sm text-slate-600 dark:text-slate-400">{item.body}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {events.length > 0 && (
        <section className="surface-muted py-14 sm:py-20" aria-labelledby="events">
          <div className="container-page">
            <div className="flex items-end justify-between gap-4">
              <h2 id="events" className="text-2xl font-bold sm:text-3xl">
                Upcoming in Lubbock
              </h2>
              <Link href="/events" className="link inline-flex items-center gap-1 text-sm">
                All events <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
            <ul className="mt-8 grid gap-4 md:grid-cols-3">
              {events.map((e) => (
                <li key={e.id} className="card p-5">
                  <p className="flex items-center gap-2 text-sm font-semibold text-accent-700 dark:text-accent-300">
                    <CalendarDays className="size-4" aria-hidden /> {eventDate(e.startsAt)} &middot; {eventTime(e.startsAt)}
                  </p>
                  <h3 className="mt-2 font-semibold">{e.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{e.location}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="container-page py-14 sm:py-20">
        <div className="grid gap-6 overflow-hidden rounded-3xl bg-primary-600 p-6 text-white sm:p-10 md:grid-cols-[1fr_auto] md:items-center dark:bg-primary-800">
          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Shelters are full. Your spare room isn&apos;t.</h2>
            <p className="mt-3 max-w-2xl text-primary-50">
              Fostering for even two weeks frees up space so a shelter can take in another animal. Supplies and vet care are covered.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
            <Link href="/foster" className="btn bg-white px-6 text-primary-800 hover:bg-primary-50">
              Become a foster
            </Link>
            <Link href="/donate" className="btn btn-accent px-6">
              Donate to a shelter
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
