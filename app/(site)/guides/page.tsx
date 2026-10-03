import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Badge, PageHeader } from "@/components/ui";
import { GUIDES } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Care guides",
  description: "Practical guides for new pet owners and people who are struggling to keep their pets.",
};

export default function GuidesPage() {
  const [featured, ...rest] = GUIDES;
  return (
    <div className="container-page max-w-5xl pb-10">
      <PageHeader eyebrow="Learn" title="Care guides" description="Short, practical advice for new pet parents, plus help for anyone thinking about giving up a pet." />
      <Link href={`/guides/${featured.slug}`} className="card group mb-6 block border-primary-200 bg-primary-50 p-6 transition hover:border-primary-400 sm:p-8 dark:border-primary-900 dark:bg-primary-950/50">
        <Badge tone="accent">{featured.category}</Badge>
        <h2 className="mt-3 text-2xl font-bold">{featured.title}</h2>
        <p className="mt-2 max-w-2xl text-slate-700 dark:text-slate-300">{featured.summary}</p>
        <span className="mt-4 inline-flex items-center gap-1 font-semibold text-primary-700 dark:text-primary-300">
          Read the guide <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden />
        </span>
      </Link>
      <ul className="grid gap-4 sm:grid-cols-2">
        {rest.map((g) => (
          <li key={g.slug}>
            <Link href={`/guides/${g.slug}`} className="card group flex h-full flex-col p-5 transition hover:border-primary-300 dark:hover:border-primary-700">
              <div className="flex items-center justify-between gap-2">
                <Badge tone="primary">{g.category}</Badge>
                <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <Clock className="size-3.5" aria-hidden /> {g.minutes} min read
                </span>
              </div>
              <h2 className="mt-3 text-lg font-semibold group-hover:text-primary-700 dark:group-hover:text-primary-300">{g.title}</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{g.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
