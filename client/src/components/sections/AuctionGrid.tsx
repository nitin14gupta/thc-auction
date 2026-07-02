import { Container } from "@/components/ui/Container";
import { AuctionCard } from "@/components/ui/AuctionCard";
import { auctionCards } from "@/constants/auctions";

export function AuctionGrid() {
  return (
    <section className="bg-ink py-10">
      <Container>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {auctionCards.map((auction) => (
            <AuctionCard key={auction.id} {...auction} />
          ))}
        </div>
      </Container>
    </section>
  );
}
