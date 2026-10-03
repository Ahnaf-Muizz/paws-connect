import type { Metadata } from "next";
import Link from "next/link";
import { Settings2, Sparkles } from "lucide-react";
import { MatchDeck } from "@/components/matches/match-deck";
import { EmptyState, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getMatches } from "@/lib/queries";

export const metadata: Metadata = { title: "My matches", robots: { index: false } };

export default async function MatchesPage() {
  const user = await requireUser("/matches");
  const { profile, matches } = await getMatches(user.id, { includeReacted: true });

  if (!profile) {
    return (
      <div className="container-page max-w-2xl py-10">
        <EmptyState
          icon={<Sparkles className="size-10" />}
          title="Let's find your match"
          description="Answer a few questions about your home and lifestyle, and we'll rank every pet by how well they fit."
          action={{ href: "/profile", label: "Build my adopter profile" }}
        />
      </div>
    );
  }

  const toItem = (m: (typeof matches)[number]) => ({ pet: m.pet, owner: m.owner, shelter: m.shelter, match: m.match });
  const fresh = matches.filter((m) => !m.reaction).map(toItem);
  const liked = matches.filter((m) => m.reaction === "like").map(toItem);
  const passed = matches.filter((m) => m.reaction === "pass").map(toItem);

  return (
    <div className="container-page pb-10">
      <PageHeader
        className="py-4 sm:py-10"
        title="Pets matched to your life"
        description={<span className="hidden sm:inline">Ranked by your adopter profile. Like a pet to save it, pass to see the next one.</span>}
        actions={
          <Link href="/profile" className="btn btn-outline hidden md:inline-flex">
            <Settings2 className="size-4" aria-hidden /> Edit preferences
          </Link>
        }
      />
      <MatchDeck initialQueue={fresh} initialLiked={liked} initialPassed={passed} />
    </div>
  );
}
