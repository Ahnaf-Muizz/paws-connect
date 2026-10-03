import type { Metadata } from "next";
import { LostFoundForm } from "@/components/lost-found/lost-found-form";
import { PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { blobEnabled } from "@/lib/uploads";

export const metadata: Metadata = { title: "Report a lost or found pet", robots: { index: false } };

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind } = await searchParams;
  const user = await requireUser("/lost-found/report");
  return (
    <div className="container-page max-w-2xl pb-10">
      <PageHeader eyebrow="Lost & Found" title="Report a pet" description="Clear photos and an exact location help neighbors recognize the pet quickly." />
      <LostFoundForm defaultKind={kind === "found" ? "found" : "lost"} contactName={user.name} contactPhone={user.phone ?? ""} blobEnabled={blobEnabled()} />
    </div>
  );
}
