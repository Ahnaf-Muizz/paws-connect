"use client";

import { useCallback, useState } from "react";
import { BottomSheet } from "@/components/bottom-sheet";
import { ReviewForm } from "@/components/review-form";
import { Stars } from "@/components/ui";
import { initials, timeAgo } from "@/lib/utils";

type Row = { review: { id: number; rating: number; body: string; createdAt: string }; author: { name: string } };

export function ProductReviews({ productId, productName, rating, count }: { productId: number; productName: string; rating: number; count: number }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Row[] | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/reviews?type=product&id=${productId}`, { cache: "no-store" });
    if (res.ok) setRows((await res.json()).reviews);
  }, [productId]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          load();
        }}
        className="rounded-md text-left hover:underline"
        aria-label={`Read reviews for ${productName}`}
      >
        <Stars rating={rating} count={count} />
      </button>
      <BottomSheet open={open} onClose={() => setOpen(false)} title={`Reviews: ${productName}`}>
        <ReviewForm targetType="product" targetId={productId} onDone={load} />
        {rows === null ? (
          <p className="mt-4 text-sm text-slate-500">Loading reviews...</p>
        ) : rows.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No reviews yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {rows.map(({ review, author }) => (
              <li key={review.id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                <div className="flex items-center gap-2 text-sm">
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-800 dark:bg-primary-900 dark:text-primary-100">
                    {initials(author.name)}
                  </span>
                  <span className="font-medium">{author.name}</span>
                  <span className="text-amber-500" aria-label={`${review.rating} out of 5`}>
                    {"★".repeat(review.rating)}
                    <span className="text-slate-300 dark:text-slate-600">{"★".repeat(5 - review.rating)}</span>
                  </span>
                  <span className="ml-auto text-xs text-slate-500">{timeAgo(review.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{review.body}</p>
              </li>
            ))}
          </ul>
        )}
      </BottomSheet>
    </>
  );
}
