import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Globe, MapPin, Phone, Siren } from "lucide-react";
import { ReviewForm } from "@/components/review-form";
import { ReviewList } from "@/components/review-list";
import { Badge, SampleTag, Stars } from "@/components/ui";
import { getVet, listVets } from "@/lib/queries";
import { telHref } from "@/lib/utils";

export const revalidate = 300;

type Params = Promise<{ id: string }>;

export async function generateStaticParams() {
  return (await listVets()).map(({ vet }) => ({ id: String(vet.id) }));
}

async function load(params: Params) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const data = await getVet(id);
  if (!data) notFound();
  return data;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { vet } = await load(params);
  return { title: vet.clinic, description: `${vet.clinic} in Lubbock, TX: ${vet.specialties.join(", ")}.` };
}

export default async function VetPage({ params }: { params: Params }) {
  const { vet, reviews } = await load(params);
  const avg = reviews.length ? reviews.reduce((n, r) => n + r.review.rating, 0) / reviews.length : 0;
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${vet.clinic} ${vet.address}`)}`;

  return (
    <div className="container-page max-w-5xl pb-10">
      <Link href="/vets" className="link mt-6 inline-flex items-center gap-1 text-sm">
        <ArrowLeft className="size-4" aria-hidden /> All vets
      </Link>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="flex flex-wrap gap-2">
            <SampleTag isReal={vet.isReal} />
            {vet.emergency && (
              <Badge tone="danger">
                <Siren className="size-3.5" aria-hidden /> 24/7 emergency
              </Badge>
            )}
            <Badge tone={vet.acceptsNewPatients ? "success" : "neutral"}>
              {vet.acceptsNewPatients ? "Accepting new patients" : "Not taking new patients"}
            </Badge>
          </div>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{vet.clinic}</h1>
          <p className="mt-1 text-lg text-slate-600 dark:text-slate-400">{vet.name}</p>
          <Stars rating={avg} count={reviews.length} className="mt-3" />

          <section className="mt-8" aria-labelledby="services">
            <h2 id="services" className="text-xl font-semibold">
              Services
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {vet.specialties.map((s) => (
                <Badge key={s} tone="primary" className="text-sm">
                  {s}
                </Badge>
              ))}
            </div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Treats: <span className="capitalize">{vet.species.map((s) => `${s}s`).join(", ")}</span>
            </p>
          </section>

          <section className="mt-10" aria-labelledby="reviews">
            <h2 id="reviews" className="text-xl font-semibold">
              Reviews
            </h2>
            <div className="mt-4">
              <ReviewForm targetType="vet" targetId={vet.id} />
            </div>
            <ReviewList reviews={reviews} />
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card space-y-4 p-5">
            <a href={telHref(vet.phone)} className="btn btn-primary min-h-12 w-full text-base">
              <Phone className="size-5" aria-hidden /> Call {vet.phone}
            </a>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden />
                <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="link">
                  {vet.address}
                </a>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden /> {vet.hours}
              </li>
              {vet.website && (
                <li className="flex gap-3">
                  <Globe className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden />
                  <a href={vet.website} target="_blank" rel="noopener noreferrer" className="link break-all">
                    {vet.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                  </a>
                </li>
              )}
            </ul>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Price level: {"$".repeat(vet.priceLevel)} of $$$.{" "}
              <Link href="/resources?tab=clinic" className="link">
                Compare clinic plans
              </Link>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
