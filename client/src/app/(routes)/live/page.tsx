"use client";

import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuctionBrowseView } from "@/components/auctions/AuctionBrowseView";

export default function LivePage() {
  return (
    <div className="flex min-h-screen flex-col bg-sand">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={null}>
          <AuctionBrowseView
            scope="live"
            title="Live Auctions"
            subtitle="Fixed price and Buy Now listings."
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
