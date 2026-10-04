import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CalendarClock } from "lucide-react";
import { AppointmentForm } from "@/components/pets/appointment-form";
import { PetImage } from "@/components/pets/pet-image";
import { requireUser } from "@/lib/auth";
import { upcomingSlots } from "@/lib/appointments";
import { formatAge } from "@/lib/pets";
import { getPet } from "@/lib/queries";

export const metadata: Metadata = { title: "Set up an appointment", robots: { index: false } };

export default async function AppointmentPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const user = await requireUser(`/pets/${id}/appointment`);
  const data = await getPet(id);
  if (!data) notFound();
  const { pet, owner, shelter } = data;
  if (pet.ownerId === user.id) redirect(`/pets/${id}`);
  if (pet.status !== "available") redirect(`/pets/${id}`);

  const slots = upcomingSlots().map((d) => d.toISOString());

  return (
    <div className="container-page max-w-3xl pb-10">
      <Link href={`/pets/${pet.id}`} className="link mt-6 inline-flex items-center gap-1 text-sm">
        <ArrowLeft className="size-4" aria-hidden /> Back to {pet.name}
      </Link>
      <h1 className="mt-4 flex items-center gap-2 text-2xl font-bold sm:text-3xl">
        <CalendarClock className="size-7 text-primary-600 dark:text-primary-400" aria-hidden />
        Set up an appointment
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Pick a meet-and-greet, video visit, or home visit with {owner ? owner.name : shelter?.name}. This is a simulated
        booking so you can see the flow.
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

      <AppointmentForm petId={pet.id} petName={pet.name} slots={slots} />
    </div>
  );
}
