import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, ShieldCheck } from "lucide-react";
import { ChatThread } from "@/components/messages/chat-thread";
import { ConversationList } from "@/components/messages/conversation-list";
import { PetImage } from "@/components/pets/pet-image";
import { requireUser } from "@/lib/auth";
import { getConversation, listConversations, readMessages } from "@/lib/messages";

export const metadata: Metadata = { title: "Conversation", robots: { index: false } };

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/messages/${id}`);
  const convoId = Number(id);
  if (!Number.isInteger(convoId) || convoId <= 0) notFound();
  const convo = await getConversation(user.id, convoId);
  if (!convo) notFound();
  const [initial, conversations] = await Promise.all([readMessages(user.id, convo.id), listConversations(user.id)]);

  return (
    <div className="container-page max-w-5xl py-3 sm:py-6">
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="card hidden max-h-[calc(100dvh-9rem)] overflow-y-auto lg:block" aria-label="Conversations">
          <ConversationList items={conversations} activeId={convo.id} userId={user.id} />
        </aside>

        <section className="card flex h-[calc(100dvh-var(--tabbar-height)-env(safe-area-inset-bottom)-7rem)] min-h-96 flex-col overflow-hidden lg:h-[calc(100dvh-9rem)]">
          <header className="flex items-center gap-3 border-b border-slate-100 p-3 sm:p-4 dark:border-slate-800">
            <Link href="/messages" className="btn btn-ghost min-h-10 px-2 lg:hidden" aria-label="Back to messages">
              <ArrowLeft className="size-5" aria-hidden />
            </Link>
            {convo.pet && (
              <Link href={`/pets/${convo.pet.id}`} className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                <PetImage src={convo.pet.photos[0]} alt={convo.pet.name} species={convo.pet.species} sizes="44px" />
              </Link>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="flex items-center gap-1 truncate text-base font-semibold">
                <span className="truncate">{convo.other.name}</span>
                {convo.other.verified && <BadgeCheck className="size-4 shrink-0 text-primary-600" aria-label="Verified" />}
              </h1>
              {convo.pet ? (
                <Link href={`/pets/${convo.pet.id}`} className="link block truncate text-xs">
                  About {convo.pet.name}
                  {convo.pet.status !== "available" ? ` (${convo.pet.status})` : ""}
                </Link>
              ) : (
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{convo.other.city}</p>
              )}
            </div>
          </header>
          <p className="flex items-center gap-2 bg-primary-50/70 px-4 py-2 text-xs text-primary-900 dark:bg-primary-950/50 dark:text-primary-200">
            <ShieldCheck className="size-4 shrink-0" aria-hidden />
            Meet in a public place and never send payment before meeting the pet.
          </p>
          <ChatThread conversationId={convo.id} userId={user.id} otherName={convo.other.name} initial={initial} />
        </section>
      </div>
    </div>
  );
}
