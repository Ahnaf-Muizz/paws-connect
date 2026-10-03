import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ExternalLink, MapPin, Phone, Plus, Search } from "lucide-react";
import { ResolveButton } from "@/components/lost-found/resolve-button";
import { PetImage } from "@/components/pets/pet-image";
import { Badge, EmptyState, PageHeader } from "@/components/ui";
import { getSessionUserId } from "@/lib/auth";
import type { Species } from "@/lib/db/schema";
import { listLostFound } from "@/lib/queries";
import { cn, telHref, timeAgo } from "@/lib/utils";
import { SPECIES } from "@/lib/validators";

export const metadata: Metadata = {
  title: "Lost & Found",
  description: "Report a lost or found pet in Lubbock and the South Plains, and search recent sightings.",
};

const KINDS = [
  { value: undefined, label: "All reports" },
  { value: "lost", label: "Lost" },
  { value: "found", label: "Found" },
] as const;

export default async function LostFoundPage({ searchParams }: { searchParams: Promise<{ kind?: string; species?: string }> }) {
  const sp = await searchParams;
  const kind = sp.kind === "lost" || sp.kind === "found" ? sp.kind : undefined;
  const species = SPECIES.includes(sp.species as Species) ? (sp.species as Species) : undefined;
  const [reports, userId] = await Promise.all([listLostFound(kind, species), getSessionUserId()]);
  const href = (k?: string, s?: string) => {
    const q = new URLSearchParams();
    if (k) q.set("kind", k);
    if (s) q.set("species", s);
    const str = q.toString();
    return str ? `/lost-found?${str}` : "/lost-found";
  };

  return (
    <div className="container-page pb-10">
      <PageHeader
        eyebrow="Community"
        title="Lost & Found"
        description="Every hour counts. Post a report with a photo and where the pet was last seen, and check Lubbock Animal Services in person as well."
        actions={
          <Link href="/lost-found/report" className="btn btn-primary">
            <Plus className="size-4" aria-hidden /> Report a pet
          </Link>
        }
      />

      <div className="mb-6 grid gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm sm:grid-cols-[auto_1fr] dark:border-amber-900 dark:bg-amber-950/40">
        <Search className="size-5 text-amber-700 dark:text-amber-300" aria-hidden />
        <div className="text-amber-900 dark:text-amber-100">
          <p className="font-semibold">Lost your pet? Check these too:</p>
          <p className="mt-1">
            <a href="https://www.mylubbock.us/animalservices" target="_blank" rel="noopener noreferrer" className="link">
              Lubbock Animal Services <ExternalLink className="inline size-3" aria-hidden />
            </a>
            {" · "}
            <a href="https://petcolove.org/lost/" target="_blank" rel="noopener noreferrer" className="link">
              Petco Love Lost <ExternalLink className="inline size-3" aria-hidden />
            </a>
            {" · "}
            <a href="https://24petconnect.com/" target="_blank" rel="noopener noreferrer" className="link">
              24Petconnect <ExternalLink className="inline size-3" aria-hidden />
            </a>
          </p>
        </div>
      </div>

      <nav aria-label="Filter reports" className="mb-6 flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <Link
            key={k.label}
            href={href(k.value, species)}
            aria-current={kind === k.value ? "page" : undefined}
            className={cn("chip min-h-9 px-3.5 text-sm", kind === k.value ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300")}
          >
            {k.label}
          </Link>
        ))}
        <span className="mx-1 w-px self-stretch bg-slate-200 dark:bg-slate-800" aria-hidden />
        {SPECIES.map((s) => (
          <Link
            key={s}
            href={href(kind, species === s ? undefined : s)}
            aria-current={species === s ? "page" : undefined}
            className={cn("chip min-h-9 px-3.5 text-sm capitalize", species === s ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300")}
          >
            {s}s
          </Link>
        ))}
      </nav>

      {reports.length === 0 ? (
        <EmptyState title="No open reports match" description="Try a different filter, or post a report so neighbors can help." action={{ href: "/lost-found/report", label: "Report a pet" }} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {reports.map((r) => (
            <li key={r.id} className="card flex flex-col overflow-hidden">
              <div className="relative aspect-4/3 bg-slate-100 dark:bg-slate-800">
                <PetImage src={r.photoUrl} alt={r.petName ? `${r.petName}, ${r.kind} ${r.species}` : `${r.kind} ${r.species}`} species={r.species} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
                <Badge tone={r.kind === "lost" ? "danger" : "success"} className="absolute top-3 left-3 text-sm uppercase">
                  {r.kind}
                </Badge>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h2 className="text-lg font-semibold capitalize">{r.petName ?? `${r.kind === "found" ? "Found" : "Unnamed"} ${r.species}`}</h2>
                <p className="mt-1 line-clamp-3 text-sm text-slate-600 dark:text-slate-400">{r.description}</p>
                <dl className="mt-3 space-y-1.5 text-sm">
                  <div className="flex gap-2">
                    <dt>
                      <MapPin className="size-4 text-slate-400" aria-label="Last seen at" />
                    </dt>
                    <dd>{r.lastSeenLocation}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt>
                      <Clock className="size-4 text-slate-400" aria-label="Last seen" />
                    </dt>
                    <dd>
                      <time dateTime={new Date(r.lastSeenAt).toISOString()}>{timeAgo(r.lastSeenAt)}</time>
                    </dd>
                  </div>
                </dl>
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                  <a href={telHref(r.contactPhone)} className="btn btn-outline min-h-10 flex-1">
                    <Phone className="size-4" aria-hidden /> Call {r.contactName.split(" ")[0]}
                  </a>
                  {userId && r.reporterId === userId && <ResolveButton id={r.id} kind={r.kind} />}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
