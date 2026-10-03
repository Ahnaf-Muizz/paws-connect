import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { MatchSummary } from "@/components/pets/pet-actions";
import { PetImage } from "@/components/pets/pet-image";
import { ApplyForm } from "@/components/pets/apply-form";
import { requireUser } from "@/lib/auth";
import { formatAge } from "@/lib/pets";
import { getPet, getProfile } from "@/lib/queries";
import { scoreMatch } from "@/lib/matching";
import { SCREENING_STEPS } from "@/lib/screening";

export const metadata: Metadata = { title: "Apply to adopt", robots: { index: false } };

export default async function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const user = await requireUser(`/pets/${id}/apply`);
  const data = await getPet(id);
  if (!data) notFound();
  const { pet, owner, shelter } = data;
  if (pet.ownerId === user.id) redirect(`/pets/${id}`);
  const profile = await getProfile(user.id);
  const match = profile ? scoreMatch(profile, pet) : null;

  return (
    <div className="container-page max-w-3xl pb-10">
      <Link href={`/pets/${pet.id}`} className="link mt-6 inline-flex items-center gap-1 text-sm">
        <ArrowLeft className="size-4" aria-hidden /> Back to {pet.name}
      </Link>
      <h1 className="mt-4 text-2xl font-bold sm:text-3xl">Apply to adopt {pet.name}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Your application goes to {owner ? owner.name : shelter?.name}. Every applicant goes through the same quick screening so
        each match is a safe one.
      </p>

      <div className="card mt-6 flex items-center gap-4 p-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
          <PetImage src={pet.photos[0]} alt={pet.name} species={pet.species} sizes="80px" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 dark:text-white">{pet.name}</p>
          <p className="truncate text-sm text-slate-600 capitalize dark:text-slate-400">
            {pet.breed} &middot; {pet.sex} &middot; {formatAge(pet.ageYears)}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{pet.city}</p>
        </div>
      </div>

      <div className="mt-6">
        {match ? (
          <MatchSummary match={match} />
        ) : (
          <p className="rounded-xl bg-accent-50 p-4 text-sm text-accent-700 dark:bg-accent-700/20 dark:text-accent-200">
            You haven&apos;t filled out your adopter profile yet. You can still apply, but owners see a match score when you{" "}
            <Link href={`/profile?next=/pets/${pet.id}/apply`} className="font-semibold underline">
              complete your profile
            </Link>
            .
          </p>
        )}
      </div>

      <section className="mt-6 rounded-2xl bg-slate-50 p-5 dark:bg-slate-900" aria-labelledby="screening">
        <h2 id="screening" className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="size-5 text-primary-600 dark:text-primary-400" aria-hidden /> What happens next
        </h2>
        <ol className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
          {SCREENING_STEPS.map((s, i) => (
            <li key={s.key} className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white">
                {i + 1}
              </span>
              <span>
                <strong className="font-semibold">{s.label}.</strong> {s.detail}
              </span>
            </li>
          ))}
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-500 text-xs font-semibold text-slate-900">
              {SCREENING_STEPS.length + 1}
            </span>
            <span>
              <strong className="font-semibold">Owner decision.</strong> Once screening clears, the owner can approve the match and
              you&apos;ll arrange a meet-and-greet.
            </span>
          </li>
        </ol>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Demo: screening steps complete automatically within a few minutes.</p>
      </section>

      <ApplyForm petId={pet.id} petName={pet.name} available={pet.status === "available"} />
    </div>
  );
}
