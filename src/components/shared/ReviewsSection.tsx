"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { RatingStars } from "@/components/ui/RatingStars";
import { Button } from "@/components/ui/Button";
import { formatDate, cn } from "@/lib/utils";
import type { AppReview } from "@/types";

export function ReviewsSection({ reviews }: { reviews: AppReview[] }) {
  const [localReviews, setLocalReviews] = useState(reviews);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [author, setAuthor] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating || !comment.trim()) return;
    const newReview: AppReview = {
      id: `local-${Date.now()}`,
      author: author.trim() || "Anonymous",
      rating,
      comment: comment.trim(),
      date: new Date().toISOString(),
    };
    setLocalReviews([newReview, ...localReviews]);
    setShowForm(false);
    setRating(0);
    setComment("");
    setAuthor("");
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">
          Reviews {localReviews.length > 0 && `(${localReviews.length})`}
        </h2>
        <Button variant="secondary" size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "Write a review"}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 space-y-3 rounded-lg border border-border bg-bg-elevated p-4"
        >
          <div>
            <label className="mb-1.5 block text-xs font-medium text-fg-muted">Your rating</label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setRating(i + 1)}
                  onMouseEnter={() => setHoverRating(i + 1)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`Rate ${i + 1} stars`}
                >
                  <Star
                    size={22}
                    className={cn(
                      (hoverRating || rating) > i
                        ? "fill-warn text-warn"
                        : "fill-transparent text-border"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-fg-muted">Name (optional)</label>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Anonymous"
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm outline-none focus-visible:border-signal"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-fg-muted">Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike?"
              rows={3}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm outline-none focus-visible:border-signal"
            />
          </div>
          <Button type="submit" size="sm" disabled={!rating || !comment.trim()}>
            Submit review
          </Button>
        </form>
      )}

      {localReviews.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-10 text-center">
          <p className="text-sm text-fg-muted">No reviews yet. Be the first.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {localReviews.map((r) => (
            <div key={r.id} className="rounded-lg border border-border bg-bg-elevated p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{r.author}</span>
                <span className="font-mono-tight text-xs text-fg-muted">{formatDate(r.date)}</span>
              </div>
              <div className="mt-1.5">
                <RatingStars rating={r.rating} size={13} />
              </div>
              <p className="mt-2 text-sm text-fg-muted">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
