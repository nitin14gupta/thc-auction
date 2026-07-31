import { AuctionCard } from "@/components/ui/AuctionCard";
import { auctionCards } from "@/constants/auctions";

export function AuctionGrid() {
  return (
    <section className="bg-ink px-6 py-10 md:px-10 xl:px-16">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {auctionCards.map((auction) => (
          <AuctionCard key={auction.id} {...auction} />
        ))}
      </div>
    </section>
  );
}
