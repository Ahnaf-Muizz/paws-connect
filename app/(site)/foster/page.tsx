import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { CalendarHeart, HeartHandshake, Home, Stethoscope } from "lucide-react";
import { CapacityMeter } from "@/components/capacity-meter";
import { FosterForm } from "@/components/foster-form";
import { Badge, PageHeader } from "@/components/ui";
import { getSessionUserId } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { listShelters } from "@/lib/queries";
import { shortDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Foster a pet",
  description: "Shelters around Lubbock are at capacity. Fostering for even two weeks frees a kennel and saves a life.",
};

const PERKS = [
  { icon: Stethoscope, title: "Vet care covered", body: "The shelter pays for food, supplies, and medical care." },
  { icon: CalendarHeart, title: "Flexible terms", body: "Choose two weeks, a month, or until adoption." },
  { icon: Home, title: "Frees a kennel", body: "Every foster opens space for another animal in need." },
];

async function myFosterApps(userId: number) {
  const db = await getDb();
  return db
    .select({ app: schema.fosterApplications, shelter: { name: schema.shelters.name, slug: schema.shelters.slug } })
    .from(schema.fosterApplications)
    .innerJoin(schema.shelters, eq(schema.fosterApplications.shelterId, schema.shelters.id))
    .where(eq(schema.fosterApplications.userId, userId))
    .orderBy(desc(schema.fosterApplications.createdAt));
}

export default async function FosterPage({ searchParams }: { searchParams: Promise<{ shelter?: string }> }) {
  const sp = await searchParams;
  const [rows, userId] = await Promise.all([listShelters(), getSessionUserId()]);
  const mine = userId ? await myFosterApps(userId) : [];
  const recruiting = rows.filter((r) => r.shelter.acceptsFosters).sort((a, b) => b.shelter.currentCount / b.shelter.capacity - a.shelter.currentCount / a.shelter.capacity);
  const preselect = recruiting.find((r) => String(r.shelter.id) === sp.shelter)?.shelter.id ?? recruiting[0]?.shelter.id;

  return (
    <div className="container-page pb-10">
      <PageHeader
        eyebrow="Foster"
        title="Open your home for a few weeks"
        description="When shelters are full, fosters are the difference between a kennel and the street. You provide the couch; the shelter covers the rest."
      />
      <ul className="mb-8 grid gap-4 sm:grid-cols-3">
        {PERKS.map((p) => (
          <li key={p.title} className="card flex gap-3 p-4">
            <p.icon className="size-6 shrink-0 text-primary-600 dark:text-primary-400" aria-hidden />
            <div>
              <h2 className="font-semibold">{p.title}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">{p.body}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
        <section aria-labelledby="need">
          <h2 id="need" className="mb-4 text-xl font-semibold">
            Shelters that need fosters most
          </h2>
          <ul className="space-y-3">
            {recruiting.map(({ shelter, listed }) => (
              <li key={shelter.id} className="card p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <Link href={`/shelters/${shelter.slug}`} className="font-semibold hover:text-primary-700 dark:hover:text-primary-300">
                    {shelter.name}
                  </Link>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{listed} pets listed</span>
                </div>
                <CapacityMeter current={shelter.currentCount} capacity={shelter.capacity} className="mt-3" />
              </li>
            ))}
          </ul>
        </section>

        <aside className="space-y-6 lg:sticky lg:top-24">
          <section className="card p-5 sm:p-6" aria-labelledby="signup">
            <h2 id="signup" className="flex items-center gap-2 text-lg font-semibold">
              <HeartHandshake className="size-5 text-primary-600" aria-hidden /> Sign up to foster
            </h2>
            {userId ? (
              <FosterForm shelters={recruiting.map((r) => ({ id: r.shelter.id, name: r.shelter.name }))} defaultShelterId={preselect} />
            ) : (
              <div className="mt-3">
                <p className="text-sm text-slate-600 dark:text-slate-400">Create a free account so shelters can review your sign-up and contact you.</p>
                <Link href={`/login?next=${encodeURIComponent(`/foster${sp.shelter ? `?shelter=${sp.shelter}` : ""}`)}`} className="btn btn-primary mt-4 w-full">
                  Log in to sign up
                </Link>
              </div>
            )}
          </section>
          {mine.length > 0 && (
            <section className="card p-5" aria-labelledby="mine">
              <h2 id="mine" className="font-semibold">
                Your foster sign-ups
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                {mine.map(({ app, shelter }) => (
                  <li key={app.id} className="flex items-center justify-between gap-2">
                    <span className="min-w-0">
                      <Link href={`/shelters/${shelter.slug}`} className="link block truncate">
                        {shelter.name}
                      </Link>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {app.duration} &middot; {shortDate(app.createdAt)}
                      </span>
                    </span>
                    <Badge tone={app.status === "approved" ? "success" : "warning"} className="capitalize">
                      {app.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
