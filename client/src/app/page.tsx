import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { StatsStrip } from "@/components/sections/StatsStrip";
import { FilterBar } from "@/components/sections/FilterBar";
import { AuctionGrid } from "@/components/sections/AuctionGrid";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { MarketMovesTicker } from "@/components/sections/MarketMovesTicker";
import { Newsletter } from "@/components/sections/Newsletter";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <StatsStrip />
        <FilterBar />
        <AuctionGrid />
        <HowItWorks />
        <MarketMovesTicker />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
