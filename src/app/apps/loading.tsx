import { AppCardSkeleton } from "@/components/ui/Skeleton";

export default function LoadingApps() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-10 space-y-3">
        <div className="h-3 w-16 animate-pulse rounded bg-border/60" />
        <div className="h-9 w-72 animate-pulse rounded bg-border/60" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-border/60" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <AppCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
