import { Star } from "lucide-react";
import { initials, timeAgo } from "@/lib/utils";

type Row = { review: { id: number; rating: number; body: string; createdAt: Date }; author: { id: number; name: string } };

export function ReviewList({ reviews }: { reviews: Row[] }) {
  if (!reviews.length) return <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No reviews yet. Be the first to share your experience.</p>;
  return (
    <ul className="mt-4 space-y-3">
      {reviews.map(({ review, author }) => (
        <li key={review.id} className="card p-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-800 dark:bg-primary-900 dark:text-primary-100">
              {initials(author.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{author.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{timeAgo(review.createdAt)}</p>
            </div>
            <span className="flex" aria-label={`${review.rating} out of 5 stars`}>
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={i < review.rating ? "size-4 fill-amber-400 text-amber-400" : "size-4 text-slate-300 dark:text-slate-600"}
                  aria-hidden
                />
              ))}
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{review.body}</p>
        </li>
      ))}
    </ul>
  );
}
