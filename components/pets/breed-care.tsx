import Link from "next/link";
import { ArrowRight, BookOpen, HeartPulse } from "lucide-react";
import { careForPet } from "@/lib/breed-care";
import type { AgeGroup, Level, Size, Species } from "@/lib/db/schema";

export function BreedCare({
  name,
  breed,
  species,
  size,
  energy,
  ageGroup,
  needsYard,
  goodWithKids,
}: {
  name: string;
  breed: string;
  species: Species;
  size: Size;
  energy: Level;
  ageGroup: AgeGroup;
  needsYard: boolean;
  goodWithKids: boolean;
}) {
  const care = careForPet({ name, breed, species, size, energy, ageGroup, needsYard, goodWithKids });

  return (
    <section className="mt-8" aria-labelledby="care">
      <h2 id="care" className="flex items-center gap-2 text-xl font-semibold">
        <HeartPulse className="size-5 text-primary-600 dark:text-primary-400" aria-hidden />
        {care.headline}
      </h2>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{care.summary}</p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {care.tips.map((tip) => (
          <li key={tip.title} className="card p-4">
            <p className="font-semibold text-slate-900 dark:text-white">{tip.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{tip.body}</p>
          </li>
        ))}
      </ul>
      <div className="mt-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <BookOpen className="size-4 text-primary-600 dark:text-primary-400" aria-hidden />
          Keep reading
        </p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {care.guides.map((g) => (
            <li key={g.slug}>
              <Link href={`/guides/${g.slug}`} className="btn btn-outline min-h-10 text-sm">
                {g.title} <ArrowRight className="size-4" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
