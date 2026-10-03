"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, MessageCircle, Pencil, Sparkles } from "lucide-react";
import { useSession } from "@/components/providers/session-provider";
import { matchLabel, type MatchResult } from "@/lib/matching";
import { cn } from "@/lib/utils";

type MatchInfo = {
  user: boolean;
  isOwner?: boolean;
  match?: MatchResult | null;
  application?: { id: number; label: string; status: string } | null;
};

export function useMatchInfo(petId: number) {
  const { user } = useSession();
  const [info, setInfo] = useState<MatchInfo | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/pets/${petId}/match`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => !cancelled && setInfo(d));
    return () => {
      cancelled = true;
    };
  }, [petId, user?.id]);
  return info;
}

export function PetActions({
  petId,
  petName,
  available,
  contactUserId,
}: {
  petId: number;
  petName: string;
  available: boolean;
  contactUserId: number | null;
}) {
  const info = useMatchInfo(petId);
  const router = useRouter();
  const [starting, setStarting] = useState(false);

  async function message() {
    if (!info?.user) return router.push(`/login?next=/pets/${petId}`);
    setStarting(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId: contactUserId, petId }),
    });
    const data = await res.json();
    setStarting(false);
    if (res.ok) router.push(`/messages/${data.conversationId}`);
  }

  if (info?.isOwner) {
    return (
      <div className="space-y-3">
        <p className="rounded-xl bg-primary-50 p-3 text-sm text-primary-900 dark:bg-primary-950 dark:text-primary-100">
          This is your listing. Review applications from screened families on your dashboard.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/dashboard#received" className="btn btn-primary">
            Applications
          </Link>
          <Link href={`/rehome?edit=${petId}`} className="btn btn-outline">
            <Pencil className="size-4" aria-hidden /> Edit
          </Link>
        </div>
      </div>
    );
  }

  const match = info?.match;
  return (
    <div className="space-y-4">
      {info === null ? (
        <div className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
      ) : !info.user ? (
        <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <Link href={`/login?next=/pets/${petId}`} className="link">
            Log in
          </Link>{" "}
          to see how well {petName} matches your lifestyle.
        </p>
      ) : !match ? (
        <p className="rounded-xl bg-accent-50 p-3 text-sm text-accent-700 dark:bg-accent-700/20 dark:text-accent-200">
          <Link href="/profile" className="font-semibold underline">
            Complete your adopter profile
          </Link>{" "}
          to get a personalized match score.
        </p>
      ) : (
        <MatchSummary match={match} />
      )}

      {info?.application ? (
        <Link href="/dashboard" className="btn btn-outline w-full">
          <CheckCircle2 className="size-4 text-emerald-500" aria-hidden /> Applied: {info.application.label}
        </Link>
      ) : available ? (
        <Link href={`/pets/${petId}/apply`} className="btn btn-primary min-h-12 w-full text-base">
          Apply to adopt {petName}
        </Link>
      ) : (
        <p className="btn btn-outline w-full cursor-default">Not accepting applications</p>
      )}
      {contactUserId && (
        <button type="button" onClick={message} disabled={starting} className="btn btn-outline w-full">
          <MessageCircle className="size-4" aria-hidden /> {starting ? "Opening chat..." : "Message the owner"}
        </button>
      )}
    </div>
  );
}

export function MatchSummary({ match, compact = false }: { match: MatchResult; compact?: boolean }) {
  return (
    <div className="rounded-xl border border-primary-200 bg-primary-50/60 p-4 dark:border-primary-900 dark:bg-primary-950/50">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-14 shrink-0 items-center justify-center rounded-full font-display text-lg font-bold",
            match.score >= 70 ? "bg-primary-600 text-white" : "bg-white text-primary-800 ring-1 ring-primary-300 dark:bg-slate-900 dark:text-primary-200",
          )}
        >
          {match.score}%
        </span>
        <div>
          <p className="flex items-center gap-1 font-semibold text-slate-900 dark:text-white">
            <Sparkles className="size-4 text-primary-600 dark:text-primary-400" aria-hidden /> {matchLabel(match.score)}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">Based on your adopter profile</p>
        </div>
      </div>
      {!compact && (
        <ul className="mt-3 space-y-1.5 text-sm">
          {match.reasons.slice(0, 4).map((r) => (
            <li key={r} className="flex gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden /> {r}
            </li>
          ))}
          {match.concerns.map((c) => (
            <li key={c} className="flex gap-2 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden /> {c}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
