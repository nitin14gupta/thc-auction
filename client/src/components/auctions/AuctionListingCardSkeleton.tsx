export function AuctionListingCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-white/10 bg-ink">
      <div className="aspect-square w-full animate-pulse bg-white/5" />
      <div className="flex flex-col gap-2 p-3">
        <div className="h-3.5 w-4/5 animate-pulse rounded-md bg-white/5" />
        <div className="h-3 w-2/5 animate-pulse rounded-md bg-white/5" />
        <div className="mt-1 h-5 w-1/3 animate-pulse rounded-md bg-white/5" />
      </div>
    </div>
  );
}
