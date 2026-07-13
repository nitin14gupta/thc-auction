import { Skeleton } from "@/components/ui/Skeleton";

export function ProductSearchResultCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-ink-on-sand/10 bg-white/50">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex flex-col gap-2 p-3">
        <Skeleton className="h-3.5 w-4/5" />
        <Skeleton className="h-3 w-2/5" />
        <Skeleton className="mt-1 h-4 w-1/3" />
      </div>
    </div>
  );
}
