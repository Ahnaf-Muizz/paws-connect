"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Star } from "lucide-react";
import { useSession } from "@/components/providers/session-provider";
import { cn } from "@/lib/utils";

export function ReviewForm({ targetType, targetId, onDone }: { targetType: "vet" | "product"; targetId: number; onDone?: () => void }) {
  const { user } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!user) {
    return (
      <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-400">
        <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="link">
          Log in
        </Link>{" "}
        to leave a review.
      </p>
    );
  }
  if (done) return <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">Thanks! Your review is posted.</p>;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) return setError("Choose a star rating.");
    setBusy(true);
    setError(null);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType, targetId, rating, body }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Could not post review.");
    setDone(true);
    onDone?.();
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card space-y-3 p-4">
      <fieldset>
        <legend className="label">Your rating</legend>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              aria-pressed={rating === n}
              className="flex size-10 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Star className={cn("size-6", n <= (hover || rating) ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600")} />
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor={`review-${targetType}-${targetId}`} className="label">
          Your review
        </label>
        <textarea
          id={`review-${targetType}-${targetId}`}
          rows={3}
          minLength={5}
          maxLength={1000}
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="input"
          placeholder="What was your experience like?"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy} className="btn btn-primary">
        {busy ? "Posting..." : "Post review"}
      </button>
    </form>
  );
}
