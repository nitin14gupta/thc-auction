import { Skeleton } from "@/components/ui/Skeleton";

export function AuctionDetailSkeleton() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
      <Skeleton className="aspect-square w-full rounded-lg" />

      <div>
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-20 shrink-0 rounded-md" />
        </div>
        <Skeleton className="mt-3 h-4 w-2/3" />

        <div className="mt-5 rounded-lg border border-ink-on-sand/10 bg-white/60 p-5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-2 h-6 w-40" />
        </div>

        <div className="mt-4 rounded-lg border border-ink-on-sand/10 bg-white/60 p-5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-2 h-9 w-48" />
          <Skeleton className="mt-2 h-3 w-56" />
          <Skeleton className="mt-4 h-12 w-full rounded-md" />
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-lg border border-ink-on-sand/10 bg-white/60 p-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-1.5 h-3 w-20" />
          </div>
        </div>

        <div className="mt-6">
          <Skeleton className="h-4 w-24" />
          <div className="mt-2 flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
