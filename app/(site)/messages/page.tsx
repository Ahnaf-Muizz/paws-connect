import type { Metadata } from "next";
import { MessagesSquare } from "lucide-react";
import { ConversationList } from "@/components/messages/conversation-list";
import { EmptyState, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { listConversations } from "@/lib/messages";

export const metadata: Metadata = { title: "Messages", robots: { index: false } };

export default async function MessagesPage() {
  const user = await requireUser("/messages");
  const conversations = await listConversations(user.id);
  return (
    <div className="container-page max-w-5xl pb-10">
      <PageHeader title="Messages" description="Chat with owners and adopters. Keep personal details private until you've met safely." />
      {conversations.length === 0 ? (
        <EmptyState
          icon={<MessagesSquare className="size-10" />}
          title="No conversations yet"
          description="Open any pet listed by an owner and choose “Message the owner” to start a conversation."
          action={{ href: "/pets?source=owner", label: "Browse owner listings" }}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="card overflow-hidden">
            <ConversationList items={conversations} userId={user.id} />
          </div>
          <div className="card hidden flex-col items-center justify-center p-10 text-center text-slate-500 lg:flex dark:text-slate-400">
            <MessagesSquare className="size-10 text-primary-400" aria-hidden />
            <p className="mt-3">Select a conversation to read and reply.</p>
          </div>
        </div>
      )}
    </div>
  );
}
