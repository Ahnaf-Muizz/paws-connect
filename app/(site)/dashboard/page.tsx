import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, CalendarClock, CheckCircle2, ClipboardList, Heart, Inbox, MessageCircle, PawPrint, Plus, Receipt, Settings2, Sparkles } from "lucide-react";
import { ApplicationButtons, AutoRefresh, DeletePetButton, PetStatusSelect } from "@/components/dashboard/dashboard-actions";
import { ScreeningSteps } from "@/components/dashboard/screening-steps";
import { PetImage } from "@/components/pets/pet-image";
import { Badge } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { APPOINTMENT_KIND_META } from "@/lib/appointments";
import { getOwner, getProfile, listAppointmentsForUser, listMyApplications, listOrders, listReceivedApplications } from "@/lib/queries";
import { APPLICATION_KIND_META } from "@/lib/validators";
import type { ScreeningState } from "@/lib/screening";
import { eventDate, eventTime, money, shortDate, timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

function StatusBadge({ s }: { s: ScreeningState }) {
  const tone = s.status === "approved" ? "success" : s.status === "declined" || s.status === "withdrawn" ? "neutral" : s.complete ? "primary" : "warning";
  return <Badge tone={tone}>{s.label}</Badge>;
}

function SectionTitle({ id, icon: Icon, title, count, action }: { id: string; icon: typeof Inbox; title: string; count?: number; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 id={id} className="flex items-center gap-2 text-xl font-semibold">
        <Icon className="size-5 text-primary-600 dark:text-primary-400" aria-hidden /> {title}
        {count !== undefined && <span className="text-base font-normal text-slate-500">({count})</span>}
      </h2>
      {action}
    </div>
  );
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ applied?: string; booked?: string }> }) {
  const user = await requireUser("/dashboard");
  const [sp, mine, received, owner, orders, profile, visits] = await Promise.all([
    searchParams,
    listMyApplications(user.id),
    listReceivedApplications(user.id),
    getOwner(user.id),
    listOrders(user.id),
    getProfile(user.id),
    listAppointmentsForUser(user.id),
  ]);
  const myPets = owner?.pets ?? [];
  const screeningActive = [...mine, ...received].some((a) => !a.screening.complete && (a.screening.status === "submitted" || a.screening.status === "screening"));
  const openReceived = received.filter((r) => r.screening.status === "submitted" || r.screening.status === "screening");

  return (
    <div className="container-page pb-10">
      <AutoRefresh active={screeningActive} />
      <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-end sm:justify-between sm:py-10">
        <div>
          <p className="text-sm font-semibold tracking-wide text-primary-600 uppercase dark:text-primary-400">Dashboard</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold sm:text-4xl">
            Hi, {user.name.split(" ")[0]}
            {user.verified && <BadgeCheck className="size-6 text-primary-600 dark:text-primary-400" aria-label="Verified" />}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/rehome" className="btn btn-primary">
            <Plus className="size-4" aria-hidden /> Post a pet
          </Link>
          <Link href="/profile" className="btn btn-outline">
            <Settings2 className="size-4" aria-hidden /> Adopter profile
          </Link>
        </div>
      </div>

      {sp.booked && (
        <div role="status" className="mb-6 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
          <CalendarClock className="size-6 shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">Appointment booked</p>
            <p className="text-sm">The owner can see the visit on their dashboard. Times are simulated for this demo.</p>
          </div>
        </div>
      )}

      {sp.applied && (
        <div role="status" className="mb-6 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
          <CheckCircle2 className="size-6 shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">Application submitted!</p>
            <p className="text-sm">Screening has started. You&apos;ll see each step complete below, and the owner will be able to approve once it finishes.</p>
          </div>
        </div>
      )}

      {!profile && (
        <Link href="/profile" className="card mb-6 flex items-center gap-4 border-primary-300 p-4 transition hover:bg-primary-50 dark:border-primary-800 dark:hover:bg-primary-950/50">
          <Sparkles className="size-8 shrink-0 text-primary-600" aria-hidden />
          <span>
            <span className="block font-semibold">Complete your adopter profile</span>
            <span className="text-sm text-slate-600 dark:text-slate-400">Takes 2 minutes and unlocks personalized match scores.</span>
          </span>
        </Link>
      )}

      <ul className="mb-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { href: "/matches", icon: Sparkles, label: "Matches" },
          { href: "/favorites", icon: Heart, label: "Favorites" },
          { href: "/messages", icon: MessageCircle, label: "Messages" },
          { href: "/orders", icon: Receipt, label: "Orders" },
        ].map(({ href, icon: Icon, label }) => (
          <li key={href}>
            <Link href={href} className="card flex min-h-16 items-center gap-3 p-4 font-medium transition hover:border-primary-300 dark:hover:border-primary-700">
              <Icon className="size-5 text-primary-600 dark:text-primary-400" aria-hidden /> {label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="grid gap-10 xl:grid-cols-2">
        <section aria-labelledby="received" className="scroll-mt-24" id="received-section">
          <SectionTitle id="received" icon={Inbox} title="Applications for your pets" count={openReceived.length} />
          {received.length === 0 ? (
            <p className="card p-6 text-sm text-slate-600 dark:text-slate-400">
              When families apply for pets you&apos;ve posted, you&apos;ll review them here.
            </p>
          ) : (
            <ul className="space-y-3">
              {received.map(({ application, pet, applicant, screening }) => (
                <li key={application.id} className="card p-4">
                  <div className="flex gap-3">
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                      <PetImage src={pet.photos[0]} alt={pet.name} species={pet.species} sizes="56px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">
                        <span className="inline-flex items-center gap-1">
                          {applicant.name}
                          {applicant.verified && <BadgeCheck className="size-4 text-primary-600" aria-label="Verified" />}
                        </span>{" "}
                        <span className="font-normal text-slate-500">wants to adopt</span>{" "}
                        <Link href={`/pets/${pet.id}`} className="link">
                          {pet.name}
                        </Link>
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {applicant.city} &middot; {timeAgo(application.createdAt)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <StatusBadge s={screening} />
                        <Badge tone="neutral">{APPLICATION_KIND_META[application.kind]?.label ?? application.kind}</Badge>
                        {application.duration && <Badge tone="neutral">{application.duration}</Badge>}
                        {application.matchScore !== null && <Badge tone="primary">{application.matchScore}% match</Badge>}
                      </div>
                    </div>
                  </div>
                  <blockquote className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    {application.message}
                  </blockquote>
                  <ScreeningSteps state={screening} />
                  {(screening.status === "submitted" || screening.status === "screening") && (
                    <div className="mt-3">
                      <ApplicationButtons id={application.id} role="owner" canApprove={screening.complete} petName={pet.name} applicantName={applicant.name} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="mine">
          <SectionTitle id="mine" icon={ClipboardList} title="Your applications" count={mine.length} />
          {mine.length === 0 ? (
            <p className="card p-6 text-sm text-slate-600 dark:text-slate-400">
              You haven&apos;t applied for a pet yet.{" "}
              <Link href="/matches" className="link">
                See your matches
              </Link>
              .
            </p>
          ) : (
            <ul className="space-y-3">
              {mine.map(({ application, pet, screening }) => (
                <li key={application.id} className="card p-4">
                  <div className="flex gap-3">
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                      <PetImage src={pet.photos[0]} alt={pet.name} species={pet.species} sizes="56px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link href={`/pets/${pet.id}`} className="font-semibold hover:underline">
                        {pet.name}
                      </Link>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {pet.breed} &middot; applied {shortDate(application.createdAt)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <StatusBadge s={screening} />
                        <Badge tone="neutral">{APPLICATION_KIND_META[application.kind]?.label ?? application.kind}</Badge>
                        {application.duration && <Badge tone="neutral">{application.duration}</Badge>}
                      </div>
                    </div>
                  </div>
                  <ScreeningSteps state={screening} />
                  {application.decisionNote && <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Note: {application.decisionNote}</p>}
                  {screening.status === "approved" && (
                    <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
                      Congratulations! Message the owner to plan a meet-and-greet and handoff.{" "}
                      <Link href="/resources?tab=insurance" className="font-semibold underline">
                        Get {pet.name} insured
                      </Link>
                    </p>
                  )}
                  {(screening.status === "submitted" || screening.status === "screening") && (
                    <div className="mt-2">
                      <ApplicationButtons id={application.id} role="applicant" petName={pet.name} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="my-pets">
          <SectionTitle
            id="my-pets"
            icon={PawPrint}
            title="Your listings"
            count={myPets.length}
            action={
              <Link href="/rehome" className="link text-sm">
                Add a pet
              </Link>
            }
          />
          {myPets.length === 0 ? (
            <p className="card p-6 text-sm text-slate-600 dark:text-slate-400">
              Need to rehome a pet?{" "}
              <Link href="/rehome" className="link">
                Post a profile
              </Link>{" "}
              and screened families will apply.
            </p>
          ) : (
            <ul className="space-y-3">
              {myPets.map((pet) => (
                <li key={pet.id} className="card flex flex-wrap items-center gap-3 p-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                    <PetImage src={pet.photos[0]} alt={pet.name} species={pet.species} sizes="56px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/pets/${pet.id}`} className="font-semibold hover:underline">
                      {pet.name}
                    </Link>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {pet.breed} &middot; posted {shortDate(pet.createdAt)}
                    </p>
                  </div>
                  <div className="flex w-full items-center gap-1 sm:w-auto">
                    <PetStatusSelect id={pet.id} status={pet.status} name={pet.name} />
                    <Link href={`/rehome?edit=${pet.id}`} className="btn btn-ghost min-h-10 px-3 text-sm">
                      Edit
                    </Link>
                    <DeletePetButton id={pet.id} name={pet.name} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="visits">
          <SectionTitle id="visits" icon={CalendarClock} title="Appointments" count={visits.length} />
          {visits.length === 0 ? (
            <p className="card p-6 text-sm text-slate-600 dark:text-slate-400">
              Book a meet-and-greet from any available pet page.
            </p>
          ) : (
            <ul className="space-y-3">
              {visits.map(({ appointment, pet, requester }) => (
                <li key={appointment.id} className="card flex gap-3 p-4">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                    <PetImage src={pet.photos[0]} alt={pet.name} species={pet.species} sizes="56px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {APPOINTMENT_KIND_META[appointment.kind].label} with{" "}
                      <Link href={`/pets/${pet.id}`} className="link">
                        {pet.name}
                      </Link>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {eventDate(appointment.scheduledAt)} · {eventTime(appointment.scheduledAt)}
                      {appointment.requesterId !== user.id ? ` · ${requester.name}` : ""}
                    </p>
                    <div className="mt-2">
                      <Badge tone={appointment.status === "confirmed" ? "success" : appointment.status === "cancelled" ? "neutral" : "warning"}>
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="orders">
          <SectionTitle
            id="orders"
            icon={Receipt}
            title="Recent orders"
            count={orders.length}
            action={
              orders.length > 0 && (
                <Link href="/orders" className="link text-sm">
                  View all
                </Link>
              )
            }
          />
          {orders.length === 0 ? (
            <p className="card p-6 text-sm text-slate-600 dark:text-slate-400">
              Shop insurance, food, and care in{" "}
              <Link href="/resources" className="link">
                Resources
              </Link>
              .
            </p>
          ) : (
            <ul className="card divide-y divide-slate-100 dark:divide-slate-800">
              {orders.slice(0, 5).map((o) => (
                <li key={o.id}>
                  <Link href={`/orders/${o.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-900">
                    <span>
                      <span className="block font-medium">{o.kind === "donation" ? "Donation" : "Order"} {o.confirmation}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{shortDate(o.createdAt)}</span>
                    </span>
                    <span className="font-semibold">{money(o.totalCents)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
