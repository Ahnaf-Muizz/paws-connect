import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Badge, PageHeader } from "@/components/ui";
import { NONPROFITS } from "@/lib/nonprofits";

export const metadata: Metadata = {
  title: "Nonprofit pet care organizations",
  description: "Lubbock-area rescues, Texas SPCAs, and national animal welfare nonprofits.",
};

export default function NonprofitsPage() {
  return (
    <div className="container-page pb-10">
      <PageHeader
        eyebrow="Nonprofits"
        title="Nonprofits caring for pets"
        description="These organizations rescue, shelter, and support animals every day. Adopt, volunteer, or donate directly. Links open the organization's own website."
        actions={
          <Link href="/donate" className="btn btn-accent">
            Donate through PAWS
          </Link>
        }
      />

      <nav aria-label="Jump to region" className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {NONPROFITS.map((g) => (
          <a key={g.key} href={`#${g.key}`} className="chip min-h-10 shrink-0 border border-slate-200 bg-white px-4 text-sm dark:border-slate-700 dark:bg-slate-900">
            {g.title}
          </a>
        ))}
      </nav>

      <div className="space-y-12">
        {NONPROFITS.map((group) => (
          <section key={group.key} id={group.key} aria-labelledby={`${group.key}-title`} className="scroll-mt-24">
            <h2 id={`${group.key}-title`} className="text-2xl font-bold">
              {group.title}
            </h2>
            <p className="mt-1 text-slate-600 dark:text-slate-400">{group.blurb}</p>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.orgs.map((org) => (
                <li key={org.url}>
                  <a
                    href={org.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card group flex h-full flex-col p-5 transition hover:border-primary-300 dark:hover:border-primary-700"
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="text-lg leading-snug font-semibold text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                        {org.name}
                      </span>
                      <ExternalLink className="mt-1 size-4 shrink-0 text-slate-400" aria-hidden />
                    </span>
                    <span className="mt-2 text-sm text-slate-600 dark:text-slate-400">{org.description}</span>
                    <span className="mt-auto flex flex-wrap gap-1.5 pt-4">
                      {org.focus.map((f) => (
                        <Badge key={f} tone="primary">
                          {f}
                        </Badge>
                      ))}
                    </span>
                    <span className="mt-3 truncate text-xs text-slate-500 dark:text-slate-400">
                      {org.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-12 text-sm text-slate-500 dark:text-slate-400">
        PAWS Connect is not affiliated with these organizations. Know a local rescue we&apos;re missing? Message us from your dashboard.
      </p>
    </div>
  );
}
