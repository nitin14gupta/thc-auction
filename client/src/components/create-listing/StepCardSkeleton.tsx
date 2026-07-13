import { Skeleton } from "@/components/ui/Skeleton";

export function StepCardSkeleton() {
  return (
    <div className="min-w-0 flex-1 rounded-xl border border-ink-on-sand/10 bg-white/50 p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
        <Skeleton className="h-5 w-40" />
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-2/3" />
      </div>
    </div>
  );
}
