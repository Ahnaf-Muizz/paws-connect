import type { Metadata } from "next";
import Link from "next/link";
import { Bone, MapPin, Phone, Pill, Scissors, ShieldCheck, Stethoscope } from "lucide-react";
import { AddToCartButton } from "@/components/commerce/add-to-cart-button";
import { ProductReviews } from "@/components/commerce/product-reviews";
import { Badge, PageHeader } from "@/components/ui";
import type { ProductCategory, Species } from "@/lib/db/schema";
import { listProducts } from "@/lib/queries";
import { SPECIES } from "@/lib/validators";
import { cn, money, telHref } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pet resources",
  description: "Compare pet insurance, food, clinic services, groomers, and medicine, then check out in one cart.",
};

const TABS: { key: ProductCategory; label: string; icon: typeof Bone; blurb: string }[] = [
  { key: "insurance", label: "Insurance", icon: ShieldCheck, blurb: "Accident, illness, and wellness plans. A single emergency visit can cost more than a year of coverage." },
  { key: "food", label: "Food", icon: Bone, blurb: "Vet-recommended diets delivered locally, plus low-cost options for families on a budget." },
  { key: "clinic", label: "Clinics", icon: Stethoscope, blurb: "Book exams, vaccines, dental cleanings, and spay/neuter surgery at local clinics." },
  { key: "groomer", label: "Groomers", icon: Scissors, blurb: "Baths, cuts, and nail trims from local groomers, including mobile service." },
  { key: "medicine", label: "Medicine", icon: Pill, blurb: "Flea, tick, and heartworm prevention and common prescriptions." },
];

type SP = Promise<Record<string, string | undefined>>;

export default async function ResourcesPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const tab = TABS.find((t) => t.key === sp.tab) ?? TABS[0];
  const species = SPECIES.includes(sp.species as Species) ? (sp.species as Species) : undefined;
  const products = (await listProducts(tab.key)).filter(({ product }) => !species || product.species.includes(species));
  const link = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { tab: tab.key, species, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    return `/resources?${p}`;
  };

  return (
    <div className="container-page pb-10">
      <PageHeader
        eyebrow="Resources"
        title="Everything your pet needs, in one place"
        description="Affordable care keeps pets in loving homes. Compare trusted providers and check out once."
        actions={
          <Link href="/cost-estimator" className="btn btn-outline">
            Estimate monthly costs
          </Link>
        }
      />

      <nav aria-label="Resource categories" className="sticky top-16 z-20 -mx-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:mx-0 sm:px-0 dark:border-slate-800 dark:bg-slate-950/95">
        <ul className="-mb-px flex gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const active = t.key === tab.key;
            return (
              <li key={t.key} className="shrink-0">
                <Link
                  href={`/resources?tab=${t.key}${species ? `&species=${species}` : ""}`}
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 items-center gap-2 border-b-2 px-4 text-sm font-medium transition",
                    active
                      ? "border-primary-600 text-primary-700 dark:border-primary-400 dark:text-primary-300"
                      : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
                  )}
                >
                  <t.icon className="size-4" aria-hidden /> {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">{tab.blurb}</p>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="Filter by pet">
          {[undefined, ...SPECIES].map((s) => (
            <Link
              key={s ?? "all"}
              href={link({ species: s })}
              scroll={false}
              aria-current={species === s ? "true" : undefined}
              className={cn(
                "chip min-h-9 shrink-0 border px-3 capitalize",
                species === s
                  ? "border-primary-600 bg-primary-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
              )}
            >
              {s ? `${s}s` : "All pets"}
            </Link>
          ))}
        </div>
      </div>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.map(({ product, rating, reviews }) => (
          <li key={product.id} className="card flex flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">{product.provider}</p>
                <h2 className="mt-1 text-lg leading-snug font-semibold">{product.name}</h2>
              </div>
              {product.featured && <Badge tone="accent">Popular</Badge>}
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{product.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {product.tags.map((t) => (
                <Badge key={t} tone="primary">
                  {t}
                </Badge>
              ))}
            </div>
            {(product.address || product.phone) && (
              <ul className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                {product.address && (
                  <li className="flex gap-2">
                    <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden /> {product.address}
                  </li>
                )}
                {product.phone && (
                  <li className="flex gap-2">
                    <Phone className="mt-0.5 size-4 shrink-0" aria-hidden />
                    <a href={telHref(product.phone)} className="link">
                      {product.phone}
                    </a>
                  </li>
                )}
              </ul>
            )}
            <div className="mt-3">
              <ProductReviews productId={product.id} productName={product.name} rating={rating} count={reviews} />
            </div>
            <div className="mt-auto flex items-end justify-between gap-3 pt-4">
              <p>
                <span className="font-display text-2xl font-bold text-slate-900 dark:text-white">{money(product.priceCents)}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400"> / {product.unit}</span>
              </p>
              <AddToCartButton
                line={{
                  productId: product.id,
                  name: product.name,
                  provider: product.provider,
                  category: product.category,
                  priceCents: product.priceCents,
                  unit: product.unit,
                }}
                label={product.category === "insurance" ? "Enroll" : product.category === "clinic" || product.category === "groomer" ? "Book" : "Add"}
              />
            </div>
          </li>
        ))}
      </ul>
      {products.length === 0 && <p className="mt-6 text-center text-slate-500">Nothing here for that pet yet.</p>}
    </div>
  );
}
