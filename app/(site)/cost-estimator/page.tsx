import type { Metadata } from "next";
import { CostEstimator } from "@/components/cost-estimator";
import { PageHeader } from "@/components/ui";
import type { AgeGroup, Size, Species } from "@/lib/db/schema";
import { AGES, SIZES, SPECIES } from "@/lib/validators";

export const metadata: Metadata = {
  title: "Pet cost estimator",
  description: "Estimate the monthly and first-year cost of a dog, cat, rabbit, or bird before you adopt.",
};

const pick = <T extends string>(list: readonly T[], v: string | undefined, fallback: T) => (list.includes(v as T) ? (v as T) : fallback);

export default async function CostEstimatorPage({ searchParams }: { searchParams: Promise<{ species?: string; size?: string; age?: string }> }) {
  const sp = await searchParams;
  return (
    <div className="container-page max-w-5xl pb-10">
      <PageHeader
        eyebrow="Plan ahead"
        title="What will a pet really cost?"
        description="Being ready for the costs is the best way to avoid having to give a pet up later. Adjust the options to fit your situation."
      />
      <CostEstimator
        initialSpecies={pick<Species>(SPECIES, sp.species, "dog")}
        initialSize={pick<Size>(SIZES, sp.size, "medium")}
        initialAge={pick<AgeGroup>(AGES, sp.age, "adult")}
      />
    </div>
  );
}
