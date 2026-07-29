"use client";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuctionBrowseView } from "@/components/auctions/AuctionBrowseView";

export default function LivePage() {
  return (
    <RequireAuth>
      <div className="flex min-h-screen flex-col bg-sand">
        <Navbar />
        <main className="flex-1">
          <AuctionBrowseView
            scope="live"
            title="Live Auctions"
            subtitle="Fixed price and Buy Now listings."
          />
        </main>
        <Footer />
      </div>
    </RequireAuth>
  );
}
