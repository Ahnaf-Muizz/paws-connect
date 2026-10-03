import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { ShareButton } from "@/components/share-button";
import { Badge } from "@/components/ui";
import { GUIDES, getGuide } from "@/lib/guides";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const guide = getGuide((await params).slug);
  return guide ? { title: guide.title, description: guide.summary } : {};
}

const sectionId = (heading: string) => heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();
  const others = GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 3);

  return (
    <div className="container-page pb-10">
      <Link href="/guides" className="link mt-6 inline-flex items-center gap-1 text-sm">
        <ArrowLeft className="size-4" aria-hidden /> All guides
      </Link>
      <div className="mt-4 grid gap-10 lg:grid-cols-[1fr_260px]">
        <article className="max-w-3xl">
          <header>
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="primary">{guide.category}</Badge>
              <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                <Clock className="size-4" aria-hidden /> {guide.minutes} min read
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{guide.title}</h1>
            <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">{guide.summary}</p>
            <ShareButton title={guide.title} label="Share this guide" className="mt-4" />
          </header>
          {guide.sections.map((s) => (
            <section key={s.heading} id={sectionId(s.heading)} className="mt-10 scroll-mt-24" aria-labelledby={`${sectionId(s.heading)}-h`}>
              <h2 id={`${sectionId(s.heading)}-h`} className="text-xl font-semibold sm:text-2xl">
                {s.heading}
              </h2>
              {s.paragraphs?.map((p) => (
                <p key={p} className="mt-3 leading-relaxed">
                  {p}
                </p>
              ))}
              {s.list && (
                <ul className="mt-3 space-y-2">
                  {s.list.map((item) => (
                    <li key={item} className="flex gap-3 leading-relaxed">
                      <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary-500" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              {s.links && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {s.links.map((l) => (
                    <Link key={l.href} href={l.href} className="btn btn-outline min-h-10 text-sm">
                      {l.label} <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  ))}
                </div>
              )}
            </section>
          ))}
        </article>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <nav aria-label="On this page" className="hidden lg:block">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">On this page</p>
            <ul className="mt-2 space-y-1.5 border-l border-slate-200 text-sm dark:border-slate-800">
              {guide.sections.map((s) => (
                <li key={s.heading}>
                  <a href={`#${sectionId(s.heading)}`} className="-ml-px block border-l border-transparent pl-3 text-slate-600 hover:border-primary-500 hover:text-primary-700 dark:text-slate-400 dark:hover:text-primary-300">
                    {s.heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">More guides</p>
            <ul className="mt-2 space-y-2">
              {others.map((g) => (
                <li key={g.slug}>
                  <Link href={`/guides/${g.slug}`} className="link text-sm">
                    {g.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
