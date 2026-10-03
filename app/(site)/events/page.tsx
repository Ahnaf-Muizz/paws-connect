import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus, Clock, MapPin } from "lucide-react";
import { RsvpButton } from "@/components/rsvp-button";
import { Badge, EmptyState, PageHeader } from "@/components/ui";
import { getSessionUserId } from "@/lib/auth";
import { listEvents } from "@/lib/queries";
import { eventTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Events",
  description: "Adoption days, low-cost vaccine clinics, fundraisers, and training classes around Lubbock.",
};

const KIND_TONE = { adoption: "primary", clinic: "success", fundraiser: "accent", training: "neutral" } as const;
const KIND_LABEL = { adoption: "Adoption event", clinic: "Clinic", fundraiser: "Fundraiser", training: "Training" };

const tz = { timeZone: "America/Chicago" } as const;
const monthKey = (d: Date) => d.toLocaleDateString("en-US", { month: "long", year: "numeric", ...tz });

export default async function EventsPage() {
  const userId = await getSessionUserId();
  const events = await listEvents(userId);
  const groups = new Map<string, typeof events>();
  for (const e of events) {
    const key = monthKey(e.event.startsAt);
    groups.set(key, [...(groups.get(key) ?? []), e]);
  }

  return (
    <div className="container-page max-w-4xl pb-10">
      <PageHeader
        eyebrow="Community"
        title="Upcoming events"
        description="Meet adoptable pets in person, get low-cost vaccines, and support local shelters."
      />
      {events.length === 0 ? (
        <EmptyState title="No upcoming events" description="Check back soon. Shelters post new adoption days every month." />
      ) : (
        <div className="space-y-10">
          {[...groups].map(([month, items]) => (
            <section key={month} aria-labelledby={`m-${month.replace(/\s+/g, "-")}`}>
              <h2 id={`m-${month.replace(/\s+/g, "-")}`} className="mb-4 text-lg font-semibold text-slate-500 dark:text-slate-400">
                {month}
              </h2>
              <ul className="space-y-4">
                {items.map(({ event: e, shelter, going, attending }) => (
                  <li key={e.id} id={`event-${e.id}`} className="card flex scroll-mt-24 gap-4 p-4 target:ring-2 target:ring-primary-500 sm:gap-5 sm:p-5">
                    <div className="flex w-16 shrink-0 flex-col items-center justify-center self-start rounded-xl bg-primary-50 py-2 text-primary-800 sm:w-20 dark:bg-primary-950 dark:text-primary-200">
                      <span className="text-xs font-semibold uppercase">{e.startsAt.toLocaleDateString("en-US", { weekday: "short", ...tz })}</span>
                      <span className="font-display text-2xl leading-tight font-bold sm:text-3xl">{e.startsAt.toLocaleDateString("en-US", { day: "numeric", ...tz })}</span>
                      <span className="text-xs font-medium">{e.startsAt.toLocaleDateString("en-US", { month: "short", ...tz })}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <Badge tone={KIND_TONE[e.kind]}>{KIND_LABEL[e.kind]}</Badge>
                      <h3 className="mt-2 text-lg font-semibold">{e.title}</h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{e.description}</p>
                      <dl className="mt-3 space-y-1 text-sm">
                        <div className="flex gap-2">
                          <dt>
                            <Clock className="size-4 text-slate-400" aria-label="Time" />
                          </dt>
                          <dd>
                            {eventTime(e.startsAt)} &ndash; {eventTime(e.endsAt)}
                          </dd>
                        </div>
                        <div className="flex gap-2">
                          <dt>
                            <MapPin className="size-4 text-slate-400" aria-label="Location" />
                          </dt>
                          <dd>
                            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.address)}`} target="_blank" rel="noopener noreferrer" className="link">
                              {e.location}
                            </a>
                            <span className="block text-slate-500 dark:text-slate-400">{e.address}</span>
                          </dd>
                        </div>
                      </dl>
                      {shelter && (
                        <p className="mt-2 text-sm">
                          Hosted by{" "}
                          <Link href={`/shelters/${shelter.slug}`} className="link">
                            {shelter.name}
                          </Link>
                        </p>
                      )}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <RsvpButton eventId={e.id} loggedIn={!!userId} initialAttending={attending} initialGoing={going} />
                        <a href={`/api/events/${e.id}/ics`} className="btn btn-ghost min-h-10 px-3 text-sm" download>
                          <CalendarPlus className="size-4" aria-hidden /> Add to calendar
                        </a>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
