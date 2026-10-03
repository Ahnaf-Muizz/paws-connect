import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LifeBuoy } from "lucide-react";
import { PetForm } from "@/components/pets/pet-form";
import { PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getPet } from "@/lib/queries";
import { blobEnabled } from "@/lib/uploads";

export const metadata: Metadata = { title: "Rehome your pet", robots: { index: false } };

export default async function RehomePage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  const user = await requireUser(edit ? `/rehome?edit=${edit}` : "/rehome");
  let pet = null;
  if (edit) {
    const data = await getPet(Number(edit));
    if (!data || data.pet.ownerId !== user.id) notFound();
    pet = data.pet;
  }

  return (
    <div className="container-page max-w-3xl pb-10">
      <PageHeader
        eyebrow={pet ? "Edit listing" : "Rehome"}
        title={pet ? `Edit ${pet.name}'s profile` : "Find your pet a safe new home"}
        description={
          pet
            ? "Keep your listing up to date so families know what to expect."
            : "Post a profile and screened families will apply. You review every applicant and make the final call. Your pet stays with you until the match is made, never in a shelter."
        }
      />
      {!pet && (
        <aside className="mb-6 flex gap-3 rounded-2xl border border-primary-200 bg-primary-50 p-4 text-sm dark:border-primary-900 dark:bg-primary-950/50">
          <LifeBuoy className="size-5 shrink-0 text-primary-700 dark:text-primary-300" aria-hidden />
          <p className="text-slate-700 dark:text-slate-300">
            Want to keep your pet but struggling with costs, behavior, or housing?{" "}
            <Link href="/guides/cant-keep-my-pet" className="link">
              See resources that might help first
            </Link>
            .
          </p>
        </aside>
      )}
      <PetForm initial={pet} defaultCity={user.city} blobEnabled={blobEnabled()} />
    </div>
  );
}
