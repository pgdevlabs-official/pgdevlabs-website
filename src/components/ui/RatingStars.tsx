import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            i < Math.round(rating) ? "fill-warn text-warn" : "fill-transparent text-border"
          )}
        />
      ))}
    </div>
  );
}
