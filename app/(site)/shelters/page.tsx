import type { Metadata } from "next";
import Link from "next/link";
import { Clock, MapPin, Phone } from "lucide-react";
import { CapacityMeter } from "@/components/capacity-meter";
import { PageHeader, SampleTag, Badge } from "@/components/ui";
import { listShelters } from "@/lib/queries";
import { telHref } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Shelters",
  description: "Animal shelters and rescues in Lubbock and the South Plains, with live capacity and adoptable pets.",
};

export default async function SheltersPage() {
  const rows = await listShelters();
  return (
    <div className="container-page pb-10">
      <PageHeader
        eyebrow="Shelters"
        title="Shelters & rescues near Lubbock"
        description="When shelters are full, every direct owner-to-family match frees a kennel for an animal with nowhere else to go. Adopt, foster, or donate to help."
        actions={
          <>
            <Link href="/foster" className="btn btn-primary">
              Become a foster
            </Link>
            <Link href="/map" className="btn btn-outline">
              View map
            </Link>
          </>
        }
      />
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map(({ shelter, listed }) => (
          <li key={shelter.id} className="card relative flex flex-col p-5 transition hover:border-primary-300 dark:hover:border-primary-700">
            <div className="flex flex-wrap gap-2">
              <SampleTag isReal={shelter.isReal} />
              {shelter.acceptsFosters && <Badge tone="primary">Needs fosters</Badge>}
            </div>
            <h2 className="mt-3 text-lg font-semibold">
              <Link href={`/shelters/${shelter.slug}`} className="after:absolute after:inset-0">
                {shelter.name}
              </Link>
            </h2>
            <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{shelter.description}</p>
            <ul className="mt-4 space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden /> {shelter.address}
              </li>
              {shelter.hours && (
                <li className="flex gap-2">
                  <Clock className="mt-0.5 size-4 shrink-0" aria-hidden /> {shelter.hours}
                </li>
              )}
            </ul>
            <CapacityMeter current={shelter.currentCount} capacity={shelter.capacity} className="mt-4" />
            <div className="mt-auto flex items-center justify-between gap-2 pt-4">
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                {listed} pet{listed === 1 ? "" : "s"} on PAWS
              </span>
              {shelter.phone && (
                <a href={telHref(shelter.phone)} className="btn btn-outline relative z-10 min-h-10 px-3 text-sm">
                  <Phone className="size-4" aria-hidden /> Call
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
