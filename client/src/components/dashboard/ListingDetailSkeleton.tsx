import { Skeleton } from "@/components/ui/Skeleton";

export function ListingDetailSkeleton() {
  return (
    <div className="mt-4 rounded-xl border border-ink-on-sand/10 bg-white/50 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-2 h-4 w-20" />
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full" />
        ))}
      </div>

      <div className="mt-6 border-t border-ink-on-sand/10 pt-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-2 h-10 w-40" />
      </div>
    </div>
  );
}
