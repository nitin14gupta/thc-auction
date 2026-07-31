export function AuctionListingCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-ink-on-sand/10 bg-white/60">
      <div className="aspect-square w-full animate-pulse bg-ink-on-sand/10" />
      <div className="flex flex-col gap-2 p-4">
        <div className="h-3.5 w-4/5 animate-pulse rounded-md bg-ink-on-sand/10" />
        <div className="h-3 w-2/5 animate-pulse rounded-md bg-ink-on-sand/10" />
        <div className="mt-1 h-5 w-1/3 animate-pulse rounded-md bg-ink-on-sand/10" />
      </div>
    </div>
  );
}
