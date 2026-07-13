import { Skeleton } from "@/components/ui/Skeleton";

export function ListingRowSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-lg border border-ink-on-sand/10 bg-white/40 px-5 py-4">
      <div className="min-w-0 flex-1">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="mt-2 h-3 w-1/4" />
      </div>
      <Skeleton className="h-7 w-16 shrink-0" />
    </div>
  );
}
