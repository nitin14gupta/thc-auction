export function AuctionListingCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-ink-on-sand/10 bg-white/60">
      <div className="aspect-square w-full animate-pulse bg-ink-on-sand/10" />
      <div className="flex flex-col gap-1.5 p-2.5">
        <div className="h-3 w-4/5 animate-pulse rounded-md bg-ink-on-sand/10" />
        <div className="h-2.5 w-2/5 animate-pulse rounded-md bg-ink-on-sand/10" />
        <div className="mt-1 h-4 w-1/3 animate-pulse rounded-md bg-ink-on-sand/10" />
      </div>
    </div>
  );
}
