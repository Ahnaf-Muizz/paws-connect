import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Clock, MapPin, Phone, Siren } from "lucide-react";
import { Badge, EmptyState, PageHeader, SampleTag, Stars } from "@/components/ui";
import type { Species } from "@/lib/db/schema";
import { listVets } from "@/lib/queries";
import { SPECIES } from "@/lib/validators";
import { cn, telHref } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Vets",
  description: "Veterinarians and 24/7 emergency animal hospitals around Lubbock, TX.",
};

type SP = Promise<Record<string, string | undefined>>;

function href(current: Record<string, string | undefined>, patch: Record<string, string | undefined>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...current, ...patch })) if (v) p.set(k, v);
  const q = p.toString();
  return q ? `/vets?${q}` : "/vets";
}

export default async function VetsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const emergency = sp.emergency === "1";
  const species = SPECIES.includes(sp.species as Species) ? (sp.species as Species) : undefined;
  const newPatients = sp.new === "1";
  const all = await listVets();
  const rows = all
    .filter(({ vet }) => (!emergency || vet.emergency) && (!species || vet.species.includes(species)) && (!newPatients || vet.acceptsNewPatients))
    .sort((a, b) => (emergency ? 0 : Number(b.vet.emergency) - Number(a.vet.emergency)) || b.rating - a.rating);
  const current = { emergency: sp.emergency, species, new: sp.new };

  const chip = (active: boolean, to: string, label: React.ReactNode) => (
    <Link
      href={to}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={cn(
        "chip min-h-10 border px-4 text-sm",
        active
          ? "border-primary-600 bg-primary-600 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:border-primary-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
      )}
    >
      {label}
    </Link>
  );

  return (
    <div className="container-page pb-10">
      <PageHeader
        eyebrow="Vets"
        title="Veterinarians near you"
        description="Routine care, specialists, and round-the-clock emergency hospitals. Ratings come from PAWS Connect members."
      />

      {emergency && (
        <div role="alert" className="mb-6 flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100">
          <AlertTriangle className="size-6 shrink-0" aria-hidden />
          <div className="text-sm">
            <p className="font-semibold">If your pet is struggling to breathe, bleeding heavily, or unresponsive, call now.</p>
            <p className="mt-1">
              Suspect poisoning? ASPCA Animal Poison Control:{" "}
              <a href="tel:+18884264435" className="font-semibold underline">
                (888) 426-4435
              </a>{" "}
              (a consultation fee may apply).
            </p>
          </div>
        </div>
      )}

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        {chip(emergency, href(current, { emergency: emergency ? undefined : "1" }), (
          <>
            <Siren className="size-4" aria-hidden /> 24/7 emergency
          </>
        ))}
        {chip(newPatients, href(current, { new: newPatients ? undefined : "1" }), "Accepting new patients")}
        {SPECIES.map((s) => chip(species === s, href(current, { species: species === s ? undefined : s }), <span className="capitalize">{s}s</span>))}
      </div>

      {rows.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No vets match those filters" action={{ href: "/vets", label: "Show all vets" }} />
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map(({ vet, rating, reviews }) => (
            <li key={vet.id} className="card relative flex flex-col p-5 transition hover:border-primary-300 dark:hover:border-primary-700">
              <div className="flex flex-wrap gap-2">
                <SampleTag isReal={vet.isReal} />
                {vet.emergency && (
                  <Badge tone="danger">
                    <Siren className="size-3.5" aria-hidden /> 24/7 emergency
                  </Badge>
                )}
              </div>
              <h2 className="mt-3 text-lg font-semibold">
                <Link href={`/vets/${vet.id}`} className="after:absolute after:inset-0">
                  {vet.clinic}
                </Link>
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">{vet.name}</p>
              <Stars rating={rating} count={reviews} className="mt-2" />
              <div className="mt-3 flex flex-wrap gap-1.5">
                {vet.specialties.slice(0, 3).map((s) => (
                  <Badge key={s} tone="primary">
                    {s}
                  </Badge>
                ))}
              </div>
              <ul className="mt-4 space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden /> {vet.address}
                </li>
                <li className="flex gap-2">
                  <Clock className="mt-0.5 size-4 shrink-0" aria-hidden /> {vet.hours}
                </li>
              </ul>
              <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  <span className="sr-only">Price level </span>
                  <span aria-hidden>{"$".repeat(vet.priceLevel)}</span>
                  <span className="sr-only">{vet.priceLevel} of 3</span>
                  {!vet.acceptsNewPatients && <span className="ml-2">&middot; Not taking new patients</span>}
                </span>
                <a
                  href={telHref(vet.phone)}
                  className={cn("btn relative z-10 min-h-10 px-3 text-sm", vet.emergency ? "btn-primary" : "btn-outline")}
                >
                  <Phone className="size-4" aria-hidden /> Call
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
